"""
Configuration and Environment Settings for the Python AI Service.
Handles compute hardware detection (CPU/CUDA) and LLM provider credentials.
"""

import os
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv

# Load root and local .env files
load_dotenv(dotenv_path=os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env")))
load_dotenv()


class ComputeCapabilities(BaseModel):
    device: str
    cuda_available: bool
    gpu_name: Optional[str] = None
    gpu_count: int = 0
    total_vram_gb: float = 0.0


def detect_compute() -> ComputeCapabilities:
    """Detect available compute resources (CPU vs CUDA GPU)."""
    try:
        import torch
        if torch.cuda.is_available():
            device_name = torch.cuda.get_device_name(0)
            gpu_count = torch.cuda.device_count()
            vram_gb = round(torch.cuda.get_device_properties(0).total_memory / (1024 ** 3), 2)
            return ComputeCapabilities(
                device="cuda",
                cuda_available=True,
                gpu_name=device_name,
                gpu_count=gpu_count,
                total_vram_gb=vram_gb,
            )
    except Exception:
        pass

    return ComputeCapabilities(
        device="cpu",
        cuda_available=False,
        gpu_name=None,
        gpu_count=0,
        total_vram_gb=0.0,
    )


class Settings(BaseModel):
    # Service Information
    app_name: str = "Business OS Python AI Layer"
    version: str = "1.0.0"
    host: str = os.getenv("PYTHON_AI_HOST", "0.0.0.0")
    port: int = int(os.getenv("PYTHON_AI_PORT", "3030"))
    environment: str = os.getenv("NODE_ENV", "development")

    # Security & Authentication
    service_api_key: str = os.getenv("PYTHON_AI_API_KEY", "business-os-internal-ai-key-secret")
    require_auth: bool = os.getenv("PYTHON_AI_REQUIRE_AUTH", "true").lower() in ("true", "1")

    # Cloud Provider Keys
    groq_api_key: Optional[str] = os.getenv("GROQ_API_KEY")
    openrouter_api_key: Optional[str] = os.getenv("OPENROUTER_API_KEY")
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY")

    # Defaults
    default_model: str = os.getenv("DEFAULT_MODEL", "groq/compound")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    embedding_dimension: int = 384

    # Timeouts & Limits
    fast_inference_timeout_sec: float = float(os.getenv("FAST_INFERENCE_TIMEOUT_SEC", "10.0"))
    normal_inference_timeout_sec: float = float(os.getenv("NORMAL_INFERENCE_TIMEOUT_SEC", "30.0"))
    long_inference_timeout_sec: float = float(os.getenv("LONG_INFERENCE_TIMEOUT_SEC", "120.0"))
    max_input_tokens: int = int(os.getenv("AI_MAX_INPUT_TOKENS", "16384"))
    max_output_tokens: int = int(os.getenv("AI_MAX_OUTPUT_TOKENS", "4096"))

    # Feature Toggles
    enable_local_models: bool = os.getenv("ENABLE_LOCAL_MODELS", "false").lower() in ("true", "1")
    enable_training: bool = os.getenv("ENABLE_TRAINING", "true").lower() in ("true", "1")
    enable_evaluation: bool = os.getenv("ENABLE_EVALUATION", "true").lower() in ("true", "1")


settings = Settings()
compute = detect_compute()
