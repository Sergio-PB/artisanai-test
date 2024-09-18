import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { RemovalPolicy } from 'aws-cdk-lib';
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

    // Create an EC2 instance along with a vpc and security group
    // It allows HTTP traffic on port 80 and port 22
    this.createEc2Instance();
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

  private createEc2Instance() {
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true,
    });

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
      ec2.Port.tcp(22),
      'Allow SSH traffic'
    );
  
    const keyPair = new ec2.KeyPair(
        this,
        'Ec2KeyPair',
    )

    const ec2Instance = new ec2.Instance(this, 'Ec2Instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup,
      keyPair,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
    });

    const dockerRunCommand = `docker run --rm -e EC2_PRIVATE_IP=$EC2_PRIVATE_IP --name artisanai-api -d -p 80:8000 ${InfrastructureStack.dockerImage}`;
    // The 'user data' is a script that will run when the EC2 instance starts
    // It will start a Docker container with the ArtisanAI API
    ec2Instance.addUserData(
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
      //   Command 'restart' will restart the container
      `echo "alias restart=\'docker restart artisanai-api\'" >> /home/ec2-user/.bashrc`,
      //   Command 'redeploy' will pull the latest image and restart the container
      `echo "alias restart=\'pull; restart\'" >> /home/ec2-user/.bashrc`,
    );

    new cdk.CfnOutput(this, 'Ec2PublicEndpoint', {
      value: `http://${ec2Instance.instancePublicDnsName}`,
    });

    new cdk.CfnOutput(this, 'Ec2PublicEndpointDocs', {
      value: `http://${ec2Instance.instancePublicDnsName}/docs`,
    });

    return ec2Instance;
  }
}
