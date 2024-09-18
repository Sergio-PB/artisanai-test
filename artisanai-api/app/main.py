
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .middlewares import AuthenticatedUserMiddleware
from .routers import chats, messages

app = FastAPI()

app.add_middleware(AuthenticatedUserMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:3000',

        # For AWS health checks
        os.environ.get('EC2_PRIVATE_IP'),

        # For simplicity, if creating a new distribution, etc...
        '*',

        # In production, we would want set either the CloudFront distribution domain:
        # 'https://did1zl67m0vwv.cloudfront.net',
        # Or the DNS domain:
        # 'https://artisanai.com',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(chats.router)
app.include_router(messages.router)


@app.get('/')
def root():
    return {'message': 'Hello Artisanians!'}
