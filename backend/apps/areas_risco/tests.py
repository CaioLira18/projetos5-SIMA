"""Testes do endpoint público de bairros."""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Bairro


class BairroListTests(APITestCase):
    """GET /api/bairros/"""

    def setUp(self):
        self.url = reverse('bairros:lista')

    def test_listagem_retorna_94_bairros_sem_paginacao(self):
        """Seed da migration 0002 popula 94 bairros oficiais de Recife."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Sem paginação: resposta é lista direta, não objeto com 'results'.
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), Bairro.objects.count())
        self.assertEqual(len(response.data), 94)

    def test_listagem_eh_publica(self):
        """Frontend precisa carregar antes do login pra montar o select."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_cada_item_tem_campos_basicos(self):
        response = self.client.get(self.url)
        primeiro = response.data[0]
        self.assertIn('id', primeiro)
        self.assertIn('nome', primeiro)
        self.assertIn('slug', primeiro)
        self.assertIn('rpa', primeiro)

    def test_filtro_por_rpa(self):
        response = self.client.get(self.url, {'rpa': '6'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
        for item in response.data:
            self.assertEqual(item['rpa'], 6)

    def test_ordenacao_alfabetica(self):
        response = self.client.get(self.url)
        nomes = [item['nome'] for item in response.data]
        self.assertEqual(nomes, sorted(nomes))
