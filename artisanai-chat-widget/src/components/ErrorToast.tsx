import { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Toast from 'react-bootstrap/Toast';

interface ChatPanelProps {
    message: string;
}

const ErrorToast: React.FC<ChatPanelProps> = ({ message }) => {
    const [show, setShow] = useState(true);

    const toggleShow = () => setShow(!show);

    return (
        <Row>
            <Col md={6} className="mb-2 w-100">
                <Toast show={show} onClose={toggleShow} bg="danger" delay={3000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">Oops!</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">{message}</Toast.Body>
                </Toast>
            </Col>
        </Row>
    );
}

export default ErrorToast;
