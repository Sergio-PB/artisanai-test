
from fastapi import FastAPI

from .middlewares import AuthenticatedUserMiddleware
from .routers import chats, messages

app = FastAPI()

app.add_middleware(AuthenticatedUserMiddleware)

app.include_router(chats.router)
app.include_router(messages.router)


@app.get('/')
def root():
    return {'message': 'Hello Artisanians!'}
