import math

from django.shortcuts import render

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


def inicio(request):
    contexto = {
        "operadores": OPERADORES,
        "numero_a": "",
        "numero_b": "",
        "resultado": None,
        "operador_seleccionado": "+",
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
            except ZeroDivisionError:
                contexto["error"] = "No se puede dividir entre cero."
            except (ValueError, OverflowError):
                contexto["error"] = "Ingresa números válidos y un resultado posible."

    return render(request, "app_calculadora/inicio.html", contexto)