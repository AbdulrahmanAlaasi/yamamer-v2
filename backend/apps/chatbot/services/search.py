import logging
from django.db import connection
from apps.chatbot.models import KnowledgeBase
from .embedding import EmbeddingService

logger = logging.getLogger(__name__)


class SemanticSearchService:
    """Performs cosine-similarity search over KnowledgeBase embeddings using pgvector."""

    def __init__(self):
        self.embedding_service = EmbeddingService()

    def search(self, query: str, top_k: int = 5, threshold: float = 0.3) -> list[dict]:
        """
        Search the knowledge base for the most relevant entries.

        Args:
            query: User's question text.
            top_k: Max number of results to return.
            threshold: Minimum similarity score (0-1). Results below this are excluded.

        Returns:
            List of dicts with keys: id, question, answer, category, similarity.
        """
        query_embedding = self.embedding_service.embed_query(query)

        # pgvector cosine distance: 1 - (a <=> b) gives cosine similarity
        sql = """
            SELECT id, question, answer, category,
                   1 - (embedding <=> %s::vector) AS similarity
            FROM knowledge_base
            WHERE is_active = true
              AND embedding IS NOT NULL
            ORDER BY embedding <=> %s::vector
            LIMIT %s
        """

        embedding_str = str(query_embedding)

        with connection.cursor() as cursor:
            cursor.execute(sql, [embedding_str, embedding_str, top_k])
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        results = []
        for row in rows:
            item = dict(zip(columns, row))
            if item['similarity'] >= threshold:
                results.append(item)

        logger.info(
            'Semantic search for "%s": %d results (top score: %.3f)',
            query[:50],
            len(results),
            results[0]['similarity'] if results else 0,
        )

        return results
