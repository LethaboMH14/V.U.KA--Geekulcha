"""Isolated SIMULATED schemas in a required real PostgreSQL test database."""
import os
import uuid
from datetime import datetime, timezone
import psycopg2
from psycopg2 import sql
import pytest

@pytest.fixture
def sim_database():
    url = os.environ.get("VUKA_TEST_DATABASE_URL")
    if not url:
        pytest.fail("real PostgreSQL required: set VUKA_TEST_DATABASE_URL")
    schema = "sim_deadline_" + uuid.uuid4().hex
    with psycopg2.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("CREATE SCHEMA {}").format(sql.Identifier(schema)))
    def connect():
        conn = psycopg2.connect(url)
        with conn.cursor() as cur:
            cur.execute(sql.SQL("SET search_path TO {}").format(sql.Identifier(schema)))
        conn.commit()
        return conn
    yield connect
    with psycopg2.connect(url) as conn, conn.cursor() as cur:
        cur.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(schema)))


SIM_RECEIVED = datetime(2026, 9, 25, tzinfo=timezone.utc)

