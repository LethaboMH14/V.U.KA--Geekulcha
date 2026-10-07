"""Private payload encryption tests with synthetic data only."""

import base64

import pytest
from cryptography.exceptions import InvalidTag

from server.payload_store import decode_payload_key, decrypt_payload, encrypt_payload


SIM_KEY = bytes(range(32))


def test_encrypted_payload_round_trip_and_context_substitution_rejected():
    sim_payload = {"kind": "sim_test_event", "pv": 1, "value": "sim_private"}
    sim_salt = base64.b64encode(bytes(range(16))).decode("ascii")
    nonce, ciphertext = encrypt_payload(
        SIM_KEY, subject_id="sim_subject_a", event_id="sim_event_a",
        payload=sim_payload, salt=sim_salt,
    )
    assert len(nonce) == 12
    assert b"sim_private" not in ciphertext
    assert decrypt_payload(
        SIM_KEY, subject_id="sim_subject_a", event_id="sim_event_a",
        nonce=nonce, ciphertext=ciphertext,
    ) == {"payload": sim_payload, "salt": sim_salt}
    with pytest.raises(InvalidTag):
        decrypt_payload(
            SIM_KEY, subject_id="sim_subject_b", event_id="sim_event_a",
            nonce=nonce, ciphertext=ciphertext,
        )
    with pytest.raises(InvalidTag):
        decrypt_payload(
            SIM_KEY, subject_id="sim_subject_a", event_id="sim_event_b",
            nonce=nonce, ciphertext=ciphertext,
        )


def test_payload_key_configuration_fails_closed():
    with pytest.raises(ValueError):
        decode_payload_key(None)
    with pytest.raises(ValueError):
        decode_payload_key("not-base64")
    with pytest.raises(ValueError):
        decode_payload_key(base64.b64encode(bytes(16)).decode("ascii"))
