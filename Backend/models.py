from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, func
from sqlalchemy.orm import relationship
from datetime import date, datetime
import enum
from extensions import SQLBase 
import pytz

ist = pytz.timezone("Asia/Kolkata")

class SQLBaseModel(SQLBase):
    __abstract__ = True  # Prevents table creation for this class

    def to_dict(self, include_relationships=False):
        """Convert model instance to dictionary, handling date serialization."""
        if not hasattr(self, '__table__') or not hasattr(self, '__mapper__'):
            raise TypeError("BaseModel should not be used directly. Inherit and define a concrete model.")

        result = {}

        for column in self.__table__.columns:  # type: ignore
            value = getattr(self, column.name)

            # Convert `date` and `datetime` objects to string
            if isinstance(value, (date, datetime)):
                result[column.name] = value.isoformat()  # Converts to "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS"
            else:
                result[column.name] = value

        if include_relationships:
            for relationship in self.__mapper__.relationships:  # type: ignore
                related_obj = getattr(self, relationship.key)
                if related_obj is None:
                    result[relationship.key] = None
                elif isinstance(related_obj, list):
                    result[relationship.key] = [obj.to_dict() for obj in related_obj]
                else:
                    result[relationship.key] = related_obj.to_dict()
        return result

class RoleEnum(enum.Enum):
    user = "user"
    admin = "admin"

class UserStatus(enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"

class RequestStatus(enum.Enum):
    open = "open"
    resolved = "resolved"

class RequestPriority(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Role(SQLBaseModel):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Enum(RoleEnum), unique=True, nullable=False)

    logins = relationship("Login", back_populates="role")

    def __repr__(self):
        return f"<Role(id={self.id}, name={self.name})>"

class Login(SQLBaseModel):
    __tablename__ = "login"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    role = relationship("Role", back_populates="logins")

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="login")

    session_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now(ist))
    last_login = Column(DateTime, onupdate=datetime.now(ist))
    days_active = Column(Integer, default=0)

    def __repr__(self):
        return f"<Login(username={self.username}, role_id={self.role_id})>"

class User(SQLBaseModel):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=True)
    profile_picture = Column(String, nullable=True)
    phone_number = Column(String(15), nullable=True)
    user_status = Column(Enum(UserStatus), default=UserStatus.active, nullable=False)

    created_at = Column(DateTime, default=datetime.now(ist))
    updated_at = Column(DateTime, default=datetime.now(ist))

    login = relationship("Login", back_populates="user", uselist=False)

    support_requests = relationship("Support_Request", back_populates="user")
    conversations = relationship("ChatSession", back_populates="user", cascade="all, delete")

    def __repr__(self):
        return f"<User(email={self.email}, status={self.user_status})>"

def create_admin(session, first_name: str, last_name: str):
    """
    Create an admin user if it doesn't already exist.
    """
    from auth import pwd_context
    # Ensure 'Admin' role exists
    role = session.query(Role).filter_by(name=RoleEnum.admin).first()
    if not role:
        role = Role(name=RoleEnum.admin)
        session.add(role)
        role = Role(name=RoleEnum.user)
        session.add(role)
        session.commit()
        print("Created 'Admin' role.")

    # Check if the admin login already exists
    existing_login = session.query(Login).filter_by(username="admin@mindcare.com").first()
    if existing_login:
        print("Admin already exists.")
        return existing_login

    # Create User entry
    user = User(
        email="admin@mindcare.com",
        first_name="Admin",
        user_status=UserStatus.active,
        created_at=datetime.now(ist),
    )
    session.add(user)
    session.commit()

    # Create Login entry linked to User and Role
    login = Login(
        username="admin@mindcare.com",
        password=pwd_context.hash("admin123"),
        role_id=session.query(Role).filter_by(name=RoleEnum.admin).first().id,
        user_id=user.id,
        created_at=datetime.now(ist),
    )
    session.add(login)
    session.commit()

    print(f"Admin '{login.username}' created successfully.")
    return login

class Support_Request(SQLBaseModel):
    __tablename__ = "support_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(RequestStatus), default=RequestStatus.open, nullable=False)
    created_at = Column(DateTime, default=datetime.now(ist))
    priority = Column(Enum(RequestPriority), default=RequestPriority.medium, nullable=False)

    user = relationship("User", back_populates="support_requests")

    def __repr__(self):
        return f"<SupportRequest(user_id={self.user_id}, subject={self.subject}, status={self.status})>"
    
class ChatSession(SQLBaseModel):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    session_uuid = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.now(ist))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete")

class ChatMessage(SQLBaseModel):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    role = Column(String)  # "user" or "bot"
    content = Column(Text)
    emotion = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now(ist))

    session = relationship("ChatSession", back_populates="messages")