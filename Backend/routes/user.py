from fastapi import HTTPException, Request
from models import *
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from auth import *
from extensions import get_db
from schema import ChangePasswordRequest, EditProfileRequest, CreateQuery
import pytz

user_router = APIRouter(
    prefix="/api/v1/user",
    tags=["User"]
)

ist = pytz.timezone("Asia/Kolkata")

@user_router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = authenticate_user(form_data.username, form_data.password, db)
        if not user:
            raise HTTPException(status_code=401, detail="Incorrect username or password")

        if user["user"].get("user_status") != UserStatus.active:
            raise HTTPException(
                status_code=403,
                detail="Your account is blocked or inactive. Please contact support."
            )

        # Fetch ORM Login record
        login_obj = db.query(Login).filter(Login.username == form_data.username).first()
        if not login_obj:
            raise HTTPException(status_code=404, detail="Login record not found")

        # Update session count and trigger last_login update
        ist = pytz.timezone("Asia/Kolkata")
        now = datetime.now(ist)

        login_obj.session_count = (login_obj.session_count or 0) + 1
        login_obj.last_login = now  # ensures onupdate works properly
        db.commit()
        db.refresh(login_obj)

        # Generate token
        access_token = create_access_token(data={"sub": user["username"]})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "role": user["role"]["name"],
                "username": user["username"],
                "email": user["user"]["email"] if user.get("user") else user["username"],
                "first_name": user["user"]["first_name"] if user.get("user") else "",
                "last_name": user["user"]["last_name"] if user.get("user") else "",
                "session_count": login_obj.session_count,
                "last_login": login_obj.last_login.isoformat(),
                "id": user["id"],
        
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@user_router.post("/create_user")
async def register_user(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
        if not body.get("username") or not body.get("password") or not body.get("role_name"):
            raise HTTPException(status_code=400, detail="Username, password, and role_name are required")

        if body.get("role_name") != "user":
            raise HTTPException(status_code=400, detail="Invalid role name.")
        
        # Check if username exists
        existing_user = db.query(Login).filter(Login.username == body.get("username")).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
       
        # ✅ Create user
        full_name = body.get("full_name", "").strip()
        first, *last = full_name.split(" ")

        new_user = User(
            email=body.get("username"),
            first_name=first or "",
            last_name=" ".join(last) if last else "",
            user_status=UserStatus.active,
        )

        db.add(new_user)
        db.commit()          # Commit first
        db.refresh(new_user) # Then refresh

        # Create login
        role = db.query(Role).filter(Role.name == body.get("role_name")).first()
        if not role:
            raise ValueError(f"Role '{body.get('role_name')}' not found.")

        new_login = Login(
            username=body.get("username"),
            password=pwd_context.hash(body.get("password")),
            role_id=role.id,
            user_id=new_user.id,
            created_at=datetime.now(ist)
        )

        db.add(new_login)
        db.commit()          # Commit first
        db.refresh(new_login) # Then refresh
        return {"message": "User created successfully", "user": new_user.to_dict()}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@user_router.post("/change-password")
def change_password(
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password_data.current_password, user.password):
        raise HTTPException(status_code=403, detail="Incorrect current password")

    user.password = pwd_context.hash(password_data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}

@user_router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user

@user_router.put("/edit_profile")
def edit_user(request: EditProfileRequest, 
              db: Session = Depends(get_db), 
              current_user=Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.id == current_user["id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Split full name
        name_parts = request.full_name.strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Update user fields
        user.first_name = first_name
        user.last_name = last_name
        user.email = request.email
        user.phone_number = request.phone

        db.commit()
        db.refresh(user)

        return {
            "message": "User updated successfully",
            "user": user.to_dict()
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@user_router.get("/support_requests")
def get_support_requests(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.id == current_user["id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")   
        support_requests = db.query(Support_Request).filter(Support_Request.user_id == user.id).all()
        return {"support_requests": [req.to_dict() for req in support_requests]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@user_router.post("/raise_query")
def raise_query(request: CreateQuery, 
              db: Session = Depends(get_db), 
              current_user=Depends(get_current_user)):
    try:
        user = db.query(User).filter(User.id == current_user["id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        priority_enum = RequestPriority(request.priority)

        new_query = Support_Request(
            user_id=user.id,
            title=request.title,
            description=request.description,
            priority=priority_enum,
            status="open",
        )

        db.add(new_query)
        db.commit()
        db.refresh(new_query)

        return {
            "message": "Support request created successfully",
            "support_request": new_query.to_dict()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


