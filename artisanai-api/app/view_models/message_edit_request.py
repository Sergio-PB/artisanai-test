from pydantic import BaseModel


class MessageEditRequest(BaseModel):
    body: str
