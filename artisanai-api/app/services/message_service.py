from datetime import datetime
from typing import List, Optional
from uuid import UUID

from ..models import Message


class MessageService:
    """A service for managing messages in a chat application.

    This service uses local memory for simplicity, but a persistent storage should be used instead.
    """
    messages = {}
    messages_by_chat = {}

    @staticmethod
    def create_message(chat_id: UUID, body: str) -> Message:
        body = body.strip()[:Message.MAX_MESSAGE_LENGTH]

        message = Message(
            chat_id=chat_id,
            body=body,
        )
        MessageService.messages[message.id] = message
        MessageService.messages_by_chat.setdefault(chat_id, []).append(message)
        return message

    @staticmethod
    def get_message(message_id: UUID) -> Optional[Message]:
        return MessageService.messages.get(message_id)

    @staticmethod
    def get_chat_messages(chat_id: UUID) -> List[Message]:
        """Returns all active (non-deleted) messages in a chat.
        """
        all_messages = MessageService.messages_by_chat.get(chat_id, [])
        return [message for message in all_messages if not message.deleted_at]

    @staticmethod
    def update_message_body(message: Message, new_body: str) -> bool:
        """Updates the body of a message.
        
        Only active (non-deleted) messages can be updated.
        Only the last message in a chat can be updated.
        
        returns: True if the reply was set, False otherwise
        """
        if message.deleted_at:
            return False

        if not MessageService._is_last_active_message(message):
            return False

        message.body = new_body
        message.updated_at = datetime.now()
        return True

    @staticmethod
    def set_message_reply(message: Message, reply: str) -> bool:
        """Sets a reply to a message.
        
        Only active (non-deleted) messages can be replied to.
        
        returns: True if the reply was set, False otherwise
        """
        if message.deleted_at:
            return False

        message.reply = reply
        message.replied_at = datetime.now()
        return True

    @staticmethod
    def delete_message(message: Message) -> bool:
        """Deletes a message.

        Only active (non-deleted) messages can be deleted.
        Only the last message in a chat can be deleted.

        returns: True if the message was deleted, False otherwise
        """
        if message.deleted_at:
            return False

        if not MessageService._is_last_active_message(message):
            return False

        message.deleted_at = datetime.now()
        return True

    @staticmethod
    def _is_last_active_message(message: Message) -> bool:
        """Checks if a message is the last active (non-deleted) message in a list of messages.
        """
        chat_messages = MessageService.messages_by_chat.get(message.chat_id, [])
        last_message = MessageService._get_last_active_message(chat_messages)
        return last_message and last_message.id == message.id

    @staticmethod
    def _get_last_active_message(messages: List[Message]) -> Optional[Message]:
        """Returns the last active (non-deleted) message in a list of messages.
        """
        for i in range(len(messages) - 1, -1, -1):
            if not messages[i].deleted_at:
                return messages[i]
