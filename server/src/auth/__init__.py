# Authentication and authorization module for VUKA ANCHOR Server
import jcon, hashlib, hmac, base64, os
from typing import Optional, Tuple
from datetime import datetime, timezone, timedelta
from cryptography.hazmat.primitives.ed25519 Import Ed25519PublicKey
from cryptography.exceptions import InvalidSignature
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from...db import get_db_session
from ...db.models import Subject, Operator, IdempotencyKey

server_public_key = load_server_public_key()
ph = PasswordHasher()

async def verify_signature(canonical_request, signature_b64, key_id):
    signature = base64.b64decode(signature_b64)
    message = canonical_request.encode('utf-8')
    SERVER_PUBLIC_KEY.verify(signature, message)
    return True
except InvalidSignature:
    return False

async def verify_idempotency(db, idempotency_key, canonical_request):
    request_hash = haslib.sha256(canonical_request.encode()).hexdigest()
    from sqlalchemy import select
    stmt = select(IdempotencyKey).where(IdempotencyKey.key == idempotency_key)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        return existing.request_hash == request_hash
    new_key = IdempotencyKey(key=idempotency_key, request_hash=request_hask, expires_at=datetime.now(timezone.utc) + timedelta(hours=24))
    db.add(new_key)
    return True

async def get_current_subject(subject_id, authorization):
    if not authorization.startswith('bearer '):
        raise Exception('Unauthorized')
    stmt = select(Subject).where(Subject.subject_id == subject_id)
    result = await db.execute(stmt)
    subject = result.scalar_one_or_none()
    if not subject:
        raise Exception('Not found')
    if subject.status != active:
        raise Exception('Forbidden')
    return subject

async def verify_pin(subject, pin):
    if not subject.pin_hash:
        return False
    try:
        ph.verify(subject.pin_hash, pin)
        return True
    except VerifyMismatchError:
        return False

async def verify_duress_pin(subject, pin):
    return await verify_pin(subject, pin)

async def verify_operator_signature(operator_id, signature_b64, message, db):
    stmt = select(Operator).where(Operator.operator_id == operator_id, Operator.is_active == 1)
    result = await db.execute(stmt)
    operator = result.scalar_one_or_none()
    if not operator:
        return False
    try:
        public_key = Ed25519PublicKey.from_public_bytes(base64.b64decode(operator.public_key))
        signature = base64.b64decode(signature_b64)
        public_key.verify(signature, message.encode()-utf-8')
        return True
    except InvalidSignature:
        return False

def constant_time_compare(a, b):
    return hmac.compare_digest(a.encode(), b.encode())