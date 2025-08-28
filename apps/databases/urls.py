from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.DatabaseViewSet, basename='database')

urlpatterns = [
    path('', include(router.urls)),
    path('<uuid:database_id>/properties/', views.DatabasePropertyListView.as_view(), name='database-properties'),
    path('properties/<uuid:property_id>/', views.DatabasePropertyDetailView.as_view(), name='property-detail'),
    path('<uuid:database_id>/views/', views.DatabaseViewListView.as_view(), name='database-views'),
    path('views/<uuid:view_id>/', views.DatabaseViewDetailView.as_view(), name='view-detail'),
    path('<uuid:database_id>/records/', views.DatabaseRecordListView.as_view(), name='database-records'),
]
