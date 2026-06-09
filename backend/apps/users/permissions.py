"""Permissões customizadas baseadas no ``role`` do User."""

from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """Permite acesso somente a administradores (role='admin' ou superuser)."""

    message = 'Apenas administradores podem acessar.'

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser:
            return True
        return getattr(user, 'role', None) == 'admin'


class IsDefesaCivilOrAdmin(permissions.BasePermission):
    """Permite acesso somente a operadores da Defesa Civil e administradores.

    Superusers do Django também passam — facilita debug e operação.
    """

    message = 'Apenas operadores da Defesa Civil ou administradores podem acessar.'

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_superuser:
            return True
        return getattr(user, 'role', None) in ('defesa_civil', 'admin')
