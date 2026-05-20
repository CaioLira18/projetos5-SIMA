"""
Bairros do Recife — entidade de referência usada por users, relatos e
(futuramente) áreas de risco / polígonos / thresholds.

Mantida em ``areas_risco`` por convenção: o app vai abrigar tudo que é
geográfico-administrativo da cidade.
"""

from django.db import models


class Bairro(models.Model):
    """Bairro oficial de Recife. Lista populada via data migration."""

    nome = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    rpa = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text='Região Político-Administrativa (1–6).',
    )

    class Meta:
        db_table = 'bairros'
        verbose_name = 'Bairro'
        verbose_name_plural = 'Bairros'
        ordering = ['nome']

    def __str__(self):
        return self.nome
