from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from .message import Message


class Chat(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    user_id: Optional[UUID] = Field(default=None)
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    deleted_at: Optional[datetime] = Field(default=None)
