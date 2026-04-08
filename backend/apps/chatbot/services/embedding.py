import logging
import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Generates 768-dim embeddings using Google gemini-embedding-001."""

    MODEL = 'models/gemini-embedding-001'
    DIMENSIONS = 768

    def __init__(self):
        genai.configure(api_key=settings.GOOGLE_API_KEY)

    def embed(self, text: str) -> list[float]:
        """Embed a single text string. Returns 768-dim vector."""
        result = genai.embed_content(
            model=self.MODEL,
            content=text,
            output_dimensionality=self.DIMENSIONS,
        )
        return result['embedding']

    def embed_query(self, text: str) -> list[float]:
        """Embed a search query."""
        result = genai.embed_content(
            model=self.MODEL,
            content=text,
            output_dimensionality=self.DIMENSIONS,
        )
        return result['embedding']

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed multiple texts at once."""
        if not texts:
            return []
        result = genai.embed_content(
            model=self.MODEL,
            content=texts,
            output_dimensionality=self.DIMENSIONS,
        )
        return result['embedding']
