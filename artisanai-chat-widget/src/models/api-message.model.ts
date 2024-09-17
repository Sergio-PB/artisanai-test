export default interface ApiMessage {
    id: string;
    body: string;
    sent_at: string;
    updated_at?: string;
    deleted_at?: string;
    reply: string;
    replied_at: string;
}
