from pydantic import BaseModel, EmailStr, HttpUrl, AnyHttpUrl
from typing import List, Optional
from datetime import datetime
from models import RoleEnum, UserStatus

# class ORMBase(BaseModel):
#     model_config = {
#         "from_attributes": True  # Pydantic v2 replaces orm_mode
#     }
#     __allow_unmapped__ = True

# class EditProfileRequest(ORMBase):
#     full_name: str
#     email: EmailStr
#     profile_picture: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

# class ResourceCreate(ORMBase):
#     title: str
#     description: str
#     url: AnyHttpUrl
#     category: Literal["student", "instructor"]

# class ResourceOut(ORMBase):
#     id: int
#     title: str
#     description: str
#     url: AnyHttpUrl
#     category: str
#     instructor_id: int

#     class Config:
#         from_attributes = True

# class ResourceResponse(ORMBase):
#     message: str
#     resource: ResourceOut

# class AssignmentCreate(ORMBase):
#     title: str
#     description: Optional[str] = None
#     assignment_deadline: datetime
#     score: Optional[int] = 0
#     question_type: QuestionType

# class QuestionCreate(ORMBase):
#     question: str
#     option_1: Optional[str] = None
#     option_2: Optional[str] = None
#     option_3: Optional[str] = None
#     option_4: Optional[str] = None
#     correct_answer: Optional[str] = None
#     descriptive_answer: Optional[str] = None

# class ClassSchema(ORMBase):
#     id: int
#     standard: int
#     division: str

# class UserSchema(ORMBase):
#     id: int
#     email: str
#     full_name: str
#     username: str
#     role_name: RoleEnum
#     profile_picture: Optional[str]
#     created_at: datetime
#     user_status: UserStatus

# class ParentSchema(ORMBase):
#     id: int
#     user_id: int
#     student_id: int
#     user: UserSchema

# class StudentSchema(ORMBase):
#     id: int
#     user_id: int
#     class_id: int
#     school_name: str
#     user: UserSchema
#     student_class: ClassSchema

# class TaskSchema(ORMBase):
#     id: int
#     title: str
#     description: str
#     student_id: int
#     status: TaskStatusEnum
#     created_at: datetime
#     due_date: datetime

# class AssignmentSchema(ORMBase):
#     id: int
#     title: str
#     teacher_id: int
#     assignment_created: datetime
#     assignment_deadline: datetime
#     question_type: QuestionType

class ChatRequest(BaseModel):
    user_message: str
    session_id: Optional[str] = None
    user_id: Optional[int] = None  # optional if user is logged in

class ChatMessageOut(BaseModel):
    role: str
    content: str
    emotion: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionOut(BaseModel):
    session_id: str
    messages: List[ChatMessageOut]