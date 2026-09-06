"""
Unit tests for Local 384-dimensional Embedding Service.
"""

import math
from fastapi.testclient import TestClient
from app.main import app
from app.models.providers.embedding_provider import EmbeddingProvider

client = TestClient(app)


def test_embedding_dimensions_and_normalization():
    provider = EmbeddingProvider()
    texts = [
        "Ares deal acceleration agent detected a stalled proposal.",
        "Athena customer success monitor flagged negative sentiment in ticket #402."
    ]
    
    embeddings = provider.embed_batch(texts)
    assert len(embeddings) == 2
    assert len(embeddings[0]) == 384
    assert len(embeddings[1]) == 384
    
    # Check L2 norm is ~ 1.0 (unit vector)
    for emb in embeddings:
        norm = math.sqrt(sum(x * x for x in emb))
        assert abs(norm - 1.0) < 1e-4, f"Vector is not unit-normalized: norm={norm}"


def test_embedding_similarity_logic():
    provider = EmbeddingProvider()
    
    s1 = "High-risk contract deletion requires human approval."
    s2 = "Critical contract termination needs human signoff."
    s3 = "The weather today in San Francisco is clear and sunny."
    
    emb = provider.embed_batch([s1, s2, s3])
    
    # Cosine similarity for unit vectors is simply the dot product
    def dot_product(v1, v2):
        return sum(a * b for a, b in zip(v1, v2))
    
    sim_similar = dot_product(emb[0], emb[1])
    sim_dissimilar = dot_product(emb[0], emb[2])
    
    assert sim_similar > sim_dissimilar, f"Expected {sim_similar} > {sim_dissimilar}"


def test_embeddings_api_endpoint():
    resp = client.post(
        "/v1/embeddings",
        json={
            "input": [
                "Search CRM contacts for lead qualification.",
                "Calculate commission splits for real estate escrow."
            ]
        },
        headers={
            "X-Tenant-ID": "tenant-test-123",
            "X-Service-Key": "business-os-internal-ai-key-secret",
        }
    )
    
    assert resp.status_code == 200
    data = resp.json()
    assert data["model"] == "all-MiniLM-L6-v2"
    assert data["dimensions"] == 384
    assert len(data["embeddings"]) == 2
    assert len(data["embeddings"][0]) == 384
