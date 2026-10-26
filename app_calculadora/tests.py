from django.test import TestCase
from django.urls import reverse

from app_calculadora.models import Calculation


class CalculadoraTests(TestCase):
    def test_pagina_principal_se_muestra(self):
        response = self.client.get(reverse("inicio"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Nueva operación")

    def test_panel_monitor_muestra_las_cuatro_bases(self):
        response = self.client.get(reverse("monitor"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "SQLite")
        self.assertContains(response, "PostgreSQL · Neon")
        self.assertContains(response, "MongoDB Atlas")
        self.assertContains(response, "MySQL")

    def test_suma_dos_numeros(self):
        response = self.client.post(
            reverse("inicio"),
            {"numero_a": "12", "numero_b": "8", "operador": "+"},
        )

        self.assertContains(response, "20")
        self.assertEqual(Calculation.objects.count(), 1)
        calculation = Calculation.objects.get()
        self.assertEqual(calculation.operator, "+")
        self.assertEqual(calculation.result, 20)

    def test_division_por_cero_muestra_error(self):
        response = self.client.post(
            reverse("inicio"),
            {"numero_a": "12", "numero_b": "0", "operador": "/"},
        )

        self.assertContains(response, "No se puede dividir entre cero.")
        self.assertEqual(Calculation.objects.count(), 0)

    def test_operador_invalido_no_se_ejecuta(self):
        response = self.client.post(
            reverse("inicio"),
            {"numero_a": "12", "numero_b": "8", "operador": "//"},
        )

        self.assertContains(response, "Selecciona una operación válida.")
        self.assertEqual(Calculation.objects.count(), 0)

    def test_historial_muestra_operaciones_guardadas(self):
        Calculation.objects.create(
            first_value=12,
            second_value=8,
            operator="+",
            result=20,
        )

        response = self.client.get(reverse("inicio"))

        self.assertContains(response, "12.0 + 8.0 = 20.0")
        self.assertEqual(response.context["historial_total"], 1)