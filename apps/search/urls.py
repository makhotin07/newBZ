from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'search', views.SearchViewSet, basename='search')
router.register(r'search-history', views.SearchHistoryViewSet, basename='search-history')
router.register(r'saved-searches', views.SavedSearchViewSet, basename='saved-searches')

urlpatterns = [
    path('', include(router.urls)),
    path('suggestions/', views.search_suggestions, name='search-suggestions'),
    path('quick-search/', views.quick_search, name='quick-search'),
]
