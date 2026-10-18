"""Chain entries and notifications for the guardian lifecycle (server/guardians.py).

Caller holds the subject_heads row lock. Notifications are recorded intent only
(server/recovery.notify_guardians); no real delivery exists yet.
"""
from server.event_effects import append_server
from server.guardians import alerting_guardians, complete_removal, due_removals
from server.recovery import notify_guardians


def record_accept(cur, store, subject_id, guardian_id, *, decoy, actor_id, now):
    kind = "decoy_added" if decoy else "guardian_added"
    append_server(cur, store, subject_id, {"kind": kind, "pv": 1, "guardian_id": guardian_id}, now)
    if alerting_guardians(cur, subject_id, exclude=guardian_id):
        if decoy:
            notify_guardians(cur, subject_id, "guardian_added_under_duress", now)
        else:
            notify_guardians(cur, subject_id, "guardian_added", now, detail=actor_id)


def record_removal_scheduled(cur, store, subject_id, guardian_id, now):
    append_server(cur, store, subject_id, {"kind": "guardian_removal_scheduled", "pv": 1, "guardian_id": guardian_id}, now)
    # Remaining guardians are told, naming the removed one; the removed guardian is not.
    notify_guardians(cur, subject_id, "guardian_removal_scheduled", now, detail=guardian_id)


def fire_guardian_removals(cur, store, subject_id, now):
    fired = []
    for guardian_id in due_removals(cur, subject_id, now):
        complete_removal(cur, guardian_id, now)
        append_server(cur, store, subject_id, {"kind": "guardian_removed", "pv": 1, "guardian_id": guardian_id}, now)
        notify_guardians(cur, subject_id, "guardian_removed", now, detail=guardian_id)
        fired.append(guardian_id)
    return fired
