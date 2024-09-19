import { FC, FormEvent, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/esm/DropdownButton';
import ButtonGroup from 'react-bootstrap/esm/ButtonGroup';
import Dropdown from 'react-bootstrap/esm/Dropdown';
import { createChat, deleteMessage, editMessage, sendMessage } from '../api/api';
import Chat from '../models/chat.model';
import ChatMessage from './ChatMessage';
import Message from '../models/message.model';
import { PanelSize } from '../enums/panel-size';
import ChatPanelHeader from './ChatPanelHeader';
import ChatPanelBody from './ChatPanelBody';
import ChatPanelFooter from './ChatPanelFooter';

interface ChatPanelProps {
    onClose: () => void;
    onError: (errorMessage: string) => void;
}

const ChatPanel: FC<ChatPanelProps> = ({ onClose, onError }) => {
    const [size, setSize] = useState<PanelSize>(PanelSize.Mini);
    const [chat, setChat] = useState<Chat | undefined>();
    const [messages, setMessages] = useState<Message[]>([]);
    const maxMessageLength = 100;

    useEffect(() => {
        createChat()
            .then((chat) => {
                if (!chat) {
                    return;
                }
                setChat(chat);
                setMessages(chat.messages);
            })
            .catch((error) => {
                onError(`Error creating chat: ${error}`);
            });
    }, [onError]);

    /**
     * Sending a message takes some time, so we show the message immediately in the UI as a local message.
     * Then, once we get the response from the server, we update the messages with the actual data.
     */
    const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newMessageBody = (event.target as any).newMessageBody.value;
        if (!newMessageBody) {
            return;
        }
        (event.target as any).newMessageBody.value = '';

        const localMessage = {
            id: 'local-id',
            sent_at: new Date(),
            sender: 'human',
            body: newMessageBody,
        } as Message;
    
        const originalMessages = [...messages];
        setMessages([...messages, localMessage]);
        scrollToBottom();

        if (!chat) {
            onError('Please close and re-open this chat box. Thank you.');
            return;
        }
        sendMessage(chat, newMessageBody)
            .then((messages) => {
                if (!messages) {
                    onError('No reply from server');
                    return;
                }
                setMessages([...originalMessages, ...messages]);
                scrollToBottom();
            })
            .catch((error) => {
                onError(`Error sending message: ${error}`);
            });
    };

    /**
     * Editing a message takes some time, so we show the message immediately in the UI as a local message.
     * Then, once we get the response from the server, we update the messages with the actual data.
     */
    const handleEditMessage = ({index, message, newBody}: {index: number, message: Message, newBody: string}) => {
        if (!chat) {
            onError('Please close and re-open this chat box. Thank you.');
            return;
        }
        if (!newBody || newBody === message.body) {
            return;
        }

        const localUpdatedMessage = {
            ...message,
            updated_at: new Date(),
            body: newBody,
        } as Message;

        const botMessageIndex = index + 1;
        const localUpdatedBotMessage = {
            ...messages[botMessageIndex],
            id: `local-${messages[botMessageIndex].id}`,
        } as Message;
    
        const originalMessages = [...messages];
        const localMessages = [...messages];
        localMessages[index] = localUpdatedMessage;
        localMessages[botMessageIndex] = localUpdatedBotMessage;
        setMessages(localMessages);

        editMessage(chat, message, newBody)
        .then(([userMessage, botMessage]) => {
            if (!userMessage || !botMessage) {
                onError('No reply from server');
                return;
            }
            const updatedMessages = [...originalMessages];
            updatedMessages[index] = userMessage;
            updatedMessages[botMessageIndex] = botMessage;
            setMessages(updatedMessages);
        })
        .catch((error) => {
            onError(`Error editing message: ${error}`);
            setMessages(originalMessages);
        });
    };

    /**
     * Editing a message takes some time, so we show the message immediately in the UI as a local message.
     * Then, once we get the response from the server, we update the messages with the actual data.
     */
    const handleDeleteMessage = ({index, message}: {index: number, message: Message}) => {
        if (!chat) {
            onError('Please close and re-open this chat box. Thank you.');
            return;
        }
    
        const originalMessages = [...messages];
        const updatedMessages = messages.slice(0, index);
        setMessages(updatedMessages);

        deleteMessage(chat, message)
            .catch((error) => {
                setMessages(originalMessages);
                onError(`Error deleting message: ${error}`);
            });
    };

    const scrollToBottom = () => {
        const chatBox = document.getElementById('chat');
        if (!chatBox) {
            return;
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    const handleToggleSize = () => {
        setSize(size === PanelSize.Mini ? PanelSize.Maxi : PanelSize.Mini);
    };

    return (
        <div className={`chat-panel ${size}`}>
            <ChatPanelHeader size={size} handleToggleSize={handleToggleSize} onClose={onClose} />

            <ChatPanelBody messages={messages} onEdited={handleEditMessage} onDeleted={handleDeleteMessage} />

            <ChatPanelFooter maxMessageLength={maxMessageLength} onSendMessage={handleSendMessage} />
        </div>
    );
};

export default ChatPanel;
