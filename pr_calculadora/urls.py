from django.contrib import admin
from django.urls import path

from app_calculadora.views import inicio


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", inicio, name="inicio"),
]