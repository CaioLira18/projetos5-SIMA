from django.contrib import admin

from .models import Sensor


@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display  = ('id', 'nome', 'tipo', 'bairro', 'ativo', 'ultimo_dado_em', 'created_at')
    list_filter   = ('tipo', 'ativo')
    search_fields = ('nome',)
    raw_id_fields = ('bairro',)
    ordering      = ('nome',)
    readonly_fields = ('ultimo_dado_em', 'created_at')
