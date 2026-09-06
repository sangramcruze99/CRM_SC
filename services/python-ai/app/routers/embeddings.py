"""
Embeddings Router: POST /v1/embeddings.
Generates 384-dimensional dense vector embeddings for RAG and semantic search.
"""

from typing import Union, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from ..models.providers.embedding_provider import EmbeddingProvider
from ..security import verify_service_auth, TenantContext

router = APIRouter(prefix="/v1", tags=["Embeddings"])
embedding_provider = EmbeddingProvider()


class EmbeddingRequest(BaseModel):
    input: Union[str, List[str]]
    model: Optional[str] = "all-MiniLM-L6-v2"


class EmbeddingResponse(BaseModel):
    model: str
    embeddings: List[List[float]]
    dimensions: int = 384


@router.post("/embeddings", response_model=EmbeddingResponse)
async def create_embeddings(
    request: EmbeddingRequest,
    context: TenantContext = Depends(verify_service_auth),
):
    """
    Generate normalized 384-dimensional vector embeddings for text chunks or query strings.
    """
    vectors = embedding_provider.embed_batch(request.input)
    return EmbeddingResponse(
        model=request.model or "all-MiniLM-L6-v2",
        embeddings=vectors,
        dimensions=embedding_provider.dimension,
    )
