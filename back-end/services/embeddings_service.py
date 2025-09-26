"""
Embeddings service for handling vector embeddings using MyGenAssist API.
"""
import requests
from pydantic import Field
from llama_index.core.base.embeddings.base import BaseEmbedding
from utils.config import MYGENASSIST_API_KEY, MYGENASSIST_EMBEDDINGS_URL


class MyGenAssistEmbedding(BaseEmbedding):
    """Custom embedding model using MyGenAssist API."""
    
    model: str = Field(default="text-embedding-3-small")
    dimensions: int = Field(default=1536)

    def _call_api(self, text: str):
        """Call MyGenAssist embeddings API."""
        headers = {
            "Authorization": f"Bearer {MYGENASSIST_API_KEY}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        data = {
            "input": text,
            "model": self.model,
            "encoding_format": "float",
            "dimensions": self.dimensions
        }
        response = requests.post(MYGENASSIST_EMBEDDINGS_URL, headers=headers, json=data)
        response.raise_for_status()
        return response.json()["data"][0]["embedding"]

    def _get_text_embedding(self, text: str) -> list[float]:
        return self._call_api(text)

    def _get_query_embedding(self, text: str) -> list[float]:
        return self._call_api(text)

    async def _aget_query_embedding(self, text: str) -> list[float]:
        return self._call_api(text)


# Global embedding model instance
embedding_model = MyGenAssistEmbedding(model="text-embedding-3-small", dimensions=1536)
