"""Rota standalone /api/bairros/ — listagem pública dos bairros de Recife."""

from django.urls import path

from . import views

app_name = 'bairros'

urlpatterns = [
    path('', views.BairroListView.as_view(), name='lista'),
]
