FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Em produção (Render): PORT é injetado pelo Render (padrão 10000).
# Em dev (docker-compose): o CMD abaixo é sobrescrito pelo campo `command`.
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn sima.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2"]
