from typing import Optional
from uuid import UUID

from ..models import Chat
from .message_service import MessageService


class ChatService:
    chats = {}

    @staticmethod
    def create_chat(user_id: Optional[UUID] = None) -> Chat:
        chat = Chat(
            user_id=user_id,
        )
        ChatService.chats[chat.id] = chat
        return chat

    @staticmethod
    def get_chat(chat_id: UUID) -> Optional[Chat]:
        chat = ChatService.chats.get(chat_id)
        if not chat:
            return None

        chat.messages = MessageService.get_chat_messages(chat_id)
        return chat
