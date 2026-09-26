# ANCHOR server (API + outbox workers) as one container, for hosting anywhere:
# a VM with docker compose, Render, Koyeb, Cloud Run… See docs/deploy/BACKUP-HOSTING.md.
# Simulation subjects only (VUKA_SIM_ONLY=1 is forced in scripts/docker-start.sh).
ARG PYTHON_IMAGE=python:3.13-slim
FROM ${PYTHON_IMAGE}

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

COPY requirements.txt .
COPY server/requirements.txt server/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Only what the server reads at runtime. No .env, keys or app code go in the image.
COPY server/ server/
COPY anchor/*.py anchor/
COPY contracts/ contracts/
COPY scripts/docker-start.sh scripts/docker-start.sh

RUN useradd --create-home --uid 10001 vuka && chown -R vuka /app
USER vuka

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:'+__import__('os').environ.get('PORT','8000')+'/healthz',timeout=4).status==200 else 1)"
CMD ["sh", "scripts/docker-start.sh"]
