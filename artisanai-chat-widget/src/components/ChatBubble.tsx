import { FC } from 'react';

interface ChatBubbleProps {
    onClick: () => void;
}

const ChatBubble: FC<ChatBubbleProps> = ({ onClick }) => {
    return (
        <div className="position-fixed bottom-0 end-0 p-4">
            <button className="btn btn-primary rounded-circle shadow" onClick={onClick}>
                <i className="bi bi-chat-dots fs-1"></i>
            </button>
        </div>
    );
};

export default ChatBubble;
