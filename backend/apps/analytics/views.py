from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from apps.chatbot.models import ChatSession, Message, MissingQuestion


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overview(request):
    """High-level analytics overview."""
    days = int(request.query_params.get('days', 30))
    since = timezone.now() - timedelta(days=days)

    sessions = ChatSession.objects.filter(started_at__gte=since)
    messages = Message.objects.filter(timestamp__gte=since)
    bot_messages = messages.filter(is_bot=True)

    source_breakdown = list(
        bot_messages.exclude(source='')
        .values('source')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    avg_sim = bot_messages.filter(
        similarity_score__isnull=False
    ).aggregate(avg=Avg('similarity_score'))['avg']

    return Response({
        'period_days':      days,
        'total_sessions':   sessions.count(),
        'total_messages':   messages.count(),
        'bot_messages':     bot_messages.count(),
        'user_messages':    messages.filter(is_bot=False).count(),
        'source_breakdown': source_breakdown,
        'avg_similarity':   round(avg_sim, 3) if avg_sim else None,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_activity(request):
    """Daily message volume for the last N days (chart data)."""
    days = int(request.query_params.get('days', 30))
    since = timezone.now() - timedelta(days=days)

    data = list(
        Message.objects.filter(timestamp__gte=since)
        .annotate(date=TruncDate('timestamp'))
        .values('date')
        .annotate(
            total=Count('id'),
            user_msgs=Count('id', filter=Q(is_bot=False)),
            bot_msgs=Count('id', filter=Q(is_bot=True)),
        )
        .order_by('date')
    )

    return Response({'daily': data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_missing(request):
    """Most-asked unanswered questions."""
    limit = int(request.query_params.get('limit', 20))
    questions = list(
        MissingQuestion.objects
        .filter(status='pending')
        .order_by('-frequency')
        .values('id', 'content', 'frequency', 'status', 'created_at')[:limit]
    )
    return Response({'missing_questions': questions})
