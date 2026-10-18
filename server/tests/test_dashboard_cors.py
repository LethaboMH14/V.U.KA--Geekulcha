"""PROPOSED CORS for the public dashboard surface; real PostgreSQL, real HTTP."""
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_slice3_events import sim_api  # noqa: F401  (fixture)


def test_configured_origin_gets_cors_headers_on_the_public_endpoint(sim_api, monkeypatch):
    monkeypatch.setenv("VUKA_DASHBOARD_ORIGINS", "https://dashboard.example")
    from server.main import create_app
    from fastapi.testclient import TestClient
    store, *_ = sim_api
    with TestClient(create_app(store)) as client:
        response = client.get("/healthz", headers={"Origin": "https://dashboard.example"})
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == "https://dashboard.example"

        preflight = client.options("/v1/anchor/latest", headers={
            "Origin": "https://dashboard.example",
            "Access-Control-Request-Method": "GET",
        })
        assert preflight.status_code == 200
        assert preflight.headers.get("access-control-allow-origin") == "https://dashboard.example"


def test_unconfigured_origin_gets_no_cors_grant(sim_api, monkeypatch):
    monkeypatch.setenv("VUKA_DASHBOARD_ORIGINS", "https://dashboard.example")
    from server.main import create_app
    from fastapi.testclient import TestClient
    store, *_ = sim_api
    with TestClient(create_app(store)) as client:
        response = client.get("/healthz", headers={"Origin": "https://attacker.example"})
        assert response.status_code == 200  # the request itself still succeeds
        assert "access-control-allow-origin" not in {k.lower() for k in response.headers}


def test_cors_never_grants_credentials(sim_api, monkeypatch):
    monkeypatch.setenv("VUKA_DASHBOARD_ORIGINS", "https://dashboard.example")
    from server.main import create_app
    from fastapi.testclient import TestClient
    store, *_ = sim_api
    with TestClient(create_app(store)) as client:
        response = client.get("/healthz", headers={"Origin": "https://dashboard.example"})
        assert "access-control-allow-credentials" not in {k.lower() for k in response.headers}


def test_cors_does_not_widen_signed_routes_to_other_http_methods(sim_api, monkeypatch):
    """CORS reach is GET-only; a browser still cannot forge the §7 signature
    needed for any state-changing route regardless of Origin."""
    monkeypatch.setenv("VUKA_DASHBOARD_ORIGINS", "https://dashboard.example")
    from server.main import create_app
    from fastapi.testclient import TestClient
    store, *_ = sim_api
    with TestClient(create_app(store)) as client:
        preflight = client.options("/v1/journeys", headers={
            "Origin": "https://dashboard.example",
            "Access-Control-Request-Method": "POST",
        })
        assert preflight.headers.get("access-control-allow-methods") != "POST"


def test_no_configured_origins_disables_the_middleware_entirely(sim_api, monkeypatch):
    monkeypatch.setenv("VUKA_DASHBOARD_ORIGINS", "")
    from server.main import create_app
    from fastapi.testclient import TestClient
    store, *_ = sim_api
    with TestClient(create_app(store)) as client:
        response = client.get("/healthz", headers={"Origin": "https://dashboard.example"})
        assert "access-control-allow-origin" not in {k.lower() for k in response.headers}
