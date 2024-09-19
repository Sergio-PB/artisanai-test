import { FC } from 'react';
import Button from 'react-bootstrap/Button';
import { PanelSize } from '../enums/panel-size';


interface ChatPanelHeaderProps {
    size: PanelSize;
    handleToggleSize: () => void;
    onClose: () => void;
}

const ChatPanelHeader: FC<ChatPanelHeaderProps> = ({ size, handleToggleSize, onClose }) => (
    <div className="chat-header">
        <Button variant="link" className="float-start" aria-label="Toggle chat box size" onClick={handleToggleSize}>
            {size === PanelSize.Mini && (<i className="bi bi-arrows-angle-expand"></i>)}
            {size === PanelSize.Maxi && (<i className="bi bi-arrows-angle-contract"></i>)}
        </Button>
        <Button variant="link" className="float-end" onClick={onClose} aria-label="Close chat">
            <i className="bi bi-x"></i>
        </Button>
    </div>
);

export default ChatPanelHeader;
