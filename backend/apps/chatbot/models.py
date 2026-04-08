from django.db import models
from django.conf import settings
from pgvector.django import VectorField


CATEGORY_CHOICES = [
    ('registration', 'Registration'),
    ('grades',       'Grades'),
    ('graduation',   'Graduation'),
    ('financial',    'Financial'),
    ('general',      'General'),
    ('internship',   'Internship'),
]


class KnowledgeBase(models.Model):
    """
    Stores Q&A pairs that the chatbot uses to answer questions.
    Each item has an embedding vector for semantic search.
    """
    question   = models.TextField()
    answer     = models.TextField()
    category   = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    embedding  = VectorField(dimensions=768, null=True, blank=True)
    is_active  = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='kb_items'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'knowledge_base'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.category}] {self.question[:60]}'


class UniversityForm(models.Model):
    """
    University forms that students can view and download.
    """
    STATUS_CHOICES = [
        ('published', 'Published'),
        ('draft',     'Draft'),
    ]

    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category    = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    file        = models.FileField(upload_to='forms/', null=True, blank=True)
    file_url    = models.URLField(blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_forms'
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'university_forms'
        ordering = ['category', 'title']

    def __str__(self):
        return self.title

    @property
    def download_url(self):
        if self.file:
            return self.file.url
        return self.file_url or None


class Announcement(models.Model):
    """
    University announcements shown to students.
    """
    ANN_CATEGORY_CHOICES = [
        ('registrar',  'Registrar'),
        ('internship', 'Internship'),
        ('exams',      'Exams'),
        ('general',    'General'),
    ]

    title      = models.CharField(max_length=200)
    content    = models.TextField()
    category   = models.CharField(max_length=50, choices=ANN_CATEGORY_CHOICES, default='general')
    start_date = models.DateField()
    end_date   = models.DateField(null=True, blank=True)
    is_active  = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='announcements'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'announcements'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ChatSession(models.Model):
    """
    Represents one full conversation between a user and the chatbot.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='sessions'
    )
    language        = models.CharField(max_length=5, default='en')
    feedback_rating = models.PositiveSmallIntegerField(null=True, blank=True)
    started_at      = models.DateTimeField(auto_now_add=True)
    ended_at        = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'chat_sessions'
        ordering = ['-started_at']

    def __str__(self):
        return f'Session {self.id} — {self.user}'


class Message(models.Model):
    """
    A single message inside a ChatSession.
    Stores both student messages and bot responses.
    """
    SOURCE_CHOICES = [
        ('knowledge_base', 'Knowledge Base'),
        ('llm',            'LLM Generated'),
        ('fallback',       'Fallback'),
    ]

    session          = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    is_bot           = models.BooleanField(default=False)
    content          = models.TextField()
    source           = models.CharField(max_length=20, choices=SOURCE_CHOICES, blank=True)
    similarity_score = models.FloatField(null=True, blank=True)
    timestamp        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['timestamp']

    def __str__(self):
        sender = 'Bot' if self.is_bot else 'User'
        return f'[{sender}] {self.content[:60]}'


class MissingQuestion(models.Model):
    """
    Questions the chatbot could not answer.
    Admins review these and add them to the knowledge base.
    """
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('resolved',  'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    session    = models.ForeignKey(ChatSession, on_delete=models.SET_NULL, null=True, related_name='missing_questions')
    content    = models.TextField()
    frequency  = models.PositiveIntegerField(default=1)
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = 'missing_questions'
        ordering  = ['-frequency', '-created_at']

    def __str__(self):
        return f'Missing ({self.frequency}x): {self.content[:60]}'