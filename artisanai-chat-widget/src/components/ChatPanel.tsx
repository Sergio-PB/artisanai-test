import React, { useEffect, useState } from 'react';
import { createChat, deleteMessage, editMessage, sendMessage } from '../api/api';
import Chat from '../models/chat.model';
import ChatMessage from './ChatMessage';
import Message from '../models/message.model';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/esm/DropdownButton';
import ButtonGroup from 'react-bootstrap/esm/ButtonGroup';
import Dropdown from 'react-bootstrap/esm/Dropdown';

enum PanelSize {
    Mini = 'mini',
    Maxi = 'maxi',
}

interface ChatPanelProps {
    onClose: () => void;
    onError: (errorMessage: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onClose, onError }) => {
    const [size, setSize] = useState<PanelSize>(PanelSize.Mini);
    const [chat, setChat] = useState<Chat | undefined>();
    const [messages, setMessages] = useState<Message[]>([]);

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
    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
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
            <div className="chat-header">
                <Button variant="link" className="float-start" aria-label="Toggle chat box size" onClick={handleToggleSize}>
                    {size === PanelSize.Mini && (<i className="bi bi-arrows-angle-expand"></i>)}
                    {size === PanelSize.Maxi && (<i className="bi bi-arrows-angle-contract"></i>)}
                </Button>
                <Button variant="link" className="float-end" onClick={onClose} aria-label="Close chat">
                    <i className="bi bi-x"></i>
                </Button>
            </div>

            <div id="chat" className="chat-body">
                <div className="intro-message my-3">
                    <i className="bi bi-emoji-smile"></i>
                    <h4>Hi 👋, I'm Ava</h4>
                    <h6 className="text-muted">Ask me anything or pick a place to start</h6>
                </div>
                {messages.map((message, index) => (
                    <ChatMessage
                        index={index}
                        message={message}
                        isEditable={message.sender === 'human' && index === messages.length-2}
                        onEdited={handleEditMessage}
                        onDeleted={handleDeleteMessage}
                    />
                ))}
            </div>

            <div className="chat-footer p-3">
                <form onSubmit={handleSendMessage}>
                    <div className="d-flex flex-column">
                        <div className="row mb-3">
                            <div className="d-flex">
                                <input name="newMessageBody" type="text" className="form-control" aria-required="true" />
                                <i className="bi bi-person-circle user-avatar"></i>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between">
                            <div className="align-content-center">
                                <strong className="text-muted me-2">Context</strong>
                                <DropdownButton
                                    as={ButtonGroup}
                                    size="sm"
                                    variant="outline-secondary"
                                    title="Onboarding"
                                    disabled={true}
                                    aria-label="Chat context selector"
                                >
                                    <Dropdown.Item eventKey="1">Onboarding</Dropdown.Item>
                                    <Dropdown.Item eventKey="2">Advanced</Dropdown.Item>
                                </DropdownButton>
                            </div>
                            <div className="footer-actions">
                                <Button variant="outline-secondary" disabled={true} className="p-0 px-1 border-0" aria-label="Chatbox options">
                                    <i className="bi bi-gear"></i>
                                </Button>
                                <Button variant="outline-primary" type="submit" className="p-0 border-0" aria-label="Send message">
                                    <i className="bi bi-send"></i>
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
