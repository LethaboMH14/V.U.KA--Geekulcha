"""
Database models for VUKA ANCHOR Server
"""
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from . import Base

class Event(Base):
    """Event log entry - append-only chain"""
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(String(64), unique=True, nullable=False, index=True)
    subject_id = Column(String(64), nullable=False, index=True)
    actor_id = Column(String(64), nullable=False)
    target_id = Column(String(64), nullable=False)
    action = Column(String(32), nullable=False)
    source_time = Column(DateTime(timezone=True), nullable=False)
    key_id = Column(String(64), nullable=False)
    counter = Column(Integer, nullable=False)
    nonce = Column(String(64), nullable=False)
    commitment = Column(String(128), nullable=False)
    signature = Column(String(88), nullable=False)
    payload = Column(JSON, nullable=True)
    prev_hash = Column(String(64), nullable=True)
    this_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('ix_events_subject_counter', 'subject_id', 'counter'),
        Index('ix_events_actor_counter', 'actor_id', 'counter'),
    )

class Subject(Base):
    """Subject (member) record"""
    __tablename__ = "subjects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(String(64), unique=True, nullable=False, index=True)
    public_key = Column(String(88), nullable=False)
    duress_public_key = Column(String(88), nullable=True)
    recovery_code_hash = Column(String(128), nullable=True)
    pin_hash = Column(String(128), nullable=True)
    status = Column(String(16), default="active")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    cooling_off_ends_at = Column(DateTime(timezone=True), nullable=True)

class Operator(Base):
    """Authorized operator"""
    __tablename__ = "operators"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operator_id = Column(String(64), unique=True, nullable=False, index=True)
    public_key = Column(String(88), nullable=False)
    name = Column(String(128), nullable=False)
    role = Column(String(32), nullable=False)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    revoked_at = Column(DateTime(timezone=True), nullable=True)

class Anchor(Base):
    """Merkle root anchor to Hedera"""
    __tablename__ = "anchors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    root = Column(String(64), nullable=False)
    record_count = Column(Integer, nullable=False)
    state = Column(String(16), nullable=False)
    transaction_reference = Column(String(128), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class IdempotencyKey(Base):
    """Idempotency key store"""
    __tablename__ = "idempotency_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(64), unique=True, nullable=False, index=True)
    request_hash = Column(String(64), nullable=False)
    response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=False)

class OutboxEntry(Base):
    """Outbox for reliable event delivery"""
    __tablename__ = "outbox"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(64), nullable=False)
    payload = Column(JSON, nullable=False)
    destination = Column(String(16), nullable=False)
    status = Column(String(16), default="pending")
    attempts = Column(Integer, default=0)
    last_attempt_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    sent_at = Column(DateTime(timezone=True), nullable=True)
