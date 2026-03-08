import os
from firebase_admin import credentials
import firebase_admin
from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from create_embedding import create_embeddings_from_bytes
import redis
from fastapi import Request
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv
from Verify_Firebase_Token import verify_firebase_token
import time
import json

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
REDDIS_PASSWORD = os.getenv("REDDIS_PASSWORD")

cred = credentials.Certificate("./firebase-admin-sdk.json")
firebase_admin.initialize_app(cred)


r = redis.Redis(
    host="redis-10539.c278.us-east-1-4.ec2.cloud.redislabs.com",
    port=10539,
    username="default",
    password=REDDIS_PASSWORD,
    decode_responses=False  # IMPORTANT for FAISS bytes
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "Server is running"}

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    user_id: str = Depends(verify_firebase_token) 
    ):

    contents = await file.read()

    if not contents:
        return {"message": "Empty file"}

    vectorstore = create_embeddings_from_bytes(contents)

    serialized_store = vectorstore.serialize_to_bytes()

    ttl = 1800
    r.setex(
    f"user:{user_id}:vectorstore",
    ttl,
    serialized_store
)

    # initialize empty chat
    r.setex(
        f"user:{user_id}:chat",
        ttl,
        json.dumps([])
    )

    expires_at = int(time.time() * 1000) + (ttl * 1000)
    print("UPLOAD USER ID:", user_id)

    return {"message": "PDF processed successfully","expiresAt": expires_at}


@app.post("/chat")
async def chat(
    request: Request,
    user_id: str = Depends(verify_firebase_token)
):
    body = await request.json()
    question = body.get("question")

    if not question:
        return {"error": "Question is required"}

    # ---- GET VECTORSTORE ----
    stored_bytes = r.get(f"user:{user_id}:vectorstore")

    if not stored_bytes:
        return {"error": "Session expired or PDF not uploaded, refresh the page and upload new document"}

    # ---- GET CHAT HISTORY ----
    chat_key = f"user:{user_id}:chat"
    chat_data = r.get(chat_key)

    if chat_data:
        chat_history = json.loads(chat_data)
    else:
        chat_history = []

    # add user message
    chat_history.append({
        "role": "user",
        "content": question
    })

    embedding_model = FastEmbedEmbeddings()

    db = FAISS.deserialize_from_bytes(
        stored_bytes,
        embeddings=embedding_model,
        allow_dangerous_deserialization=True
    )

    retriever = db.as_retriever()

    docs = retriever.invoke(question)
    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = ChatPromptTemplate.from_template("""
        Answer the question in very short based only on the context.

        Context:
        {context}

        Question:
        {question}
    """)

    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=GROQ_API_KEY
    )

    chain = (
        {"context": lambda x: context, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    answer = chain.invoke(question)

    # add assistant message
    chat_history.append({
        "role": "assistant",
        "content": answer
    })

    # preserve TTL
    ttl = r.ttl(chat_key)

# If key doesn't exist or TTL invalid, reset TTL
    if ttl is None or ttl <= 0:
        ttl = 1800

    r.setex(chat_key, ttl, json.dumps(chat_history))
    print("USER ID:", user_id)

    return {"answer": answer}

@app.get("/chat-history")
async def get_chat_history(
    user_id: str = Depends(verify_firebase_token)
):
    chat_key = f"user:{user_id}:chat"

    chat_data = r.get(chat_key)

    if not chat_data:
        return {"messages": []}

    chat_history = json.loads(chat_data)

    return {"messages": chat_history}