from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notifications'),
    path('<uuid:notification_id>/read/', views.MarkNotificationReadView.as_view(), name='mark-read'),
    path('mark-all-read/', views.MarkAllReadView.as_view(), name='mark-all-read'),
    path('create/', views.create_notification_api, name='create-notification'),
    path('settings/', views.NotificationSettingsView.as_view(), name='notification-settings'),
    path('reminders/', views.ReminderListView.as_view(), name='reminders'),
    path('reminders/<uuid:reminder_id>/', views.ReminderDetailView.as_view(), name='reminder-detail'),
]
