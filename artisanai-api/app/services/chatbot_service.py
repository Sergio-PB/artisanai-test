
from ..models import Chat, Message


class ChatbotService:
    @staticmethod
    def generate_reply(chat: Chat, new_message: Message) -> str:
        """Generate a reply to a new message in a chat.
        
        This is a dummy service for now. The next step is to integrate this with an AI model.
        @TODO Integrate using Langchain
        """
        reply = f'Very interesting, "{new_message.body}" is the {len(chat.messages)}th message'
        return reply
