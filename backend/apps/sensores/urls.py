from django.urls import path

from .views import SensorDetailView, SensorListCreateView

urlpatterns = [
    path('',        SensorListCreateView.as_view(), name='sensor_list'),
    path('<int:pk>/', SensorDetailView.as_view(),   name='sensor_detail'),
]
