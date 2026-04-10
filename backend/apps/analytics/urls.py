from django.urls import path
from . import views

urlpatterns = [
    path('',             views.overview,       name='analytics-overview'),
    path('daily/',       views.daily_activity, name='analytics-daily'),
    path('top-missing/', views.top_missing,    name='analytics-top-missing'),
]