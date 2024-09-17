import { useState } from "react";
import Message from "../models/message.model";

export enum MessageMode {
    View = 'view',
    Edit = 'edit',
}

interface ChatMessageProps {
    index: number;
    message: Message;
    isEditable: boolean;
    onEdited: ({index, message, newBody}: {index: number, message: Message, newBody: string}) => void;
    onDeleted: ({index, message}: {index: number, message: Message}) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ index, message, isEditable, onEdited, onDeleted }) => {
    const [mode, setMode] = useState(MessageMode.View);

    const emojiForIndex = (index: number) => {
        const emojis = [
            'bi-emoji-smile',
            'bi-emoji-laughing',
            'bi-emoji-wink',
            'bi-emoji-heart-eyes',
            'bi-emoji-sunglasses',
            'bi-emoji-smile-beam',
            'bi-emoji-smile-upside-down',
            'bi-emoji-frown',
            'bi-emoji-angry',
            'bi-emoji-dizzy',
        ];
        return emojis[index % emojis.length];
    };

    const handleClick = () => {
        if (mode === MessageMode.Edit) {
            setMode(MessageMode.View);
            return;
        }

        if (isEditable) {
            setMode(MessageMode.Edit);
        }
    };

    const handleTrashClick = () => {
        if (!window.confirm('Are you sure you want to delete this message?')) {
            return;
        }
        setMode(MessageMode.View);
        onDeleted({index, message});
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newBody = (event.target as any).newBody.value;
        onEdited({index, message, newBody});
        setMode(MessageMode.View);
    }

    return (
        <div
            key={message.id}
            className={`message ${message.sender}`}
            aria-label={`Message from ${message.sender}`}
        >
            {isEditable && mode === MessageMode.View && (
                <i className="bi bi-pencil-fill" onClick={handleClick}></i>
            )}
            {isEditable && mode === MessageMode.Edit && (
                <i className="bi bi-trash" onClick={handleTrashClick}></i>
            )}
            {message.sender === 'bot' && (
                <i className={`bi ${emojiForIndex(index)}`}></i>
            )}
            {mode === MessageMode.Edit ? (
                <form onSubmit={handleSubmit} >
                    <p>
                        <input
                            type="text"
                            name="newBody"
                            defaultValue={message.body}
                            autoFocus
                        />
                    </p>
                </form>
            ) : (
                <p className="user-select-all">
                    {message.body}
                </p>
            )}
        </div>
    )
};

export default ChatMessage;
