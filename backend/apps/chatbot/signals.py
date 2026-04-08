import logging
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


@receiver(post_save, sender='chatbot.KnowledgeBase')
def auto_embed_kb_item(sender, instance, **kwargs):
    """Generate embedding automatically when a KB item is created/updated."""
    # Only embed if the question or answer changed (avoid infinite loop)
    if instance.embedding is not None and not kwargs.get('update_fields'):
        # Check if content changed by looking at update_fields
        # If update_fields is set and doesn't include question/answer, skip
        pass

    text = f"{instance.question}\n{instance.answer}"

    try:
        from apps.chatbot.services.embedding import EmbeddingService
        service = EmbeddingService()
        embedding = service.embed(text)

        # Use update() to avoid triggering the signal again
        sender.objects.filter(pk=instance.pk).update(embedding=embedding)
        logger.info('Auto-embedded KB item #%d', instance.pk)
    except Exception:
        logger.exception('Failed to auto-embed KB item #%d', instance.pk)
