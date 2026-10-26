import math
import os
import sqlite3
from pathlib import Path

from django.conf import settings
from django.db import connections
from django.shortcuts import render

from app_calculadora.models import Calculation
from src.suma import calcular


OPERADORES = {
    "+": "Sumar",
    "-": "Restar",
    "*": "Multiplicar",
    "/": "Dividir",
    "%": "Módulo",
    "**": "Potencia",
}

SIMBOLOS = {"*": "×", "/": "÷", "-": "−", "**": "^"}


def monitor(request):
    databases = []

    sqlite_path = Path(os.environ.get("SQLITE_PATH", settings.BASE_DIR / "db.sqlite3"))
    try:
        with sqlite3.connect(sqlite_path, timeout=2) as connection:
            connection.execute("SELECT 1").fetchone()
        databases.append({
            "name": "SQLite",
            "kind": "Relacional · archivo local",
            "state": "connected",
            "detail": "Conectada. En Render el archivo es temporal; no usar para datos persistentes.",
        })
    except (OSError, sqlite3.Error):
        databases.append({
            "name": "SQLite",
            "kind": "Relacional · archivo local",
            "state": "error",
            "detail": "No fue posible abrir el archivo SQLite.",
        })

    if os.environ.get("DATABASE_URL"):
        try:
            with connections["default"].cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            databases.append({
                "name": "PostgreSQL · Neon",
                "kind": "Relacional · historial de cálculos",
                "state": "connected",
                "detail": "Conexión verificada mediante DATABASE_URL.",
            })
        except Exception:
            databases.append({
                "name": "PostgreSQL · Neon",
                "kind": "Relacional · historial de cálculos",
                "state": "error",
                "detail": "No fue posible conectar. Revisa DATABASE_URL en Render.",
            })
    else:
        databases.append({
            "name": "PostgreSQL · Neon",
            "kind": "Relacional · historial de cálculos",
            "state": "unconfigured",
            "detail": "Configura DATABASE_URL en las variables de entorno.",
        })

    mongodb_uri = os.environ.get("MONGODB_URI")
    if mongodb_uri:
        try:
            from pymongo import MongoClient

            with MongoClient(mongodb_uri, serverSelectionTimeoutMS=3000) as client:
                client.admin.command("ping")
            databases.append({
                "name": "MongoDB Atlas",
                "kind": "Documental · conexión Atlas",
                "state": "connected",
                "detail": "Ping correcto. Conexión disponible para documentos.",
            })
        except Exception:
            databases.append({
                "name": "MongoDB Atlas",
                "kind": "Documental · conexión Atlas",
                "state": "error",
                "detail": "No fue posible conectar. Revisa MONGODB_URI en Render.",
            })
    else:
        databases.append({
            "name": "MongoDB Atlas",
            "kind": "Documental · conexión Atlas",
            "state": "unconfigured",
            "detail": "Configura MONGODB_URI en las variables de entorno.",
        })

    mysql_values = [
        os.environ.get("MYSQL_HOST"),
        os.environ.get("MYSQL_USER"),
        os.environ.get("MYSQL_PASSWORD"),
        os.environ.get("MYSQL_DATABASE"),
    ]
    if all(mysql_values):
        try:
            import mysql.connector

            with mysql.connector.connect(
                host=mysql_values[0],
                port=int(os.environ.get("MYSQL_PORT", "3306")),
                user=mysql_values[1],
                password=mysql_values[2],
                database=mysql_values[3],
                connection_timeout=3,
            ) as connection:
                cursor = connection.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
            databases.append({
                "name": "MySQL",
                "kind": "Relacional · conexión externa",
                "state": "connected",
                "detail": "Conexión verificada mediante MYSQL_*.",
            })
        except Exception:
            databases.append({
                "name": "MySQL",
                "kind": "Relacional · conexión externa",
                "state": "error",
                "detail": "No fue posible conectar. Revisa las variables MYSQL_* en Render.",
            })
    else:
        databases.append({
            "name": "MySQL",
            "kind": "Relacional · conexión externa",
            "state": "unconfigured",
            "detail": "Configura MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD y MYSQL_DATABASE.",
        })

    return render(request, "app_calculadora/monitor.html", {"databases": databases})


def inicio(request):
    contexto = {
        "operadores": OPERADORES,
        "numero_a": "",
        "numero_b": "",
        "resultado": None,
        "operador_seleccionado": "+",
        "historial": Calculation.objects.all()[:5],
        "historial_total": Calculation.objects.count(),
    }

    if request.method == "POST":
        numero_a = request.POST.get("numero_a", "").strip()
        numero_b = request.POST.get("numero_b", "").strip()
        operador = request.POST.get("operador", "")
        contexto.update({"numero_a": numero_a, "numero_b": numero_b})
        if operador in OPERADORES:
            contexto["operador_seleccionado"] = operador

        if not numero_a or not numero_b:
            contexto["error"] = "Escribe los dos números para continuar."
        elif operador not in OPERADORES:
            contexto["error"] = "Selecciona una operación válida."
        else:
            try:
                valor_a = float(numero_a)
                valor_b = float(numero_b)
                if not math.isfinite(valor_a) or not math.isfinite(valor_b):
                    raise ValueError
                resultado = calcular(valor_a, operador, valor_b)
                if isinstance(resultado, complex) or not math.isfinite(resultado):
                    raise ValueError
                contexto["resultado"] = f"{resultado:.12g}"
                contexto["operacion"] = OPERADORES[operador]
                contexto["expresion"] = (
                    f"{numero_a} {SIMBOLOS.get(operador, operador)} {numero_b}"
                )
                Calculation.objects.create(
                    first_value=valor_a,
                    second_value=valor_b,
                    operator=operador,
                    result=float(resultado),
                )
                contexto["historial"] = Calculation.objects.all()[:5]
                contexto["historial_total"] = Calculation.objects.count()
            except ZeroDivisionError:
                contexto["error"] = "No se puede dividir entre cero."
            except (ValueError, OverflowError):
                contexto["error"] = "Ingresa números válidos y un resultado posible."

    return render(request, "app_calculadora/inicio.html", contexto)