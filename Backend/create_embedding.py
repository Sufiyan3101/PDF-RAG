from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import tempfile
import os

def create_embeddings_from_bytes(file_bytes: bytes):

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_bytes)
        temp_path = tmp.name

    loader = PyPDFLoader(temp_path)
    documents = loader.load()
    os.remove(temp_path)

    text_splitter = CharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=30
    )

    docs = text_splitter.split_documents(documents)

    # Uses HuggingFace Inference API - no local model, zero RAM usage
    embedding = HuggingFaceInferenceAPIEmbeddings(
        api_key=os.getenv("HUGGINGFACE_API_KEY"),
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.from_documents(docs, embedding)

    return vectorstore