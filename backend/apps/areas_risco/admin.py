"""Admin do app areas_risco."""

from django.contrib import admin

from .models import Bairro


@admin.register(Bairro)
class BairroAdmin(admin.ModelAdmin):
    list_display = ['nome', 'slug', 'rpa']
    list_filter = ['rpa']
    search_fields = ['nome', 'slug']
    readonly_fields = ['slug']
    ordering = ['nome']
