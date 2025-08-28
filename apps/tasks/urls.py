from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'boards', views.TaskBoardViewSet, basename='taskboard')
router.register(r'', views.TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
    path('boards/<uuid:board_id>/columns/', views.TaskColumnListView.as_view(), name='board-columns'),
    path('columns/<uuid:column_id>/', views.TaskColumnDetailView.as_view(), name='column-detail'),
    path('<uuid:task_id>/comments/', views.TaskCommentListView.as_view(), name='task-comments'),
    path('<uuid:task_id>/activities/', views.TaskActivityListView.as_view(), name='task-activities'),
]
