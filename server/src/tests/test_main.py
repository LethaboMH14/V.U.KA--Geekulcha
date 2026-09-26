import pytest
from fastapi.testclient import TestClient
from server.src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_sightings_requires_auth():
    response = client.post("/v1/sightings", json={})
    assert response.status_code == 401

def test_export_requires_auth():
    response = client.get("/v1/subjects/test-subject/export")
    assert response.status_code == 401