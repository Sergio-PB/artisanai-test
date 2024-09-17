import React, { useState } from 'react';
import ChatBubble from './ChatBubble';
import ChatPanel from './ChatPanel';
import './ChatWidget.scss';

enum WidgetMode {
    Collapsed,
    Expanded,
}

interface ChatWidgetProps {
    onError: (errorMessage: string) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onError }) => {
    const [mode, setMode] = useState<WidgetMode>(WidgetMode.Collapsed);

    const handleClickBubble = () => {
        setMode(WidgetMode.Expanded);
    };

    const handleClosePanel = () => {
        setMode(WidgetMode.Collapsed);
    };

    return (
        <div className="w-100 h-100 align-content-center text-center">
            {mode === WidgetMode.Collapsed ? (
                <ChatBubble onClick={handleClickBubble} aria-label="Start chat"/>
            ) : (
                <ChatPanel onClose={handleClosePanel} onError={onError}/>
            )}
        </div>
    );
};

export default ChatWidget;
