from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/auth/',      include('apps.users.urls')),
    path('api/chat/',      include('apps.chatbot.urls')),
    path('api/admin/',     include('apps.admin_panel.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)