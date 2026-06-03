"""
Endpoints do painel da Defesa Civil (US06).

Por enquanto temos só um resumo agregado dos relatos. À medida que US07
(alertas automáticos) e US09 (sensores IoT) forem implementadas, novas
seções entram aqui.
"""

from datetime import timedelta

from django.db.models import Case, Count, IntegerField, Max, When
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.relatos.models import Relato
from apps.users.permissions import IsDefesaCivilOrAdmin

# Pesos pra agregar o nível "máximo" via SQL (não dá MAX direto em CharField).
PESO_POR_NIVEL = Case(
    When(nivel='baixo', then=1),
    When(nivel='medio', then=2),
    When(nivel='alto', then=3),
    default=0,
    output_field=IntegerField(),
)
NIVEL_POR_PESO = {0: None, 1: 'baixo', 2: 'medio', 3: 'alto'}

# Quantos bairros listar no "top críticos".
LIMITE_BAIRROS = 10
JANELA_HORAS = 24


class DashboardResumoView(APIView):
    """GET /api/dashboard/resumo/ — métricas agregadas pra o painel."""

    permission_classes = [IsAuthenticated, IsDefesaCivilOrAdmin]

    def get(self, request):
        agora = timezone.now()
        inicio_hoje = timezone.localtime(agora).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        janela_24h = agora - timedelta(hours=JANELA_HORAS)
        inicio_semana = agora - timedelta(days=7)
        inicio_mes = agora - timedelta(days=30)

        relatos = Relato.objects.all()

        totais = {
            'hoje': relatos.filter(created_at__gte=inicio_hoje).count(),
            'semana': relatos.filter(created_at__gte=inicio_semana).count(),
            'mes': relatos.filter(created_at__gte=inicio_mes).count(),
        }

        # por_nivel: garante as três chaves mesmo quando algum nível está zerado.
        contagem_nivel = dict(
            relatos.filter(created_at__gte=janela_24h)
            .values('nivel')
            .annotate(total=Count('id'))
            .values_list('nivel', 'total')
        )
        por_nivel = {n: contagem_nivel.get(n, 0) for n in ('baixo', 'medio', 'alto')}

        por_bairro_qs = (
            relatos.filter(created_at__gte=janela_24h, bairro__isnull=False)
            .values('bairro_id', 'bairro__nome', 'bairro__slug')
            .annotate(total=Count('id'), peso_max=Max(PESO_POR_NIVEL))
            .order_by('-total', 'bairro__nome')[:LIMITE_BAIRROS]
        )
        por_bairro = [
            {
                'bairro': {
                    'id': row['bairro_id'],
                    'nome': row['bairro__nome'],
                    'slug': row['bairro__slug'],
                },
                'total': row['total'],
                'nivel_maximo': NIVEL_POR_PESO[row['peso_max']],
            }
            for row in por_bairro_qs
        ]

        ultimo = relatos.order_by('-created_at').values_list('created_at', flat=True).first()

        return Response(
            {
                'janela_horas': JANELA_HORAS,
                'totais': totais,
                'por_nivel': por_nivel,
                'por_bairro': por_bairro,
                'ultimo_relato_em': ultimo,
            }
        )
