import axios from 'axios';
import Chat from '../models/chat.model';
import ApiMessage from '../models/api-message.model';
import Message from '../models/message.model';
import ApiChat from '../models/api-chat.model';

const baseUrl = process.env.REACT_APP_API_URL as string;

const chatsEndpoint = `${baseUrl}/chats`;
const chatMessagesEndpoint = `${baseUrl}/chats/:chatId/messages`;
const chatMessageEndpoint = `${baseUrl}/chats/:chatId/messages/:messageId`;

/**
 * Creates a chat with the chat API.
 * 
 * It returns the created chat object and the opener message.
 * We also parse the opener messages as a 'bot' message to display in the UI.
 */
export const createChat = async (): Promise<Chat | undefined> => {
    try {
        const response = await axios.post(chatsEndpoint, {});
        const chat = response.data as ApiChat;

        const apiMessages = chat.messages as ApiMessage[];
        const frontendMessages = apiMessages.map((message: ApiMessage) => {
            return {
                id: message.id,
                sender: 'bot',
                body: message.body,
                sent_at: new Date(message.sent_at),
            } as Message;
        });

        return {
            ...chat,
            messages: frontendMessages,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Sends a message to the chat API.
 * 
 * The returned message is a Message + Reply in a single object.
 * We split this into two separate messages to display in the UI, and handle them as only Message objects.
 */
export const sendMessage = async (chat: Chat, body: string) => {
    const url = chatMessagesEndpoint.replace(':chatId', chat.id);
    try {
        const response = await axios.post(url, { body });

        const messageAndReply = response.data as ApiMessage;

        return [
            {
                ...messageAndReply,
                sender: 'human',
                sent_at: new Date(messageAndReply.sent_at),
            },
            {
                id: `${messageAndReply.id}-reply`,
                sender: 'bot',
                body: messageAndReply.reply,
                sent_at: new Date(messageAndReply.replied_at),
            },
        ] as Message[];
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Edits a message using the chat API.
 * 
 * The returned message is a Message + Reply in a single object.
 * We split this into two separate messages to display in the UI, and handle them as only Message objects.
 */
export const editMessage = async (chat: Chat, message: Message, newBody: string) => {
    const url = chatMessageEndpoint.replace(':chatId', chat.id).replace(':messageId', message.id);
    try {
        const response = await axios.patch(url, { body: newBody });

        const messageAndReply = response.data as ApiMessage;
        const updatedAt = new Date(messageAndReply.updated_at!);

        return [
            {
                ...messageAndReply,
                updated_at: updatedAt,
                sender: 'human',
            },
            {
                // We use the updated_at timestamp to ensure the new ID re-renders in the UI.
                id: `${messageAndReply.id}-reply-${updatedAt.getTime()}`,
                sender: 'bot',
                body: messageAndReply.reply,
                sent_at: new Date(messageAndReply.replied_at),
            },
        ] as Message[];
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Deletes a message using the chat API.
 */
export const deleteMessage = async (chat: Chat, message: Message) => {
    const url = chatMessageEndpoint.replace(':chatId', chat.id).replace(':messageId', message.id);
    try {
        await axios.delete(url);
    } catch (error) {
        console.error(error);
        throw error;
    }
};
