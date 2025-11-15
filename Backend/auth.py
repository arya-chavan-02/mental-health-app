from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from models import User, Login
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from extensions import SessionLocal
from sqlalchemy.orm import Session
import pytz

# Sample secret key and algo
SECRET_KEY = "MySecretKey@1234"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/user/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

ist = pytz.timezone("Asia/Kolkata")

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def authenticate_user(username: str, password: str, db: Session):
    user = get_user(username, db)
    if not user or not verify_password(password, user['password']):
        return False
    return user

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.now(ist) + (expires_delta or timedelta(minutes=20))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token: no subject")
        user = get_user(username, SessionLocal())
        if not user:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception

def require_role(role: str):
    def role_checker(user: User = Depends(get_current_user)):
        if user["role_name"].value is not role:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return user
    return role_checker

def get_user(username: str, db: Session):
    user = db.query(Login).filter(Login.username == username).first()
    return user.to_dict(True) if user else None
