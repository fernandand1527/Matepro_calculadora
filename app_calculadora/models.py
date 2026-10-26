from django.db import models


class Calculation(models.Model):
    first_value = models.FloatField()
    second_value = models.FloatField()
    operator = models.CharField(max_length=2)
    result = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-pk"]

    def __str__(self):
        return f"{self.first_value} {self.operator} {self.second_value} = {self.result}"