from django.urls import path
from . import views

urlpatterns = [
    path('stats/',         views.dashboard_stats, name='admin-stats'),
    path('chat-activity/', views.chat_activity,   name='admin-chat-activity'),
]
