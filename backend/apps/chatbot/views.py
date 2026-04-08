from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import ChatSession, KnowledgeBase, MissingQuestion, UniversityForm, Announcement
from .serializers import (
    ChatMessageInputSerializer,
    ChatResponseSerializer,
    ChatSessionSerializer,
    KnowledgeBaseSerializer,
    MissingQuestionSerializer,
    UniversityFormSerializer,
    AnnouncementSerializer,
)
from .services.rag import RAGPipeline


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def chat(request):
    """
    Main chat endpoint. Accepts a message, runs the RAG pipeline, returns an answer.
    Authenticated users get their sessions saved; anonymous users work too.
    """
    serializer = ChatMessageInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    message = serializer.validated_data['message']
    language = serializer.validated_data['language']
    session_id = serializer.validated_data.get('session_id')

    user = request.user if request.user.is_authenticated else None

    # Get or create session
    if session_id:
        try:
            session = ChatSession.objects.get(id=session_id)
        except ChatSession.DoesNotExist:
            session = ChatSession.objects.create(user=user, language=language)
    else:
        session = ChatSession.objects.create(user=user, language=language)

    # Run RAG pipeline
    pipeline = RAGPipeline()
    result = pipeline.answer(query=message, session=session, language=language)

    response_data = {
        'session_id': session.id,
        **result,
    }

    return Response(ChatResponseSerializer(response_data).data, status=status.HTTP_200_OK)


class ChatSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve chat sessions for the authenticated user."""
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)


class KnowledgeBaseViewSet(viewsets.ModelViewSet):
    """CRUD for knowledge base items. Admin only."""
    serializer_class = KnowledgeBaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category', 'is_active']
    search_fields = ['question', 'answer']

    def get_queryset(self):
        return KnowledgeBase.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MissingQuestionViewSet(viewsets.ModelViewSet):
    """View and manage missing questions. Admin only."""
    serializer_class = MissingQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']

    def get_queryset(self):
        return MissingQuestion.objects.all()


class UniversityFormViewSet(viewsets.ModelViewSet):
    """CRUD for university forms."""
    serializer_class = UniversityFormSerializer
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'description']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.action in ('list', 'retrieve'):
            return UniversityForm.objects.filter(status='published')
        return UniversityForm.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AnnouncementViewSet(viewsets.ModelViewSet):
    """CRUD for announcements."""
    serializer_class = AnnouncementSerializer
    filterset_fields = ['category', 'is_active']
    search_fields = ['title', 'content']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.action in ('list', 'retrieve'):
            return Announcement.objects.filter(is_active=True)
        return Announcement.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
