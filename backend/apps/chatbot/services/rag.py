import logging
from apps.chatbot.models import ChatSession, Message, MissingQuestion
from .search import SemanticSearchService
from .llm import LLMService

logger = logging.getLogger(__name__)

# Confidence thresholds
HIGH_CONFIDENCE = 0.7    # KB answer is highly relevant — use directly
LOW_CONFIDENCE = 0.3     # Below this — log as missing question


class RAGPipeline:
    """
    Orchestrates the full RAG flow:
    1. Embed the user query
    2. Semantic search over knowledge base
    3. Feed top results to Claude as context
    4. Score confidence and decide response source
    5. Log missing questions when confidence is low
    """

    def __init__(self):
        self.search_service = SemanticSearchService()
        self.llm_service = LLMService()

    def answer(self, query: str, session: ChatSession, language: str = 'en') -> dict:
        """
        Process a user query through the RAG pipeline.

        Args:
            query: The user's question text.
            session: The ChatSession this message belongs to.
            language: 'en' or 'ar'.

        Returns:
            dict with keys: answer, source, similarity_score, chunks_used
        """
        # 1. Save the user's message
        Message.objects.create(
            session=session,
            is_bot=False,
            content=query,
        )

        # 2. Semantic search
        chunks = self.search_service.search(query, top_k=5, threshold=LOW_CONFIDENCE)

        top_score = chunks[0]['similarity'] if chunks else 0.0

        # 3. Determine source and generate answer
        if not chunks:
            # No relevant results at all
            source = 'fallback'
            answer_text = self.llm_service._no_context_response(language)
            self._log_missing(query, session)

        elif top_score >= HIGH_CONFIDENCE:
            # High confidence — let Claude synthesize from KB chunks
            source = 'knowledge_base'
            answer_text = self.llm_service.generate(query, chunks, language)

        else:
            # Some results but low confidence — still try Claude, but also log
            source = 'llm'
            answer_text = self.llm_service.generate(query, chunks, language)
            self._log_missing(query, session)

        # 4. Save the bot's response
        Message.objects.create(
            session=session,
            is_bot=True,
            content=answer_text,
            source=source,
            similarity_score=top_score,
        )

        return {
            'answer': answer_text,
            'source': source,
            'similarity_score': round(top_score, 4),
            'chunks_used': len(chunks),
        }

    def _log_missing(self, query: str, session: ChatSession):
        """Log a question the bot couldn't confidently answer."""
        obj, created = MissingQuestion.objects.get_or_create(
            content=query,
            defaults={'session': session},
        )
        if not created:
            obj.frequency += 1
            obj.save(update_fields=['frequency'])

        logger.info('Logged missing question (freq=%d): %s', obj.frequency, query[:80])
