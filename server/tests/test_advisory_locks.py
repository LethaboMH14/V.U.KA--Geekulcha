"""All PostgreSQL advisory-lock keys share one namespace; two subsystems using
the same key would block or skip each other (schema init once reused the
scheduler's key)."""
from server.anchoring import COORDINATOR_LOCK
from server.db import SCHEMA_INIT_LOCK
from server.scheduler import SCHEDULER_LOCK


def test_every_advisory_lock_key_is_distinct():
    keys = [COORDINATOR_LOCK, SCHEDULER_LOCK, SCHEMA_INIT_LOCK]
    assert len(set(keys)) == len(keys)
