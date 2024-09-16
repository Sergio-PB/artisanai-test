import unittest
from datetime import datetime

from app.models import Chat, Message
from app.services import ChatService, MessageService


class TestMessageService(unittest.TestCase):

    def setUp(self):
        self.setup_datetime = datetime.now()
        self.chat = Chat(
            user_id=None,
            messages=[],
            created_at=self.setup_datetime,
            deleted_at=None
        )
        ChatService.chats[self.chat.id] = self.chat
        self.message1 = Message(
            chat_id=self.chat.id,
            body='Hello',
            reply='Hi there!',
            replied_at=self.setup_datetime,
        )
        self.message2 = Message(
            chat_id=self.chat.id,
            body='What do you offer?',
            deleted_at=self.setup_datetime,
            reply='I can offer you a great deal!',
            replied_at=self.setup_datetime,
        )
        self.message3 = Message(
            chat_id=self.chat.id,
            body='Is this a scam?',
            reply='No, it is not a scam.',
            replied_at=self.setup_datetime,
        )

        MessageService.messages = {
            self.message1.id: self.message1,
            self.message2.id: self.message2,
            self.message3.id: self.message3
        }

        MessageService.messages_by_chat = {
            self.chat.id: [self.message1, self.message2, self.message3]
        }

    def test_given_chat_id_and_body_when_create_message_then_defaults_expected(self):
        # Arrange
        chat_id = self.chat.id
        body = 'Hello, World!'

        # Act
        message = MessageService.create_message(chat_id, body)

        # Assert
        self.assertIsInstance(message, Message)
        self.assertEqual(message.body, body)
        self.assertEqual(message.chat_id, chat_id)
        self.assertIsNone(message.reply)
        self.assertIsNotNone(message.sent_at)
        self.assertIsNone(message.replied_at)
        self.assertIsNone(message.updated_at)
        self.assertIsNone(message.deleted_at)

    def test_given_message_id_when_get_message_then_retrieved_message_has_expected_body(self):
        # Arrange
        message_id = self.message2.id
        expected_body = 'What do you offer?'

        # Act
        retrieved_message = MessageService.get_message(message_id)

        # Assert
        self.assertEqual(retrieved_message.body, expected_body)

    def test_given_chat_id_when_get_chat_messages_then_retrieved_active_messages(self):
        # Arrange
        chat_id = self.chat.id
        expected_messages = [self.message1, self.message3]

        # Act
        chat_messages = MessageService.get_chat_messages(chat_id)

        # Assert
        self.assertEqual(chat_messages, expected_messages)

    def test_given_message_id_and_body_when_update_message_body_then_message_expected_body_and_timestamp(self):
        # Arrange
        message = self.message3
        message_id = message.id
        new_body = 'Is this a unit test then?'

        # Act
        result = MessageService.update_message_body(message, new_body)

        # Assert
        self.assertTrue(result)
        updated_message = MessageService.get_message(message_id)
        self.assertEqual(updated_message.body, new_body)
        self.assertIsNotNone(updated_message.updated_at)
        self.assertNotEqual(updated_message.updated_at, self.setup_datetime)

    def test_given_message_id_and_body_when_update_message_body_and_not_last_message_then_false(self):
        # Arrange
        message = self.message1
        message_id = message.id
        new_body = 'Hello, Universe!'
        expected_body = 'Hello'

        # Act
        result = MessageService.update_message_body(message, new_body)

        # Assert
        self.assertFalse(result)
        updated_message = MessageService.get_message(message_id)
        self.assertEqual(updated_message.body, expected_body)
        self.assertIsNone(updated_message.updated_at)


    def test_given_message_id_and_reply_when_set_message_reply_then_expected_reply_and_timestamp(self):
        # Arrange
        message = self.message1
        message_id = message.id
        new_reply = 'Hey Sergio, good to see you around'

        # Act
        result = MessageService.set_message_reply(message, new_reply)

        # Assert
        self.assertTrue(result)
        updated_message = MessageService.get_message(message_id)
        self.assertEqual(updated_message.reply, new_reply)
        self.assertIsNotNone(updated_message.replied_at)
        self.assertNotEqual(updated_message.replied_at, self.setup_datetime)
    
    def test_given_message_id_when_delete_message_then_message_deleted_and_timestamp(self):
        # Arrange
        message = self.message3
        message_id = message.id

        # Act
        result = MessageService.delete_message(message)

        # Assert
        self.assertTrue(result)
        deleted_message = MessageService.get_message(message_id)
        self.assertIsNotNone(deleted_message.deleted_at)
        self.assertNotEqual(deleted_message.deleted_at, self.setup_datetime)
    
    def test_given_message_id_when_delete_message_and_message_already_deleted_then_false(self):
        # Arrange
        message = self.message2
        message_id = message.id
        expected_deleted_at = self.setup_datetime

        # Act
        result = MessageService.delete_message(message)

        # Assert
        self.assertFalse(result)
        deleted_message = MessageService.get_message(message_id)
        self.assertIsNotNone(deleted_message.deleted_at)
        self.assertEqual(deleted_message.deleted_at, expected_deleted_at)
    
    def test_given_message_id_when_delete_message_and_not_last_message_then_false(self):
        # Arrange
        message = self.message1
        message_id = message.id

        # Act
        result = MessageService.delete_message(message)

        # Assert
        self.assertFalse(result)
        deleted_message = MessageService.get_message(message_id)
        self.assertIsNone(deleted_message.deleted_at)
    
    def test_given_message_id_when_update_message_body_and_message_already_deleted_then_false(self):
        # Arrange
        message = self.message2
        message_id = message.id
        new_body = 'Hello, Universe!'
        expected_body = 'What do you offer?'

        # Act
        result = MessageService.update_message_body(message, new_body)

        # Assert
        self.assertFalse(result)
        updated_message = MessageService.get_message(message_id)
        self.assertEqual(updated_message.body, expected_body)
        self.assertIsNone(updated_message.updated_at)

    def test_given_message_id_when_set_message_reply_and_message_already_deleted_then_false(self):
        # Arrange
        message = self.message2
        message_id = message.id
        new_reply = 'Hey ArtisanAI, good to see you around'
        expected_reply = 'I can offer you a great deal!'
        expected_replied_at = self.setup_datetime

        # Act
        result = MessageService.set_message_reply(message, new_reply)

        # Assert
        self.assertFalse(result)
        updated_message = MessageService.get_message(message_id)
        self.assertEqual(updated_message.reply, expected_reply)
        self.assertEqual(updated_message.replied_at, expected_replied_at)
    
    def test_given_empty_chat_and_message_id_when_delete_message_then_false(self):
        # Arrange
        chat = ChatService.create_chat()
        message = Message(
            chat_id=chat.id,
            body='Hello',
            reply='Hi there!',
            replied_at=self.setup_datetime,
        )

        # Act
        result = MessageService.delete_message(message)

        # Assert
        self.assertFalse(result)
