from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'pages', views.PageViewSet, basename='page')
router.register(r'tags', views.TagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
    path('pages/<uuid:page_id>/blocks/', views.BlockListView.as_view(), name='page-blocks'),
    path('blocks/<uuid:block_id>/', views.BlockDetailView.as_view(), name='block-detail'),
    path('pages/<uuid:page_id>/comments/', views.CommentListView.as_view(), name='page-comments'),
    path('comments/<int:comment_id>/', views.CommentDetailView.as_view(), name='comment-detail'),
    path('pages/<uuid:page_id>/versions/', views.PageVersionListView.as_view(), name='page-versions'),
    path('search/', views.SearchView.as_view(), name='search'),
]
