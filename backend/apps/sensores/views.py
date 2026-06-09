from rest_framework import generics, permissions

from .models import Sensor
from .serializers import SensorSerializer


class SoAdminEscrita(permissions.BasePermission):
    """Leitura: qualquer usuário autenticado. Escrita: apenas admin/superuser."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(request.user, 'role', '') == 'admin' or request.user.is_superuser


class SensorListCreateView(generics.ListCreateAPIView):
    """GET  /api/sensores/  — lista todos os sensores (filtro ?ativo=true).
    POST /api/sensores/  — cadastra novo sensor (admin).
    """

    serializer_class = SensorSerializer
    permission_classes = [SoAdminEscrita]

    def get_queryset(self):
        qs = Sensor.objects.select_related('bairro').all()
        ativo = self.request.query_params.get('ativo')
        if ativo == 'true':
            qs = qs.filter(ativo=True)
        elif ativo == 'false':
            qs = qs.filter(ativo=False)
        return qs


class SensorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET    /api/sensores/<id>/  — detalhe.
    PATCH  /api/sensores/<id>/  — edita (admin).
    DELETE /api/sensores/<id>/  — remove (admin).
    """

    queryset = Sensor.objects.select_related('bairro').all()
    serializer_class = SensorSerializer
    permission_classes = [SoAdminEscrita]

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
