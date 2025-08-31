"""
Главные URL-маршруты проекта
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API маршруты (Clean Architecture)
    path('api/', include('backend.api.urls')),
    
    # OpenAPI документация
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
]

# Добавление статических и медиа файлов в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
