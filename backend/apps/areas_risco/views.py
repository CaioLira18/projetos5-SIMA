"""Views do app areas_risco."""

from rest_framework import generics, permissions

from .models import Bairro
from .serializers import BairroSerializer


class BairroListView(generics.ListAPIView):
    """GET /api/bairros/  — lista todos os bairros oficiais de Recife.

    Sem paginação (são 94 itens — cabem numa resposta) e sem autenticação
    obrigatória (o select do frontend precisa carregar antes do login).
    Aceita ``?rpa=N`` pra filtrar por Região Político-Administrativa.
    """

    serializer_class = BairroSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = Bairro.objects.all()
        if rpa := self.request.query_params.get('rpa'):
            try:
                qs = qs.filter(rpa=int(rpa))
            except ValueError:
                pass
        return qs
