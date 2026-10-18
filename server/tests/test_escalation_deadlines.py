"""PROPOSED G34 primitives against real PostgreSQL, not endpoint acceptance."""
import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

import psycopg2
import pytest
from psycopg2 import sql

from server.escalation import (
    SCHEMA_SQL, claim_timeout, fallback_due_at, record_opened, schedule_signal,
)


from server.tests.sim_postgres import sim_database as sim_empty_database, SIM_RECEIVED


@pytest.fixture
def sim_database(sim_empty_database):
    with sim_empty_database() as conn, conn.cursor() as cur:
        cur.execute(SCHEMA_SQL)
    return sim_empty_database


def schedule(cur, signal="sim_signal_1", offset=0):
    schedule_signal(cur, signal_event_id=signal, subject_id="sim_subject",
                    journey_id="sim_journey", received_at=SIM_RECEIVED + timedelta(seconds=offset))


def test_proposed_fallback_due_at_is_90_seconds_and_rejects_naive_clock():
    assert fallback_due_at(SIM_RECEIVED) == SIM_RECEIVED + timedelta(seconds=90)
    with pytest.raises(ValueError):
        fallback_due_at(SIM_RECEIVED.replace(tzinfo=None))


def test_proposed_t51_89_then_91_exactly_one_terminal_after_restart(sim_database):
    with sim_database() as conn, conn.cursor() as cur:
        schedule(cur)
        assert not claim_timeout(cur, signal_event_id="sim_signal_1", now=SIM_RECEIVED + timedelta(seconds=89))
    with sim_database() as conn, conn.cursor() as cur:
        assert claim_timeout(cur, signal_event_id="sim_signal_1", now=SIM_RECEIVED + timedelta(seconds=91))
        assert not claim_timeout(cur, signal_event_id="sim_signal_1", now=SIM_RECEIVED + timedelta(seconds=92))
        cur.execute("SELECT outcome FROM signal_deadlines")
        assert cur.fetchall() == [("no_answer",)]


def test_proposed_opened_at_89_cancels_only_matching_signal_fallback(sim_database):
    with sim_database() as conn, conn.cursor() as cur:
        schedule(cur)
        schedule(cur, "sim_signal_2", 1)
        record_opened(cur, signal_event_id="sim_signal_1", subject_id="sim_subject",
                      journey_id="sim_journey", checkin_id="sim_checkin_1", window_s=20,
                      received_at=SIM_RECEIVED + timedelta(seconds=89))
        assert not claim_timeout(cur, signal_event_id="sim_signal_1", now=SIM_RECEIVED + timedelta(seconds=91))
        assert claim_timeout(cur, signal_event_id="sim_signal_2", now=SIM_RECEIVED + timedelta(seconds=91))
        assert not claim_timeout(cur, signal_event_id="sim_signal_1", now=SIM_RECEIVED + timedelta(seconds=118))
        assert claim_timeout(cur, signal_event_id="sim_signal_1", now=SIM_RECEIVED + timedelta(seconds=119))


def test_proposed_concurrent_timeout_workers_produce_one_terminal(sim_database):
    with sim_database() as conn, conn.cursor() as cur:
        schedule(cur)
    def fire(_):
        with sim_database() as conn, conn.cursor() as cur:
            return claim_timeout(cur, signal_event_id="sim_signal_1", now=SIM_RECEIVED + timedelta(seconds=91))
    with ThreadPoolExecutor(max_workers=2) as pool:
        assert sorted(pool.map(fire, range(2))) == [False, True]


def test_proposed_cross_subject_opened_cannot_cancel_and_transaction_rollback(sim_database):
    with sim_database() as conn, conn.cursor() as cur:
        schedule(cur)
    with pytest.raises(ValueError, match="binding"):
        with sim_database() as conn, conn.cursor() as cur:
            record_opened(cur, signal_event_id="sim_signal_1", subject_id="sim_other",
                          journey_id="sim_journey", checkin_id="sim_checkin_1", window_s=60,
                          received_at=SIM_RECEIVED + timedelta(seconds=89))
    with pytest.raises(RuntimeError):
        with sim_database() as conn, conn.cursor() as cur:
            assert claim_timeout(cur, signal_event_id="sim_signal_1", now=SIM_RECEIVED + timedelta(seconds=91))
            raise RuntimeError("sim_crash_before_outbox_commit")
    with sim_database() as conn, conn.cursor() as cur:
        assert claim_timeout(cur, signal_event_id="sim_signal_1", now=SIM_RECEIVED + timedelta(seconds=91))
