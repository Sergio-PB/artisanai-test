from datetime import datetime
from typing import ClassVar, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class Message(BaseModel):
    MAX_MESSAGE_LENGTH: ClassVar = 255

    id: UUID = Field(default_factory=uuid4)
    chat_id: UUID = Field()
    body: str = Field()
    reply: Optional[str] = Field(default=None)
    sent_at: datetime = Field(default_factory=datetime.now)
    replied_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)
    deleted_at: Optional[datetime] = Field(default=None)
