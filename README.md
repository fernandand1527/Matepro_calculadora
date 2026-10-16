# Calculadora en Python y Django

[![Ver calculadora en la nube](https://img.shields.io/badge/Ver%20calculadora-En%20la%20nube-f45b72?style=for-the-badge)](https://fernandand1527.github.io/Matepro_calculadora/)

Calculadora web con operaciones básicas. Incluye una versión estática para GitHub Pages y una aplicación Django para ejecutar localmente.

## Requisitos

- Python 3.10 o posterior
- Django 5.2

## Ejecutar con Django

Desde la carpeta raíz del repositorio, crea y activa un entorno virtual e instala las dependencias:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py manage.py migrate
```

Inicia el servidor de desarrollo:

```powershell
py manage.py runserver
```

Abre `http://127.0.0.1:8000/`. La aplicación Django permite sumar, restar, multiplicar, dividir, calcular módulo y potencia. No uses el servidor de desarrollo para publicar en producción.

## Ejecutar el programa

La función matemática también puede ejecutarse desde la carpeta raíz:

```powershell
python src/suma.py
```

## Versión estática en la nube

El botón **Ver calculadora en la nube** abre la versión estática publicada en GitHub Pages. El flujo de GitHub Actions publica automáticamente el contenido de `web/` cuando los cambios llegan a la rama `main`; espera a que la acción **Desplegar página web** termine correctamente. GitHub Pages no ejecuta Django ni código Python del servidor. Para probar sin conexión, abre `web/index.html` en el navegador o sírvelo localmente.

## Ejecutar las pruebas

```powershell
py -m unittest discover -s tests -v
```

Las pruebas de la aplicación Django se ejecutan con:

```powershell
py manage.py test
```

La base SQLite se inicializa con `py manage.py migrate`. El archivo local `db.sqlite3` y los archivos generados de `staticfiles/` no se suben al repositorio.