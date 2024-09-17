export default interface Message {
    id: string;
    sender: 'bot' | 'human';
    body: string;
    sent_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
