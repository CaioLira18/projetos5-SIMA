"""Testes do painel da Defesa Civil (US06)."""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.areas_risco.models import Bairro
from apps.relatos.models import Relato

User = get_user_model()


def criar_relato(user, nivel, bairro=None, idade=None):
    """Cria um relato e (opcionalmente) força o created_at pra trás.

    ``auto_now_add`` impede o create direto com timestamp customizado,
    então gravamos e atualizamos em seguida.
    """
    relato = Relato.objects.create(
        user=user,
        lat=-8.0,
        lng=-34.9,
        bairro=bairro,
        nivel=nivel,
        descricao='teste',
    )
    if idade is not None:
        Relato.objects.filter(id=relato.id).update(
            created_at=timezone.now() - idade
        )
    return relato


class DashboardPermissionTests(APITestCase):
    """GET /api/dashboard/resumo/ exige role defesa_civil ou admin."""

    def setUp(self):
        self.url = reverse('dashboard:resumo')
        self.cidadao = User.objects.create_user(
            email='cidadao@ex.com', password='senha-forte-123', nome='Cid'
        )
        self.defesa = User.objects.create_user(
            email='defesa@ex.com',
            password='senha-forte-123',
            nome='Def',
            role=User.Role.DEFESA_CIVIL,
        )
        self.admin = User.objects.create_user(
            email='admin@ex.com',
            password='senha-forte-123',
            nome='Adm',
            role=User.Role.ADMIN,
        )

    def test_anonimo_recebe_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cidadao_recebe_403(self):
        self.client.force_authenticate(user=self.cidadao)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_defesa_civil_recebe_200(self):
        self.client.force_authenticate(user=self.defesa)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_recebe_200(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class DashboardResumoTests(APITestCase):
    """Estrutura e agregações do payload."""

    def setUp(self):
        self.url = reverse('dashboard:resumo')
        self.operador = User.objects.create_user(
            email='op@ex.com',
            password='senha-forte-123',
            nome='Op',
            role=User.Role.DEFESA_CIVIL,
        )
        self.cidadao = User.objects.create_user(
            email='cid@ex.com', password='senha-forte-123', nome='Cid'
        )
        self.ibura = Bairro.objects.get(slug='ibura')
        self.boa_viagem = Bairro.objects.get(slug='boa-viagem')
        self.client.force_authenticate(user=self.operador)

    def test_payload_vazio_tem_estrutura_correta(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['janela_horas'], 24)
        self.assertEqual(data['totais'], {'hoje': 0, 'semana': 0, 'mes': 0})
        self.assertEqual(data['por_nivel'], {'baixo': 0, 'medio': 0, 'alto': 0})
        self.assertEqual(data['por_bairro'], [])
        self.assertIsNone(data['ultimo_relato_em'])

    def test_totais_respeitam_janelas_de_tempo(self):
        # Agora, há 6 dias, há 10 dias, há 35 dias
        criar_relato(self.cidadao, 'baixo', self.ibura)
        criar_relato(self.cidadao, 'baixo', self.ibura, idade=timedelta(days=6))
        criar_relato(self.cidadao, 'baixo', self.ibura, idade=timedelta(days=10))
        criar_relato(self.cidadao, 'baixo', self.ibura, idade=timedelta(days=35))

        response = self.client.get(self.url)
        totais = response.data['totais']
        self.assertEqual(totais['semana'], 2)  # 0d + 6d
        self.assertEqual(totais['mes'], 3)     # + 10d
        self.assertGreaterEqual(totais['hoje'], 1)  # pelo menos o de agora

    def test_por_nivel_apenas_ultimas_24h(self):
        criar_relato(self.cidadao, 'baixo', self.ibura)
        criar_relato(self.cidadao, 'medio', self.ibura)
        criar_relato(self.cidadao, 'medio', self.ibura)
        criar_relato(self.cidadao, 'alto', self.ibura)
        # Antigo (fora da janela) — não deve aparecer
        criar_relato(self.cidadao, 'alto', self.ibura, idade=timedelta(hours=30))

        response = self.client.get(self.url)
        self.assertEqual(response.data['por_nivel'], {'baixo': 1, 'medio': 2, 'alto': 1})

    def test_por_bairro_ordena_por_total_desc_e_calcula_nivel_maximo(self):
        # Ibura: 3 relatos (max = alto)
        criar_relato(self.cidadao, 'baixo', self.ibura)
        criar_relato(self.cidadao, 'medio', self.ibura)
        criar_relato(self.cidadao, 'alto', self.ibura)
        # Boa Viagem: 2 relatos (max = medio)
        criar_relato(self.cidadao, 'baixo', self.boa_viagem)
        criar_relato(self.cidadao, 'medio', self.boa_viagem)

        response = self.client.get(self.url)
        bairros = response.data['por_bairro']
        self.assertEqual(len(bairros), 2)

        self.assertEqual(bairros[0]['bairro']['slug'], 'ibura')
        self.assertEqual(bairros[0]['total'], 3)
        self.assertEqual(bairros[0]['nivel_maximo'], 'alto')

        self.assertEqual(bairros[1]['bairro']['slug'], 'boa-viagem')
        self.assertEqual(bairros[1]['total'], 2)
        self.assertEqual(bairros[1]['nivel_maximo'], 'medio')

    def test_por_bairro_ignora_relatos_sem_bairro(self):
        criar_relato(self.cidadao, 'alto', bairro=None)
        criar_relato(self.cidadao, 'baixo', self.ibura)

        response = self.client.get(self.url)
        bairros = response.data['por_bairro']
        self.assertEqual(len(bairros), 1)
        self.assertEqual(bairros[0]['bairro']['slug'], 'ibura')

    def test_por_bairro_ignora_relatos_fora_da_janela(self):
        criar_relato(self.cidadao, 'alto', self.ibura, idade=timedelta(hours=30))
        response = self.client.get(self.url)
        self.assertEqual(response.data['por_bairro'], [])

    def test_ultimo_relato_em_eh_o_mais_recente(self):
        criar_relato(self.cidadao, 'baixo', self.ibura, idade=timedelta(hours=2))
        criar_relato(self.cidadao, 'medio', self.ibura, idade=timedelta(hours=5))
        criar_relato(self.cidadao, 'alto', self.ibura, idade=timedelta(days=2))

        response = self.client.get(self.url)
        ultimo = response.data['ultimo_relato_em']
        self.assertIsNotNone(ultimo)
        # Deve estar próximo de "agora - 2h", não "agora - 2 dias".
        delta = timezone.now() - ultimo
        self.assertLess(delta, timedelta(hours=3))
