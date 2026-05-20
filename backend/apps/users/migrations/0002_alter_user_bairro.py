"""
Converte ``User.bairro`` de CharField pra FK em ``areas_risco.Bairro``.

Drop + add (sem preservação de dados de bairro). O campo é opcional e
dados de dev são triviais — o usuário pode reescolher pelo /api/users/me/
após a migration.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('areas_risco', '0002_seed_bairros'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='bairro',
        ),
        migrations.AddField(
            model_name='user',
            name='bairro',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='moradores',
                to='areas_risco.bairro',
            ),
        ),
    ]
