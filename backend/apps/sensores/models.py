from django.db import models


class Sensor(models.Model):
    """Sensor IoT de monitoramento instalado em campo — US09."""

    class Tipo(models.TextChoices):
        PLUVIOMETRO  = 'pluviometro',  'Pluviômetro'
        REGUA_NIVEL  = 'regua_nivel',  'Régua de Nível'
        CAMERA       = 'camera',       'Câmera'
        IOT_GENERICO = 'iot_generico', 'IoT Genérico'

    nome        = models.CharField(max_length=120)
    tipo        = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.IOT_GENERICO)
    descricao   = models.TextField(max_length=500, blank=True)
    lat         = models.DecimalField(max_digits=9, decimal_places=6)
    lng         = models.DecimalField(max_digits=9, decimal_places=6)
    bairro      = models.ForeignKey(
        'areas_risco.Bairro',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sensores',
    )
    ativo          = models.BooleanField(default=True)
    ultimo_dado_em = models.DateTimeField(null=True, blank=True, help_text='Último dado recebido do sensor.')
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table         = 'sensores'
        verbose_name     = 'Sensor'
        verbose_name_plural = 'Sensores'
        ordering         = ['nome']

    def __str__(self):
        return f'{self.nome} ({self.get_tipo_display()})'
