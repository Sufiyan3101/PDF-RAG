# from langchain_community.vectorstores import FAISS
# from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
# from langchain_text_splitters import CharacterTextSplitter
# from langchain_community.document_loaders import PyPDFLoader
# import tempfile
# import os

# def create_embeddings_from_bytes(file_bytes: bytes):

#     with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
#         tmp.write(file_bytes)
#         temp_path = tmp.name

#     loader = PyPDFLoader(temp_path)
#     documents = loader.load()
#     os.remove(temp_path)

#     text_splitter = CharacterTextSplitter(
#         chunk_size=1000,
#         chunk_overlap=30
#     )

#     docs = text_splitter.split_documents(documents)

#     if not docs:
#         raise ValueError("No text could be extracted from the PDF.")

#     api_key = os.getenv("HUGGINGFACE_API_KEY")
#     if not api_key:
#         raise ValueError("HUGGINGFACE_API_KEY is not set.")

#     embedding = HuggingFaceInferenceAPIEmbeddings(
#         api_key=api_key,
#         model_name="sentence-transformers/all-MiniLM-L6-v2"
#     )

#     # Test before passing to FAISS
#     test = embedding.embed_query("test")
#     if not test:
#         raise ValueError("HuggingFace API returned empty embeddings. Check your API key.")

#     vectorstore = FAISS.from_documents(docs, embedding)

#     return vectorstore



from langchain_community.vectorstores import FAISS
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import tempfile
import os
import requests

class HFRouterEmbeddings:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def embed_documents(self, texts: list) -> list:
        response = requests.post(self.url, headers=self.headers, json={"inputs": texts})
        if response.status_code != 200:
            raise RuntimeError(f"HuggingFace API error {response.status_code}: {response.text}")
        return response.json()

    def embed_query(self, text: str) -> list:
        response = requests.post(self.url, headers=self.headers, json={"inputs": [text]})
        if response.status_code != 200:
            raise RuntimeError(f"HuggingFace API error {response.status_code}: {response.text}")
        return response.json()[0]

    # ✅ Add this - FAISS calls the object directly during deserialization
    def __call__(self, text: str) -> list:
        return self.embed_query(text)
    
    
def create_embeddings_from_bytes(file_bytes: bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_bytes)
        temp_path = tmp.name

    loader = PyPDFLoader(temp_path)
    documents = loader.load()
    os.remove(temp_path)

    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=30)
    docs = text_splitter.split_documents(documents)

    if not docs:
        raise ValueError("No text could be extracted from the PDF.")

    api_key = os.getenv("HUGGINGFACE_API_KEY")
    if not api_key:
        raise ValueError("HUGGINGFACE_API_KEY is not set.")

    embedding = HFRouterEmbeddings(api_key=api_key)
    vectorstore = FAISS.from_documents(docs, embedding)
    return vectorstore