from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta

from apps.chatbot.models import (
    KnowledgeBase, MissingQuestion, ChatSession,
    Message, UniversityForm, Announcement
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Returns key stats for the admin dashboard overview.
    """
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # Knowledge Base stats
    kb_total   = KnowledgeBase.objects.count()
    kb_active  = KnowledgeBase.objects.filter(is_active=True).count()
    kb_by_cat  = list(
        KnowledgeBase.objects.values('category')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    # Missing Questions stats
    mq_pending    = MissingQuestion.objects.filter(status='pending').count()
    mq_resolved   = MissingQuestion.objects.filter(status='resolved').count()
    mq_dismissed  = MissingQuestion.objects.filter(status='dismissed').count()
    mq_top        = list(
        MissingQuestion.objects
        .filter(status='pending')
        .order_by('-frequency')
        .values('id', 'content', 'frequency', 'status')[:10]
    )

    # Chat stats
    sessions_total  = ChatSession.objects.count()
    sessions_week   = ChatSession.objects.filter(started_at__gte=week_ago).count()
    sessions_month  = ChatSession.objects.filter(started_at__gte=month_ago).count()
    messages_total  = Message.objects.count()
    messages_week   = Message.objects.filter(timestamp__gte=week_ago).count()

    # Source distribution
    source_dist = list(
        Message.objects.filter(is_bot=True)
        .exclude(source='')
        .values('source')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    # Average similarity score
    avg_sim = Message.objects.filter(
        is_bot=True, similarity_score__isnull=False
    ).aggregate(avg=Avg('similarity_score'))['avg']

    # Forms & Announcements
    forms_total       = UniversityForm.objects.count()
    forms_published   = UniversityForm.objects.filter(status='published').count()
    ann_total         = Announcement.objects.count()
    ann_active        = Announcement.objects.filter(is_active=True).count()

    return Response({
        'knowledge_base': {
            'total': kb_total,
            'active': kb_active,
            'by_category': kb_by_cat,
        },
        'missing_questions': {
            'pending':   mq_pending,
            'resolved':  mq_resolved,
            'dismissed': mq_dismissed,
            'top_pending': mq_top,
        },
        'chat': {
            'sessions_total':  sessions_total,
            'sessions_week':   sessions_week,
            'sessions_month':  sessions_month,
            'messages_total':  messages_total,
            'messages_week':   messages_week,
            'source_distribution': source_dist,
            'avg_similarity': round(avg_sim, 3) if avg_sim else None,
        },
        'content': {
            'forms_total':     forms_total,
            'forms_published': forms_published,
            'ann_total':       ann_total,
            'ann_active':      ann_active,
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_activity(request):
    """
    Returns daily message counts for the past 30 days (for charts).
    """
    from django.db.models.functions import TruncDate

    now = timezone.now()
    month_ago = now - timedelta(days=30)

    daily = list(
        Message.objects
        .filter(timestamp__gte=month_ago)
        .annotate(date=TruncDate('timestamp'))
        .values('date', 'is_bot')
        .annotate(count=Count('id'))
        .order_by('date')
    )

    return Response({'daily_activity': daily})
