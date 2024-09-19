import { FC } from 'react';
import Message from '../models/message.model';
import ChatMessage from './ChatMessage';


interface ChatPanelBodyProps {
    messages: Message[];
    onEdited: (args: {index: number, message: Message, newBody: string}) => void;
    onDeleted: (args: {index: number, message: Message}) => void;
}

const ChatPanelBody: FC<ChatPanelBodyProps> = ({ messages, onEdited, onDeleted }) => (
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
                onEdited={onEdited}
                onDeleted={onDeleted}
            />
        ))}
    </div>
);

export default ChatPanelBody;
