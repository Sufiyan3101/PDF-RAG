# 📄 PDF-RAG — Chat with your PDF

A full-stack AI-powered app that lets you upload a PDF and have a real conversation with it — powered by Groq, LangChain, and Firebase.

🌐 **Live Demo:** [three0minbot.onrender.com](https://three0minbot.onrender.com)

---

## ✨ Features

- 📤 **Upload any PDF** and instantly process it
- 💬 **Chat with your PDF** — ask questions, get answers from the document
- 🔐 **Google Login** via Firebase Authentication
- 🕘 **Chat history saved** per user session
- ⚡ **Redis caching** for fast, session-based vectorstore retrieval

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| LLM | Groq (Llama 3.1 8B) |
| Embeddings | HuggingFace Inference API |
| Vector Store | FAISS |
| Auth | Firebase (Google Sign-In) |
| Cache | Redis |
| Deployment | Render |

---

## 🏗️ Project Structure

```
PDF-RAG/
├── Backend/
│   ├── main.py                  # FastAPI app & all endpoints
│   ├── create_embedding.py      # PDF processing & FAISS vectorstore
│   ├── Verify_Firebase_Token.py # Firebase auth middleware
│   ├── requirements.txt
│   └── .env                     # (not committed)
├── src/                         # React frontend source
├── public/
├── index.html
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Firebase project   --->   https://firebase.google.com/
- A Groq API key   --->   https://console.groq.com/
- A HuggingFace API token   --->   https://huggingface.co/settings/tokens 
- A Redis instance (e.g. Redis Cloud free tier)   --->   https://redis.io/

### Backend Setup

```bash
cd Backend
pip install -r requirements.txt
```

Create a `.env` file in `Backend/`:
```env
GROQ_API_KEY=your_groq_api_key
HUGGINGFACE_API_KEY=your_hf_token
FIREBASE_CREDENTIALS={"type":"service_account", ...}  # paste as single line JSON
REDIS_PASSWORD=your_redis_password
```

Run the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup

```bash
npm install
```

Create a `.env` in the root:
```env
VITE_API_URL=http://localhost:8000
```

Run the frontend:
```bash
npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload and process a PDF |
| `POST` | `/chat` | Ask a question about the PDF |
| `GET` | `/chat-history` | Fetch chat history for the session |

All endpoints require a Firebase Bearer token in the `Authorization` header.

---

## ☁️ Deployment

Both frontend and backend are deployed on **Render**.

- Backend: Render Web Service (Python)
- Frontend: Render Static Site (Vite build → `dist/`)

Key environment variables to set in Render:
```
GROQ_API_KEY
HUGGINGFACE_API_KEY
FIREBASE_CREDENTIALS
REDIS_PASSWORD
PYTHON_VERSION = 3.11.9
```


---

<p align="center">Built with ❤️ by <a href="https://github.com/Sufiyan3101">Sufiyan</a></p>