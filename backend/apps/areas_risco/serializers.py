"""Serializers do app areas_risco."""

from rest_framework import serializers

from .models import Bairro


class BairroSerializer(serializers.ModelSerializer):
    """Listagem pública de bairros — usada pelos selects do frontend."""

    class Meta:
        model = Bairro
        fields = ['id', 'nome', 'slug', 'rpa']
        read_only_fields = fields
