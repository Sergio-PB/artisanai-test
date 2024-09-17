import ApiMessage from "./api-message.model";

export default interface ApiChat {
    id: string;
    user_id: string;
    messages: ApiMessage[];
    created_at: string;
    deleted_at?: string;
}
