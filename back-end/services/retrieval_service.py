"""
Retrieval service for handling document retrieval from pgvector.
"""
import os
from sqlalchemy import make_url
from llama_index.core import StorageContext, VectorStoreIndex
from llama_index.vector_stores.postgres import PGVectorStore
from llama_index.core.retrievers import QueryFusionRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.settings import Settings
from utils.config import PGVECTOR_HOST
from services.embeddings_service import embedding_model

Settings.llm = None


class RetrievalService:
    """Service for document retrieval from pgvector."""
    
    def __init__(self, document_id: str):
        self.connection_string = PGVECTOR_HOST
        self.url = make_url(self.connection_string)
        self.db_name = "bayers-dev"
        self.document_id = document_id
        self.embedding_model = embedding_model

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
        """Load or create vector index."""
        if self.index is None:
            self.index = VectorStoreIndex.from_vector_store(
                vector_store=self.vector_store, 
                embed_model=self.embedding_model, 
                show_progress=True
            )
        return self.index

    def similarity_search(self, query: str, k: int = 3):
        """Perform similarity search on documents."""
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
        """Delete specific chunks from vector store."""
        self.vector_store.delete(ids)

    def delete_collection(self):
        """Delete entire collection from vector store."""
        self.vector_store.clear()
