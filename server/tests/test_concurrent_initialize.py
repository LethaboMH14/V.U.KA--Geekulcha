"""Two processes can boot at once against a brand-new database: uvicorn's own
startup and server/run_workers.py's main(), both calling
PostgresDatabase.initialize() independently. Real PostgreSQL, a fresh schema
with no tables yet — the exact first-boot condition that deadlocked two such
transactions against each other in practice (Azure, 26 Sep)."""
import base64
import threading

from server.db import PostgresDatabase
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)


def test_concurrent_initialize_on_a_fresh_schema_does_not_deadlock(sim_database):
    key = base64.b64encode(bytes(range(32))).decode()
    errors = []
    lock = threading.Lock()

    def boot():
        try:
            store = PostgresDatabase("sim_url", connect=lambda *_: sim_database(), payload_key_b64=key)
            store.initialize()
        except Exception as exc:  # pragma: no cover - failure path under test
            with lock:
                errors.append(exc)

    threads = [threading.Thread(target=boot) for _ in range(6)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=30)

    assert errors == [], [repr(e) for e in errors]
