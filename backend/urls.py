from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Authentication
    path('api/auth/', include('apps.accounts.urls')),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/social/', include('allauth.socialaccount.urls')),
    
    # App APIs
    path('api/workspaces/', include('apps.workspaces.urls')),
    path('api/notes/', include('apps.notes.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/databases/', include('apps.databases.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/collaboration/', include('apps.collaboration.urls')),
    path('api/', include('apps.search.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
