import logging
import anthropic
from django.conf import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Yamamer, the official AI assistant for Al Yamamah University.
Your job is to help students with questions about the university — registration, grades, graduation, financial aid, internships, and general campus life.

Rules:
- Answer ONLY based on the provided context. Do not make up information.
- If the context does not contain enough information, say so honestly.
- Be concise, friendly, and professional.
- If the student writes in Arabic, reply in Arabic. If in English, reply in English.
- When referencing specific procedures, mention the relevant department or office.
- Do not answer questions unrelated to Al Yamamah University."""


class LLMService:
    """Generates answers using Claude Haiku 3.5 with retrieved KB context."""

    MODEL = 'claude-haiku-4-5-20251001'

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    def generate(self, query: str, context_chunks: list[dict], language: str = 'en') -> str:
        """
        Generate an answer from retrieved knowledge base chunks.

        Args:
            query: The user's question.
            context_chunks: List of dicts with 'question', 'answer', 'category', 'similarity'.
            language: 'en' or 'ar'.

        Returns:
            Generated answer string.
        """
        if not context_chunks:
            return self._no_context_response(language)

        context_text = self._format_context(context_chunks)

        lang_instruction = ''
        if language == 'ar':
            lang_instruction = '\nIMPORTANT: The student is writing in Arabic. Reply in Arabic.'

        user_message = f"""Context from the university knowledge base:
---
{context_text}
---

Student's question: {query}{lang_instruction}"""

        try:
            response = self.client.messages.create(
                model=self.MODEL,
                max_tokens=512,
                system=SYSTEM_PROMPT,
                messages=[{'role': 'user', 'content': user_message}],
            )
            return response.content[0].text

        except Exception:
            logger.exception('Claude API call failed')
            return self._error_response(language)

    def _format_context(self, chunks: list[dict]) -> str:
        parts = []
        for i, chunk in enumerate(chunks, 1):
            parts.append(
                f"[{i}] Category: {chunk['category']}\n"
                f"Q: {chunk['question']}\n"
                f"A: {chunk['answer']}\n"
                f"Relevance: {chunk['similarity']:.0%}"
            )
        return '\n\n'.join(parts)

    def _no_context_response(self, language: str) -> str:
        if language == 'ar':
            return 'عذراً، لم أتمكن من العثور على معلومات كافية للإجابة على سؤالك. يرجى التواصل مع مكتب القبول والتسجيل للمساعدة.'
        return "I'm sorry, I couldn't find enough information to answer your question. Please contact the Admissions & Registration office for assistance."

    def _error_response(self, language: str) -> str:
        if language == 'ar':
            return 'عذراً، حدث خطأ أثناء معالجة سؤالك. يرجى المحاولة مرة أخرى لاحقاً.'
        return "I'm sorry, something went wrong while processing your question. Please try again later."
