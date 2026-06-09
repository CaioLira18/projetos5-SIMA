from rest_framework import serializers

from .models import Sensor


class SensorSerializer(serializers.ModelSerializer):
    bairro_nome  = serializers.CharField(source='bairro.nome', read_only=True, default=None)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model  = Sensor
        fields = [
            'id', 'nome', 'tipo', 'tipo_display', 'descricao',
            'lat', 'lng', 'bairro', 'bairro_nome',
            'ativo', 'ultimo_dado_em', 'created_at',
        ]
        read_only_fields = ['id', 'ultimo_dado_em', 'created_at']
