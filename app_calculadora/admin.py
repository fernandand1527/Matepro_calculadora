from django.contrib import admin

from .models import Calculation

@admin.action(description="Eliminar cálculos seleccionados")
def delete_calculations(modeladmin, request, queryset):
    queryset.delete()


@admin.register(Calculation)
class CalculationAdmin(admin.ModelAdmin):
    list_display = ("first_value", "operator", "second_value", "result", "created_at")
    list_filter = ("created_at",)
    search_fields = ("first_value", "second_value", "operator", "result")
    actions = [delete_calculations]


admin.site.site_header = "Calculadora Admin"
