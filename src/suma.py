def sumar(a: int, b: int) -> int:
    return a + b


def calcular(a: float, operador: str, b: float) -> float:
    if operador == "+":
        return a + b
    if operador == "-":
        return a - b
    if operador == "*":
        return a * b
    if operador == "/":
        if b == 0:
            raise ZeroDivisionError("No se puede dividir entre cero.")
        return a / b
    if operador == "%":
        if b == 0:
            raise ZeroDivisionError("No se puede calcular módulo entre cero.")
        return a % b
    if operador == "**":
        return a ** b
    raise ValueError(f"Operación no admitida: {operador}")


def main() -> None:
    num1 = 5
    num2 = 10
    resultado = sumar(num1, num2)
    print(f"El primer número es: {num1}")
    print(f"El segundo número es: {num2}")
    print(f"El resultado de la suma automatizada es: {resultado}")


if __name__ == "__main__":
    main()