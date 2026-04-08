from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sessions', views.ChatSessionViewSet, basename='chat-session')
router.register(r'knowledge-base', views.KnowledgeBaseViewSet, basename='knowledge-base')
router.register(r'missing-questions', views.MissingQuestionViewSet, basename='missing-question')
router.register(r'forms', views.UniversityFormViewSet, basename='university-form')
router.register(r'announcements', views.AnnouncementViewSet, basename='announcement')

urlpatterns = [
    path('', views.chat, name='chat'),
    path('', include(router.urls)),
]
