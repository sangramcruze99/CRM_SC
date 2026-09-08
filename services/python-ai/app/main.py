"""
Main FastAPI Application Entrypoint for Business OS Python AI Layer.
Port: 3030 (default)
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings, compute
from .routers import health, inference, embeddings, training, evaluation, agents, ocr, agent_decision
from .datasets.generator import dataset_generator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("business-os.python-ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.version} on port {settings.port}")
    logger.info(f"Compute Hardware: {compute.device.upper()} (CUDA: {compute.cuda_available})")

    # Initialize benchmark datasets for all 10 agents
    try:
        dataset_generator.initialize_default_benchmark_datasets()
        logger.info("Initialized default benchmark datasets for all 10 agents.")
    except Exception as exc:
        logger.warning(f"Could not pre-seed benchmark datasets: {exc}")

    yield

    # Shutdown
    logger.info("Shutting down Python AI service cleanly.")


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Dedicated AI/ML inference, embedding, dataset generation, and evaluation engine for Business OS CRM.",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal AI Service Error", "detail": str(exc)},
    )


# Mount Routers
app.include_router(health.router)
app.include_router(ocr.router)
app.include_router(inference.router)
app.include_router(embeddings.router)
app.include_router(training.router)
app.include_router(evaluation.router)
app.include_router(agents.router)
app.include_router(agent_decision.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
