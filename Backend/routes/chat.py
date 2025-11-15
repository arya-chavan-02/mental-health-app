from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai
from dotenv import load_dotenv
import os, uuid
from datetime import datetime
from extensions import get_db
from models import ChatSession, ChatMessage, User
from schema import ChatRequest, ChatSessionOut
import utils
from auth import get_current_user

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

chat_router = APIRouter(prefix="/chat", tags=["Chatbot"])

@chat_router.post("/")
async def chat_with_gemini(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_text = request.user_message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Empty message not allowed")

    # 🔹 Get or create chat session
    if request.session_id:
        session_obj = db.query(ChatSession).filter_by(session_uuid=request.session_id).first()
        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session_uuid = str(uuid.uuid4())
        session_obj = ChatSession(
            user_id=current_user['id'],
            session_uuid=session_uuid,
            created_at=datetime.utcnow(),
            title=None  # title will be generated later
        )
        db.add(session_obj)
        db.commit()
        db.refresh(session_obj)

    session_id = session_obj.session_uuid

    # 🔹 Detect distress
    if utils.detect_distress(user_text):
        bot_reply = (
            "It sounds like you're going through a really hard time. "
            "You’re not alone. Please consider calling someone you trust or "
            "a helpline like AASRA (91-9820466726). "
            "I’m here with you. Would you like some breathing or grounding exercises?"
        )

        db.add_all([
            ChatMessage(session_id=session_obj.id, role="user", content=user_text),
            ChatMessage(session_id=session_obj.id, role="bot", content=bot_reply)
        ])

        # 🔹 Generate title if it's first message
        if not session_obj.title:
            session_obj.title = bot_reply[:50]
            db.add(session_obj)

        db.commit()

        return {
            "session_id": session_id,
            "reply": bot_reply,
            "title": session_obj.title
        }

    # 🔹 Detect emotion
    emotion = utils.detect_emotion(user_text)

    # 🔹 Retrieve last messages for context
    last_msgs = db.query(ChatMessage).filter_by(session_id=session_obj.id)\
        .order_by(ChatMessage.created_at.desc()).limit(6).all()

    context = "\n".join([f"{m.role.capitalize()}: {m.content}" for m in reversed(last_msgs)])

    tone_map = {
        "joy": "Be cheerful and encouraging.",
        "sadness": "Be warm, empathetic, and gentle.",
        "anger": "Stay calm, understanding, and patient.",
        "fear": "Be reassuring and comforting.",
        "neutral": "Be supportive and kind.",
    }

    tone_instruction = tone_map.get(emotion, "Be empathetic and friendly.")

    prompt = f"""
    You are a compassionate mental wellness companion.
    Avoid diagnosing or prescribing medication.
    Encourage reflection, self-care, and seeking professional help when necessary.
    {tone_instruction}

    Recent conversation:
    {context}

    User ({emotion}): {user_text}
    """

    # 🔹 Generate stop-safe reply
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    bot_reply = response.text.strip()

    # 🔹 Save messages
    db.add_all([
        ChatMessage(session_id=session_obj.id, role="user", content=user_text, emotion=emotion),
        ChatMessage(session_id=session_obj.id, role="bot", content=bot_reply)
    ])

    # 🔹 Auto-generate title if first message
    if not session_obj.title:
        session_obj.title = bot_reply[:50]
        db.add(session_obj)

    db.commit()

    return {
        "session_id": session_id,
        "emotion": emotion,
        "reply": bot_reply,
        "title": session_obj.title
    }

@chat_router.get("/history/{session_id}", response_model=ChatSessionOut)
async def get_history(session_id: str, db: Session = Depends(get_db)):
    session_obj = db.query(ChatSession).filter_by(session_uuid=session_id).first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.query(ChatMessage).filter_by(session_id=session_obj.id)\
        .order_by(ChatMessage.created_at).all()

    return {
        "session_id": session_id,
        "messages": messages
    }

@chat_router.get("/sessions")
async def get_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user['id']).all()

    result = []
    for s in sessions:
        last_msg = db.query(ChatMessage).filter_by(session_id=s.id)\
                   .order_by(ChatMessage.created_at.desc()).first()

        result.append({
            "session_id": s.session_uuid,
            "title": s.title or "New Conversation",
            "last_updated": (
                last_msg.created_at.isoformat() if last_msg else s.created_at.isoformat()
            )
        })

    return result
