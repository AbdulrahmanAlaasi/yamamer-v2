from django.contrib import admin
from .models import KnowledgeBase, UniversityForm, Announcement, ChatSession, Message, MissingQuestion


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ['question_short', 'category', 'is_active', 'has_embedding', 'created_at']
    list_filter = ['category', 'is_active']
    search_fields = ['question', 'answer']

    def question_short(self, obj):
        return obj.question[:80]
    question_short.short_description = 'Question'

    def has_embedding(self, obj):
        return obj.embedding is not None
    has_embedding.boolean = True
    has_embedding.short_description = 'Embedded'


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'language', 'feedback_rating', 'started_at']
    list_filter = ['language']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'is_bot', 'content_short', 'source', 'similarity_score', 'timestamp']
    list_filter = ['is_bot', 'source']

    def content_short(self, obj):
        return obj.content[:80]
    content_short.short_description = 'Content'


@admin.register(MissingQuestion)
class MissingQuestionAdmin(admin.ModelAdmin):
    list_display = ['content_short', 'frequency', 'status', 'created_at']
    list_filter = ['status']

    def content_short(self, obj):
        return obj.content[:80]
    content_short.short_description = 'Question'


@admin.register(UniversityForm)
class UniversityFormAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'status', 'created_at']
    list_filter = ['category', 'status']


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_active', 'start_date', 'end_date']
    list_filter = ['category', 'is_active']
