from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timedelta
from models import Role, Login, User, Support_Request, RoleEnum, UserStatus
from extensions import get_db
from auth import get_current_user, require_role
from pydantic import BaseModel, EmailStr
import pytz
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

ist = pytz.timezone("Asia/Kolkata")
now = datetime.now(ist)

admin_router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin"]
)

@admin_router.get("/dashboard")
def admin_dashboard(user_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    admin = db.query(User).filter(User.user_id == user_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="admin not found")
    
    return {
        "full_name": admin.user.full_name,
    }

@admin_router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    # Total users
    total_users = db.query(User).count() - 1

    # Active sessions → users logged in within last 10 minutes
    ten_min_ago = datetime.now(ist) - timedelta(minutes=10)
    active_sessions = db.query(Login).filter(Login.last_login >= ten_min_ago).count() -1 

    # Avg response time → dummy value for now
    avg_response_time = "2.3s"

    # User satisfaction → dummy or fetch from feedback table if exists
    user_satisfaction = "94%"

    return {
        "total_users": total_users,
        "active_sessions": active_sessions,
        "avg_response_time": avg_response_time,
        "user_satisfaction": user_satisfaction,
    }

@admin_router.patch("/{user_id}/block_user")
def block_user(user_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.user_status = UserStatus.suspended
    db.commit()
    return {"message": f"User {user_id} has been blocked."}

@admin_router.patch("/{user_id}/unblock_user")
def unblock_user(user_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.user_status = UserStatus.active
    db.commit()
    return {"message": f"User {user_id} has been unblocked."}

@admin_router.delete("/{user_id}/delete_user")
def delete_user(user_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} has been deleted."}

@admin_router.get("/users", response_model=List[BaseModel])
def get_all_users(db: Session = Depends(get_db), user=Depends(get_current_user)):
    users = (
        db.query(User)
        .join(Login, User.id == Login.user_id)
        .join(Role, Login.role_id == Role.id)
        .filter(Role.name == RoleEnum.user)
        .options(joinedload(User.login).joinedload(Login.role))
        .all()
    )

    formatted_users = []
    for u in users:
        login = u.login
        formatted_users.append({
            "id": u.id,
            "name": u.first_name + (f" {u.last_name}" if u.last_name else ""),
            "email": u.email,
            "phone": u.phone_number,
            "status": u.user_status.value,
            "sessions": login.session_count if login else 0,
            "joinedDate": format_joined_date(u.created_at),
            "lastActive": format_time_ago(login.last_login) if login else "Never",
        })

    return JSONResponse(content=jsonable_encoder(formatted_users))    

@admin_router.get("/support_requests", response_model=List[BaseModel])
def get_support_requests(db: Session = Depends(get_db), user=Depends(get_current_user)):
    requests = db.query(Support_Request).all()
    return JSONResponse(content=jsonable_encoder(requests))

# @admin_router.post("/respond_support_request/{request_id}")
# def respond_support_request(request_id: int, response: str = Body(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
#     support_request = db.query(Support_Request).filter(Support_Request.id == request_id).first()
#     if not support_request:
#         raise HTTPException(status_code=404, detail="Support request not found")
    
#     conversation = Conversations(
#         user_id=support_request.user_id,
#         message=response,
#         created_at=datetime.now(ist)
#     )
#     db.add(conversation)
#     db.commit()
#     return {"message": "Response sent successfully."}

@admin_router.patch("/support_request/{request_id}/close")
def close_support_request(request_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    support_request = db.query(Support_Request).filter(Support_Request.id == request_id).first()
    if not support_request:
        raise HTTPException(status_code=404, detail="Support request not found")
    
    support_request.status = "closed"
    db.commit()
    return {"message": "Support request closed successfully."}

def format_time_ago(dt: datetime):
    """Return human-readable 'x min ago' style string."""
    if not dt:
        return "Never"

    # If dt is naive, localize it
    if dt.tzinfo is None:
        dt = ist.localize(dt)

    now = datetime.now(ist)
    diff = now - dt
    minutes = int(diff.total_seconds() // 60)
    hours = int(minutes // 60)
    days = int(hours // 24)

    if minutes < 1:
        return "just now"
    elif minutes < 60:
        return f"{minutes} min ago"
    elif hours < 24:
        return f"{hours} hr ago"
    else:
        return f"{days} days ago"

def format_joined_date(dt: datetime):
    if not dt:
        return None
    return dt.strftime("%b %d, %Y")  # Example: "Jan 15, 2024"
