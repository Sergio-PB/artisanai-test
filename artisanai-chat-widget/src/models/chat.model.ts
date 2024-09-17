import Message from "./message.model";

export default interface Chat {
    id: string;
    messages: Message[];
}
