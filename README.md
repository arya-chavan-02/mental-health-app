## 📘 MindCare – AI-Powered Virtual Therapy Assistant

MindCare is a full-stack AI-powered virtual therapy assistant designed to provide supportive, empathetic, and conversational mental health interactions.  
It combines a **FastAPI** backend with a modern **React** frontend and uses the **Google Gemini Pro API** to generate intelligent, context-aware chatbot responses.

Users can chat with the AI therapist through a clean, responsive, and calming user interface while the backend securely handles authentication, message history, and communication with the Gemini model.

---

## 🚀 Features
- Real-time conversational AI therapy powered by Gemini Pro
- Secure user authentication (JWT-based)
- Persistent chat history
- Responsive and soothing React frontend
- FastAPI backend with Swagger & ReDoc documentation
- Environment-based API key management

---

## 🔑 Environment Variables (Backend)

Create a `.env` file inside the `Backend/` directory:

GEMINI_API_KEY=your_gemini_pro_api_key_here

> ⚠️ **Important**  
> - Every user/contributor must provide their **own** Gemini Pro API key.  
> - **Never** commit the `.env` file to GitHub or any public repository.

Get your key from: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## 🐍 Backend Setup (FastAPI)

```bash
# 1. Go to backend folder
cd Backend

# 2. Create virtual environment
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux / WSL
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
# or pip3 on some systems

# 4. Run the server
uvicorn main:app --reload
```

### Backend URLs
- API Base: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs (Swagger UI)
- Alternative Docs: http://localhost:8000/redoc

---

## 🖥️ Frontend Setup (React + Vite)

```bash
# 1. Go to frontend folder
cd Frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### Frontend URL
👉 http://localhost:3000

---

## 🚀 Running the Full Application

Open two terminals:

**Terminal 1 – Backend**
```bash
cd Backend
uvicorn main:app --reload
```

**Terminal 2 – Frontend**
```bash
cd Frontend
npm run dev
```

Then open your browser and visit:  
🎉 **http://localhost:3000**

---

## 📝 Application Demo

- Go to this link to see application demo: https://drive.google.com/file/d/1aCOnamBQP8Sm83Y9uSswsgUuVrfLvMDm/view?usp=drive_link

---

## 📝 Additional Notes

- `node_modules/` is not included in the repo → run `npm install` in `/Frontend`
- Always create your `.env` file manually in `/Backend`
- Keep your Gemini API key private
- Both servers (FastAPI + Vite) must be running simultaneously

---

## ❤️ Stay Kind to Your Mind

MindCare is built with empathy and care. While this is an AI assistant and not a replacement for professional therapy, we hope it brings comfort and support to those who need someone to talk to.

> You're not alone.

---


