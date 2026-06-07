"""
Seed de conveniência: cria uma conta de Defesa Civil pra dev/demo.

Roda automaticamente em todo ``manage.py migrate`` (e portanto em todo
``docker compose up``, já que o backend executa ``migrate --noinput`` no
boot). Idempotente — se a conta já existe, não faz nada.

⚠️  CONVENIÊNCIA DE DESENVOLVIMENTO.
    Antes de qualquer deploy em ambiente público:
      - Trocar a senha ou remover esta migration.
      - Garantir que ``defesa@sima.local`` não conflite com domínios reais.

As credenciais ficam visíveis na tela de login (aba Defesa Civil) — o
componente ``Login.jsx`` no frontend assume EXATAMENTE estes valores.
Se mudar aqui, mudar lá também.
"""

from django.contrib.auth.hashers import make_password
from django.db import migrations

EMAIL_DEMO = 'defesa@sima.local'
SENHA_DEMO = 'defesa123'
NOME_DEMO = 'Defesa Civil (demo)'


def criar_conta_defesa_civil(apps, schema_editor):
    User = apps.get_model('users', 'User')
    if User.objects.filter(email=EMAIL_DEMO).exists():
        return
    # apps.get_model devolve o model histórico — sem os métodos do manager
    # customizado (create_user, set_password). Por isso a senha é hashada
    # manualmente com make_password.
    User.objects.create(
        nome=NOME_DEMO,
        email=EMAIL_DEMO,
        password=make_password(SENHA_DEMO),
        role='defesa_civil',
        is_active=True,
        is_staff=False,
        is_superuser=False,
    )


def remover_conta_defesa_civil(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(email=EMAIL_DEMO).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_user_bairro'),
    ]

    operations = [
        migrations.RunPython(
            criar_conta_defesa_civil,
            remover_conta_defesa_civil,
        ),
    ]
