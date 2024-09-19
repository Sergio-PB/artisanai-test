import { FC, FormEvent } from 'react';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/esm/DropdownButton';
import ButtonGroup from 'react-bootstrap/esm/ButtonGroup';
import Dropdown from 'react-bootstrap/esm/Dropdown';

interface ChatPanelFooterProps {
    maxMessageLength: number;
    onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
}

const ChatPanelFooter: FC<ChatPanelFooterProps> = ({ maxMessageLength, onSendMessage }) => (
    <div className="chat-footer p-3">
        <form onSubmit={onSendMessage}>
            <div className="d-flex flex-column">
                <div className="row mb-3">
                    <div className="d-flex">
                        <input name="newMessageBody" type="text" className="form-control" aria-required="true" maxLength={maxMessageLength} />
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
);

export default ChatPanelFooter;
