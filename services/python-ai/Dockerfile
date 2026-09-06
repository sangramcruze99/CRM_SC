# ==============================================================================
# Production Dockerfile for Business OS Python AI & ML Infrastructure Layer
# ==============================================================================

FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies for C-extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ------------------------------------------------------------------------------
# Production Runner
# ------------------------------------------------------------------------------
FROM python:3.11-slim AS runner

WORKDIR /app

# Install curl for container healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system user
RUN groupadd -r appgroup && useradd -r -g appgroup -u 10001 appuser

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set environment defaults
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHON_AI_HOST=0.0.0.0 \
    PYTHON_AI_PORT=3030 \
    PYTHONPATH=/app

# Copy application source code and seed datasets
COPY app/ ./app/
COPY datasets/ ./datasets/

# Ensure non-root user owns application directory
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3030

# Health check verifies /health endpoint responds with 200 within 5s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3030/health || exit 1

# Graceful termination signal
STOPSIGNAL SIGTERM

# Run FastAPI production server via uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3030", "--workers", "2", "--timeout-graceful-shutdown", "15"]
