from fastapi import FastAPI
from routes.user import user_router
from routes.admin import admin_router
from routes.chat import chat_router
from extensions import *
from models import create_admin

from fastapi.middleware.cors import CORSMiddleware
origins = [
    "http://localhost:3000",     
    "http://127.0.0.1:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SQLBase.metadata.create_all(bind=engine)
create_admin(session=SessionLocal(), first_name="admin", last_name="")
app.include_router(admin_router)
app.include_router(user_router)
app.include_router(chat_router)