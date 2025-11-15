from pydantic import BaseModel, EmailStr, HttpUrl, AnyHttpUrl
from typing import List, Optional
from datetime import datetime
from models import RoleEnum, UserStatus

class ORMBase(BaseModel):
    model_config = {
        "from_attributes": True  # Pydantic v2 replaces orm_mode
    }
    __allow_unmapped__ = True

class EditProfileRequest(ORMBase):
    full_name: str
    email: EmailStr
    phone: str
    

class ChangePasswordRequest(ORMBase):
    old_password: str
    new_password: str

class ChatRequest(ORMBase):
    user_message: str
    session_id: Optional[str] = None
    user_id: Optional[int] = None  # optional if user is logged in

class ChatMessageOut(ORMBase):
    role: str
    content: str
    emotion: Optional[str]
    created_at: datetime

class ChatSessionOut(ORMBase):
    session_id: str
    messages: List[ChatMessageOut]