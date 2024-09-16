from fastapi import APIRouter

from app.models import Chat
from app.services import ChatService
from app.view_models import ChatCreateRequest

router = APIRouter()


@router.post('/chats')
def create_chat(_: ChatCreateRequest) -> Chat:
    return ChatService.create_chat()
