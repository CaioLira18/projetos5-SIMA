"""
Converte ``Relato.bairro`` de CharField pra FK em ``areas_risco.Bairro``.

Drop + add com tratamento explícito do índice antigo (que estava em
cima da coluna de string). Mesma justificativa de users/0002 pra não
preservar dados.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('areas_risco', '0002_seed_bairros'),
        ('relatos', '0001_initial'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='relato',
            name='relatos_bairro_0fed70_idx',
        ),
        migrations.RemoveField(
            model_name='relato',
            name='bairro',
        ),
        migrations.AddField(
            model_name='relato',
            name='bairro',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='relatos',
                to='areas_risco.bairro',
            ),
        ),
        migrations.AddIndex(
            model_name='relato',
            index=models.Index(fields=['bairro'], name='relatos_bairro_id_idx'),
        ),
    ]
