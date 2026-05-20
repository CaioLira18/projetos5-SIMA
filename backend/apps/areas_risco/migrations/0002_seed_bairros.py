"""
Popula a tabela ``bairros`` com os 94 bairros oficiais de Recife,
agrupados por RPA (Região Político-Administrativa), conforme Lei
Municipal nº 16.293/1997.

A reversão remove apenas os slugs criados aqui — preserva o que tenha
sido cadastrado depois via admin.
"""

from django.db import migrations
from django.utils.text import slugify


BAIRROS_RECIFE = [
    # RPA 1 — Centro
    ('Recife', 1), ('Santo Amaro', 1), ('Boa Vista', 1), ('Cabanga', 1),
    ('Coelhos', 1), ('Ilha do Leite', 1), ('Ilha Joana Bezerra', 1),
    ('Paissandu', 1), ('Santo Antônio', 1), ('São José', 1), ('Soledade', 1),

    # RPA 2 — Norte
    ('Água Fria', 2), ('Alto Santa Terezinha', 2), ('Arruda', 2),
    ('Beberibe', 2), ('Bomba do Hemetério', 2), ('Cajueiro', 2),
    ('Campina do Barreto', 2), ('Campo Grande', 2), ('Dois Unidos', 2),
    ('Encruzilhada', 2), ('Fundão', 2), ('Hipódromo', 2),
    ('Linha do Tiro', 2), ('Peixinhos', 2), ('Ponto de Parada', 2),
    ('Porto da Madeira', 2), ('Rosarinho', 2), ('Torreão', 2),

    # RPA 3 — Noroeste
    ('Alto do Mandu', 3), ('Alto José Bonifácio', 3), ('Alto José do Pinho', 3),
    ('Apipucos', 3), ('Brejo de Beberibe', 3), ('Brejo da Guabiraba', 3),
    ('Casa Amarela', 3), ('Casa Forte', 3), ('Córrego do Jenipapo', 3),
    ('Derby', 3), ('Dois Irmãos', 3), ('Espinheiro', 3), ('Graças', 3),
    ('Guabiraba', 3), ('Jaqueira', 3), ('Macaxeira', 3), ('Mangabeira', 3),
    ('Monteiro', 3), ('Morro da Conceição', 3), ('Nova Descoberta', 3),
    ('Parnamirim', 3), ('Passarinho', 3), ('Pau-Ferro', 3),
    ('Poço da Panela', 3), ('Santana', 3), ('Sítio dos Pintos', 3),
    ('Tamarineira', 3), ('Vasco da Gama', 3),

    # RPA 4 — Oeste
    ('Caxangá', 4), ('Cidade Universitária', 4), ('Cordeiro', 4),
    ('Engenho do Meio', 4), ('Ilha do Retiro', 4), ('Iputinga', 4),
    ('Madalena', 4), ('Prado', 4), ('Torre', 4), ('Torrões', 4),
    ('Várzea', 4), ('Zumbi', 4),

    # RPA 5 — Sudoeste
    ('Afogados', 5), ('Areias', 5), ('Barro', 5), ('Bongi', 5),
    ('Caçote', 5), ('Coqueiral', 5), ('Curado', 5), ('Estância', 5),
    ('Jardim São Paulo', 5), ('Jiquiá', 5), ('Mangueira', 5),
    ('Mustardinha', 5), ('San Martin', 5), ('Sancho', 5),
    ('Tejipió', 5), ('Totó', 5),

    # RPA 6 — Sul
    ('Boa Viagem', 6), ('Brasília Teimosa', 6), ('Cohab', 6),
    ('Ibura', 6), ('Imbiribeira', 6), ('Ipsep', 6), ('Jordão', 6),
    ('Pina', 6), ('Setúbal', 6),
]


def popular_bairros(apps, schema_editor):
    Bairro = apps.get_model('areas_risco', 'Bairro')
    Bairro.objects.bulk_create(
        [
            Bairro(nome=nome, slug=slugify(nome), rpa=rpa)
            for nome, rpa in BAIRROS_RECIFE
        ],
        ignore_conflicts=True,
    )


def remover_bairros(apps, schema_editor):
    Bairro = apps.get_model('areas_risco', 'Bairro')
    slugs = [slugify(nome) for nome, _ in BAIRROS_RECIFE]
    Bairro.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('areas_risco', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(popular_bairros, remover_bairros),
    ]
