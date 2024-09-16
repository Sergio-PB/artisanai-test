from pydantic import BaseModel


class MessageCreateRequest(BaseModel):
    body: str
