import os
import requests
from pydantic import Field
from llama_index.core import StorageContext, VectorStoreIndex
from llama_index.vector_stores.postgres import PGVectorStore
from llama_index.core.base.embeddings.base import BaseEmbedding
from .parser import extract_pdf_llamaparse
from .chunker import text_n_images
from sqlalchemy import make_url
from sqlmodel import Session
from llama_index.core.retrievers import QueryFusionRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from dotenv import load_dotenv
from llama_index.core.settings import Settings

Settings.llm = None

load_dotenv()


MYGENASSIST_API_URL = "https://chat.int.bayer.com/api/v2/embeddings"
API_KEY = os.getenv("MYGENASSIST_API_KEY")


class MyGenAssistEmbedding(BaseEmbedding):
    model: str = Field(default="text-embedding-3-small")
    dimensions: int = Field(default=1536)

    def _call_api(self, text: str):
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        data = {
            "input": text,
            "model": self.model,
            "encoding_format": "float",
            "dimensions": self.dimensions
        }
        response = requests.post(MYGENASSIST_API_URL, headers=headers, json=data)
        response.raise_for_status()
        return response.json()["data"][0]["embedding"]

    # Required by BaseEmbedding
    def _get_text_embedding(self, text: str) -> list[float]:
        return self._call_api(text)

    def _get_query_embedding(self, text: str) -> list[float]:
        return self._call_api(text)

    async def _aget_query_embedding(self, text: str) -> list[float]:
        return self._call_api(text)

embedding_model = MyGenAssistEmbedding(model="text-embedding-3-small", dimensions=1536)


class Retriver:
    def __init__(self, document_id, path=None, embedding_model=embedding_model):
        self.connection_string = os.getenv('PGVECTOR_HOST')
        self.url = make_url(self.connection_string)
        self.db_name = "bayers-dev"
        self.path = path
        self.embedding_model = embedding_model
        self.document_id = document_id

        self.vector_store = PGVectorStore.from_params(
            database=self.db_name,
            host=self.url.host,
            password=self.url.password,
            port=self.url.port,
            user=self.url.username,
            hybrid_search=True,
            table_name=self.document_id,
            embed_dim=self.embedding_model.dimensions,
            hnsw_kwargs={
                "hnsw_m": 16,
                "hnsw_ef_construction": 64,
                "hnsw_ef_search": 40,
                "hnsw_dist_method": "vector_cosine_ops",
            },
        )
        self.index = None

    def _load_index(self):
        if self.index is None:
            self.index = VectorStoreIndex.from_vector_store(
                vector_store=self.vector_store, 
                embed_model=self.embedding_model, 
                show_progress=True
            )
        return self.index

    async def extract_text_from_pdf(self, session: Session):
        data, num_images, num_tables = await extract_pdf_llamaparse(self.path)
        docs = text_n_images(data, self.document_id, session)
        return docs

    async def upsert(self, session: Session):
        docs = await self.extract_text_from_pdf(session)
        storage_context = StorageContext.from_defaults(vector_store=self.vector_store)
        VectorStoreIndex.from_documents(
            docs, 
            embed_model=self.embedding_model, 
            vector_store=self.vector_store, 
            storage_context=storage_context,
            show_progress=True
        )

    def similarity_search(self, query, k=3):
        try:
            index = self._load_index()

            vector_retriever = index.as_retriever(
                vector_store_query_mode="default",
                similarity_top_k=k
            )
            text_retriever = index.as_retriever(
                vector_store_query_mode="sparse",
                similarity_top_k=k
            )
            retriever = QueryFusionRetriever(
                [vector_retriever, text_retriever],
                similarity_top_k=k,
                num_queries=1,
                mode="relative_score",
                use_async=False,
            )

            query_engine = RetrieverQueryEngine(retriever=retriever)
            nodes = query_engine.retrieve(query)
            return nodes

        except Exception as e:
            print(f"[WARNING] Retrieval failed for document ID {self.document_id}: {e}")
            return []

    def delete_chunks(self, ids):
        self.vector_store.delete(ids)

    def delete_collection(self):
        self.vector_store.clear()


if __name__ == "__main__":
    test = Retriver(
        embedding_model=embedding_model,
        document_id="gaga_test_2",
        path="/workspaces/Agentic_Pharma/back-end/filled_templates/template1.pdf",
    )
    # await test.upsert(session)  # uncomment and provide session
    print(test.similarity_search("What are the High-scale and-quality Data Limitations"))
