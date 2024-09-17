
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
