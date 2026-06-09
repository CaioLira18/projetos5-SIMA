import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('areas_risco', '0002_seed_bairros'),
    ]

    operations = [
        migrations.CreateModel(
            name='Sensor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=120)),
                ('tipo', models.CharField(
                    choices=[
                        ('pluviometro',  'Pluviômetro'),
                        ('regua_nivel',  'Régua de Nível'),
                        ('camera',       'Câmera'),
                        ('iot_generico', 'IoT Genérico'),
                    ],
                    default='iot_generico',
                    max_length=20,
                )),
                ('descricao', models.TextField(blank=True, max_length=500)),
                ('lat', models.DecimalField(decimal_places=6, max_digits=9)),
                ('lng', models.DecimalField(decimal_places=6, max_digits=9)),
                ('bairro', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='sensores',
                    to='areas_risco.bairro',
                )),
                ('ativo', models.BooleanField(default=True)),
                ('ultimo_dado_em', models.DateTimeField(
                    blank=True,
                    null=True,
                    help_text='Último dado recebido do sensor.',
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Sensor',
                'verbose_name_plural': 'Sensores',
                'db_table': 'sensores',
                'ordering': ['nome'],
            },
        ),
    ]
