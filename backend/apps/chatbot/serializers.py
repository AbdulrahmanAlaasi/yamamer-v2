from rest_framework import serializers
from .models import ChatSession, Message, KnowledgeBase, MissingQuestion, UniversityForm, Announcement


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'is_bot', 'content', 'source', 'similarity_score', 'timestamp']
        read_only_fields = fields


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'language', 'feedback_rating', 'started_at', 'ended_at', 'messages']
        read_only_fields = ['id', 'started_at', 'ended_at']


class ChatMessageInputSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000)
    session_id = serializers.IntegerField(required=False, allow_null=True)
    language = serializers.ChoiceField(choices=['en', 'ar'], default='en')


class ChatResponseSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    answer = serializers.CharField()
    source = serializers.CharField()
    similarity_score = serializers.FloatField()
    chunks_used = serializers.IntegerField()


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeBase
        fields = ['id', 'question', 'answer', 'category', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class MissingQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MissingQuestion
        fields = ['id', 'content', 'frequency', 'status', 'created_at']
        read_only_fields = ['id', 'content', 'frequency', 'created_at']


class UniversityFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniversityForm
        fields = ['id', 'title', 'description', 'category', 'file', 'file_url', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'category', 'start_date', 'end_date', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
