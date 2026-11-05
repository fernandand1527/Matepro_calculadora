from django.db import models


class Calculation(models.Model):
    first_value = models.FloatField("primer número")
    operator = models.CharField("operador", max_length=2)
    second_value = models.FloatField("segundo número")
    result = models.FloatField("resultado")
    created_at = models.DateTimeField("fecha de creación", auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-pk"]
        verbose_name = "operación"
        verbose_name_plural = "operaciones"

    def __str__(self):
        return f"{self.first_value} {self.operator} {self.second_value} = {self.result}"