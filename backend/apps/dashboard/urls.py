"""Rotas do painel — agrupadas sob /api/dashboard/."""

from django.urls import path

from . import views

app_name = 'dashboard'

urlpatterns = [
    path('resumo/', views.DashboardResumoView.as_view(), name='resumo'),
]
