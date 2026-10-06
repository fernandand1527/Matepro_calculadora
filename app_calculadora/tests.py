from django.test import TestCase
from django.urls import reverse


class CalculadoraTests(TestCase):
    def test_pagina_principal_se_muestra(self):
        response = self.client.get(reverse("inicio"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Nueva operación")

    def test_suma_dos_numeros(self):
        response = self.client.post(
            reverse("inicio"),
            {"numero_a": "12", "numero_b": "8", "operador": "+"},
        )

        self.assertContains(response, "20")

    def test_division_por_cero_muestra_error(self):
        response = self.client.post(
            reverse("inicio"),
            {"numero_a": "12", "numero_b": "0", "operador": "/"},
        )

        self.assertContains(response, "No se puede dividir entre cero.")

    def test_operador_invalido_no_se_ejecuta(self):
        response = self.client.post(
            reverse("inicio"),
            {"numero_a": "12", "numero_b": "8", "operador": "//"},
        )

        self.assertContains(response, "Selecciona una operación válida.")