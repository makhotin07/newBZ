from django.urls import path
from . import views

urlpatterns = [
    # Share links
    path('share-links/', views.ShareLinkListView.as_view(), name='share-links'),
    path('share-links/create/', views.create_share_link, name='create-share-link'),
    path('share-links/<str:token>/', views.SharedContentView.as_view(), name='shared-content'),
    path('share-links/<str:token>/revoke/', views.revoke_share_link, name='revoke-share-link'),
    path('share-links/<str:token>/stats/', views.share_link_stats, name='share-link-stats'),
    
    # Active sessions for collaboration
    path('active-sessions/page/<uuid:page_id>/', views.ActiveSessionListView.as_view(), name='page-active-sessions'),
    path('active-sessions/database/<uuid:database_id>/', views.ActiveSessionListView.as_view(), name='database-active-sessions'),
    
    # Collaborative editing
    path('pages/<uuid:page_id>/cursor/', views.update_cursor_position, name='update-cursor-position'),
    path('pages/<uuid:page_id>/edit/', views.save_collaborative_edit, name='save-collaborative-edit'),
]
