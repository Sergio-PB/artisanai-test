from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.models import Message
from app.services import ChatbotService, ChatService, MessageService
from app.view_models import MessageCreateRequest, MessageEditRequest

router = APIRouter()

@router.post('/chats/{chat_id}/messages')
def create_message(chat_id: UUID, message_request: MessageCreateRequest) -> Message:
    chat = ChatService.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Chat not found')

    message = MessageService.create_message(chat_id, message_request.body)
    reply = ChatbotService.generate_reply(chat, message)
    set_reply_worked = MessageService.set_message_reply(message, reply)
    if not set_reply_worked:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to set reply')
    return message


@router.patch('/chats/{chat_id}/messages/{message_id}')
def edit_message(chat_id: UUID, message_id: UUID, message_request: MessageEditRequest) -> Message:
    chat = ChatService.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Chat not found')

    message = MessageService.get_message(message_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Message not found')

    if message.chat_id != chat_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Message does not belong to the specified chat')

    if message.deleted_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Message has been deleted')

    update_worked = MessageService.update_message_body(message, message_request.body)
    if not update_worked:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to update message body')

    new_reply = ChatbotService.generate_reply(chat, message)
    set_reply_worked = MessageService.set_message_reply(message, new_reply)
    if not set_reply_worked:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to set new reply')

    return message


@router.delete('/chats/{chat_id}/messages/{message_id}')
def delete_message(chat_id: UUID, message_id: UUID) -> None:
    chat = ChatService.get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Chat not found')

    message = MessageService.get_message(message_id)
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Message not found')

    if message.chat_id != chat_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Message does not belong to the specified chat')

    delete_worked = MessageService.delete_message(message)
    if not delete_worked:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to delete message')
