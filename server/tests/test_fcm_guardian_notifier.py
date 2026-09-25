"""FcmGuardianNotifier reads recipients/tokens from server/guardians.py's `guardians`
table (reconciled with #96 per Khutso's #96 review), not a parallel token table.
Exercises the real accept-invite-through-delivery path with real PostgreSQL.
"""
from datetime import timedelta

from server.guardian_notifier import DeliveryResult, FcmGuardianNotifier
from server.outbox import claim_due
from server.src.notify.fcm import FcmConfig, FcmSender
from server.tests.sim_postgres import sim_database  # noqa: F401  (fixture)
from server.tests.test_guardian_delivery import setup_alert
from server.tests.test_guardian_lifecycle import add_real_guardian, invite, accept
from server.tests.test_slice3_events import sim_api  # noqa: F401  (fixture)


def fake_sender(calls):
    def transport(path, body, headers, timeout):
        calls.append((path, body, headers))
        return {"name": "projects/sim/messages/1"}
    return FcmSender(FcmConfig("sim_project", "sim_token"), transport=transport)


def test_recipients_reads_accepted_guardians_and_excludes_a_decoy(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    real_id, *_ = add_real_guardian(sim_api)
    decoy = invite(sim_api, mode="duress")
    accept(client, decoy["invite_code"])
    calls = []
    notifier = FcmGuardianNotifier(connect, lambda: now[0], fake_sender(calls))
    recipients = notifier.recipients(subject)
    assert real_id in recipients
    assert decoy["guardian_id"] not in recipients


def test_deliver_sends_to_the_guardians_own_fcm_token_end_to_end(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    guardian_id, *_ = add_real_guardian(sim_api)  # accept() enrols with fcm_token "sim_fcm"
    incident, row, _sim_notifier = setup_alert(sim_api, guardian=False)
    outbox_row = {**row, "subject_id": subject, "guardian_ref": guardian_id}
    calls = []
    notifier = FcmGuardianNotifier(connect, lambda: now[0], fake_sender(calls))
    result = notifier.deliver(outbox_row)
    assert isinstance(result, DeliveryResult) and result.delivered
    assert len(calls) == 1
    sent_body = calls[0][1]
    assert b"sim_fcm" in sent_body  # the guardian's own token, from `guardians`, was used
    replay = notifier.deliver(outbox_row)
    assert replay.evidence_ref == result.evidence_ref and len(calls) == 1  # no second send


def test_deliver_returns_not_delivered_for_an_unenrolled_or_decoy_guardian(sim_api):
    store, client, subject, key, event, post, now, connect = sim_api
    decoy = invite(sim_api, mode="duress")
    accept(client, decoy["invite_code"])
    incident, row, _sim_notifier = setup_alert(sim_api, guardian=False)
    calls = []
    notifier = FcmGuardianNotifier(connect, lambda: now[0], fake_sender(calls))
    assert not notifier.deliver({**row, "subject_id": subject, "guardian_ref": decoy["guardian_id"]}).delivered
    assert not notifier.deliver({**row, "subject_id": subject, "guardian_ref": "sim_never_enrolled"}).delivered
    assert calls == []
