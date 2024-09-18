import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { RemovalPolicy } from 'aws-cdk-lib';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import path = require('path');

export class InfrastructureStack extends cdk.Stack {
  static dockerImage = 'sergiopb/artisanai-api';
  static frontendBucketName = 'artisanai-chatbot-widget';
  static frontendBuildPath = path.join(__dirname, '../../artisanai-chat-widget/build');

  private static indexDocument = 'index.html';

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the S3 bucket and CloudFront distribution
    // Upload the contents of `frontendBuildPath` to the bucket
    // Outputs the CloudFront URL
    this.createFrontendResources();

    // Create an Application Load Balancer that targets an EC2 auto-scaling group
    // It allows HTTP traffic on port 80, 443, and 22 through a security group
    // Outputs the Load Balancer URL
    this.createBackendResources();
  }

  private createFrontendResources() {
    const bucket = new Bucket(this, 'Bucket', {
      bucketName: InfrastructureStack.frontendBucketName,
      accessControl: BucketAccessControl.PRIVATE,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: InfrastructureStack.indexDocument,
    });

    // Upload the build folder to the S3 bucket
    new BucketDeployment(this, 'ChatbotWidgetBucketDeployment', {
      sources: [
        Source.asset(InfrastructureStack.frontendBuildPath),
      ],
      destinationBucket: bucket,
    });

    const distribution = new Distribution(this, 'Distribution', {
      defaultRootObject: InfrastructureStack.indexDocument,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
      },
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });
  }

  private createBackendResources() {
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true,
    });
  
    const ec2TargetGroup = this.createEc2AutoScalingGroup(vpc);

    this.createLoadBalancer(vpc, ec2TargetGroup);
  }

  private createEc2AutoScalingGroup(vpc: cdk.aws_ec2.IVpc) {
    const securityGroup = this.createSecurityGroup(vpc);

    const keyPair = new ec2.KeyPair(
      this,
      'Ec2KeyPair'
    );

    // The 'user data' is a script that will run when the EC2 instance starts
    // It will start a Docker container with the ArtisanAI API
    const userData = this.buildUserData();

    const ec2TargetGroup = new AutoScalingGroup(this, 'Ec2AutoScalingGroup', {
      vpc,
      keyPair,
      securityGroup,
      userData,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      minCapacity: 1,
      maxCapacity: 1,
    });
    return ec2TargetGroup;
  }

  private buildUserData() {
    const userData = ec2.UserData.forLinux();
    const dockerRunCommand = `docker run --rm -e EC2_PRIVATE_IP=$EC2_PRIVATE_IP --name artisanai-api -d -p 80:8000 ${InfrastructureStack.dockerImage}`;
    userData.addCommands(
      // Install Docker
      'yum update -y',
      'yum install docker -y',

      // Start Docker
      'systemctl start docker',

      // Get the private IP of the EC2 instance
      'EC2_PRIVATE_IP=$(ec2-metadata --local-ipv4 | cut -d " " -f 2)',

      // Run the Docker container (will pull the image from Docker Hub)
      //   Maps the FastAPI port 8000 to the EC2 instance port 80
      dockerRunCommand,

      // Give the ec2-user permission to run Docker commands
      'usermod -aG docker ec2-user',

      // Give the ec2-user helper commands to manage the Docker container
      //   Command 'attach' will attach to the container's logs
      'echo "alias attach=\'docker attach artisanai-api\'" >> /home/ec2-user/.bashrc',
      //   Command 'enter' will enter the container's shell
      'echo "alias enter=\'docker exec -it artisanai-api /bin/bash\'" >> /home/ec2-user/.bashrc',
      //   Command 'run' will run the container
      `echo "alias run=\'${dockerRunCommand}\'" >> /home/ec2-user/.bashrc`,
      //   Command 'pull' will pull the latest image
      `echo "alias pull=\'docker pull ${InfrastructureStack.dockerImage}\'" >> /home/ec2-user/.bashrc`,
      //   Command 'kill' will kill the container
      `echo "alias kill=\'docker kill artisanai-api\'" >> /home/ec2-user/.bashrc`,
      //   Command 'redeploy' will pull the latest image and restart the container
      `echo "alias redeploy=\'pull; kill; run\'" >> /home/ec2-user/.bashrc`
    );
    return userData;
  }

  private createSecurityGroup(vpc: cdk.aws_ec2.IVpc) {
    const securityGroup = new ec2.SecurityGroup(this, 'Ec2Sg', {
      vpc,
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic'
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH traffic'
    );

    securityGroup.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.allTraffic(),
      'Allow all outboud traffic'
    );

    return securityGroup;
  }

  private createLoadBalancer(vpc: cdk.aws_ec2.IVpc, ec2TargetGroup: cdk.aws_autoscaling.AutoScalingGroup) {
    const loadBalancer = new ApplicationLoadBalancer(this, 'Ec2LoadBalancer', {
      vpc,
      internetFacing: true,
    });

    const httpListener = loadBalancer.addListener('HttpListener', {
      port: 80,
      open: true,
    });

    const httpsListener = loadBalancer.addListener('HttpsListener', {
      port: 443,
      open: true,
      certificates: [{
        // Replace with your own certificate ARN
        certificateArn: 'arn:aws:acm:us-east-1:564565010751:certificate/707e04dc-bbd6-496e-b219-bbdde611c8c4',
      }],
    });

    httpListener.addTargets('HttpTargetEc2Instance', {
      port: 80,
      targets: [ec2TargetGroup],
    });

    httpsListener.addTargets('HttpsTargetEc2Instance', {
      port: 80,
      targets: [ec2TargetGroup],
    });

    new cdk.CfnOutput(this, 'BackendPublicEndpoint', {
      value: `http://${loadBalancer.loadBalancerDnsName}`,
    });
  }
}
