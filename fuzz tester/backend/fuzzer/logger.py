"""
fuzzer/logger.py
SQLite-backed crash chain logger via SQLAlchemy.
Schema auto-created on first run; zero config needed.
"""

from __future__ import annotations
import uuid
import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import create_engine, Column, String, Integer, Text, DateTime
from sqlalchemy.orm import DeclarativeBase, Session

DB_PATH = "crashes.db"
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})


class Base(DeclarativeBase):
    pass


class CrashRecord(Base):
    __tablename__ = "crashes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    endpoint = Column(String, nullable=False)
    method = Column(String, nullable=False, default="POST")
    input_payload = Column(Text, nullable=False)
    crash_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    http_status = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    failure_chain = Column(Text, nullable=True)
    reproduction_steps = Column(Text, nullable=True)


# Auto-create tables
Base.metadata.create_all(engine)


# ─── Failure chain builder ────────────────────────────────────────────────────

_CHAIN_TEMPLATES: dict[str, str] = {
    "SERVER_ERROR": (
        "1. Input received by API\n"
        "2. Input passed initial parsing\n"
        "3. Validation layer skipped or incomplete\n"
        "4. Business logic executed with malformed data\n"
        "5. Unhandled exception thrown internally\n"
        "6. Server returned HTTP 500 — crash confirmed"
    ),
    "STACK_TRACE_LEAKED": (
        "1. Input received by API\n"
        "2. Input triggered an unexpected code path\n"
        "3. Exception caught internally but stack trace included in response\n"
        "4. Internal file paths and logic exposed to caller\n"
        "5. HIGH severity: attacker can map internal structure"
    ),
    "TIMEOUT": (
        "1. Input received by API\n"
        "2. Input caused excessive processing (loop, large allocation, etc.)\n"
        "3. Server did not respond within 3 seconds\n"
        "4. Request timed out — possible Denial-of-Service vector"
    ),
    "MEMORY_SPIKE": (
        "1. Input received by API\n"
        "2. Oversized or nested payload caused large in-memory allocation\n"
        "3. Server memory usage spiked > 50 MB for a single request\n"
        "4. Risk: repeated attacks cause memory exhaustion / OOM crash"
    ),
    "EMPTY_RESPONSE": (
        "1. Input received by API\n"
        "2. Server processed request but returned empty body\n"
        "3. No error code, no data — silent failure\n"
        "4. Indicates missing error handling or swallowed exception"
    ),
    "INCONSISTENT_BEHAVIOR": (
        "1. Same payload sent twice consecutively\n"
        "2. First response differed from second response\n"
        "3. Non-deterministic behavior detected\n"
        "4. Possible race condition or stateful bug"
    ),
    "BAD_REQUEST_WITH_TRACE": (
        "1. Input received by API\n"
        "2. Validation rejected input (400 Bad Request)\n"
        "3. Error response body contained internal stack trace\n"
        "4. HIGH severity: internal details exposed even on rejection"
    ),
}


def _build_chain(crash_type: str, endpoint: str, payload_summary: str) -> str:
    base = _CHAIN_TEMPLATES.get(crash_type, "1. Input received\n2. Unexpected behavior\n3. Crash logged")
    return f"Endpoint: {endpoint} | Payload summary: {payload_summary}\n\n{base}"


def _build_reproduction(method: str, endpoint: str, payload: dict) -> str:
    clean = {k: v for k, v in payload.items() if k != "_meta"}
    return (
        f"Send {method} {endpoint} with the following JSON body:\n"
        f"{json.dumps(clean, indent=2, default=str)}"
    )


# ─── Public API ──────────────────────────────────────────────────────────────

def log_crash(
    endpoint: str,
    method: str,
    payload: dict,
    crash_type: str,
    severity: str,
    http_status: Optional[int],
    response_body: Optional[str],
) -> CrashRecord:
    """Persist a crash record and return the ORM object."""
    clean_payload = {k: v for k, v in payload.items() if k != "_meta"}
    payload_str = json.dumps(clean_payload, default=str)
    payload_summary = payload_str[:120] + ("…" if len(payload_str) > 120 else "")

    record = CrashRecord(
        id=str(uuid.uuid4()),
        timestamp=datetime.now(timezone.utc),
        endpoint=endpoint,
        method=method,
        input_payload=payload_str,
        crash_type=crash_type,
        severity=severity,
        http_status=http_status,
        response_body=(response_body or "")[:4000],
        failure_chain=_build_chain(crash_type, endpoint, payload_summary),
        reproduction_steps=_build_reproduction(method, endpoint, payload),
    )

    with Session(engine) as session:
        session.add(record)
        session.commit()
        session.refresh(record)
        # Detach from session so callers can read fields freely
        session.expunge(record)

    return record


def get_all_crashes(limit: int = 200) -> list[dict]:
    """Return all crashes as dicts, newest first."""
    with Session(engine) as session:
        rows = (
            session.query(CrashRecord)
            .order_by(CrashRecord.timestamp.desc())
            .limit(limit)
            .all()
        )
        return [_to_dict(r) for r in rows]


def get_crash_by_id(crash_id: str) -> Optional[dict]:
    """Return a single crash dict or None."""
    with Session(engine) as session:
        row = session.query(CrashRecord).filter(CrashRecord.id == crash_id).first()
        return _to_dict(row) if row else None


def get_report() -> dict:
    """Return aggregate counts grouped by severity and endpoint."""
    crashes = get_all_crashes(limit=10_000)
    by_severity: dict[str, int] = {}
    by_endpoint: dict[str, int] = {}
    for c in crashes:
        by_severity[c["severity"]] = by_severity.get(c["severity"], 0) + 1
        by_endpoint[c["endpoint"]] = by_endpoint.get(c["endpoint"], 0) + 1
    return {
        "total": len(crashes),
        "by_severity": by_severity,
        "by_endpoint": by_endpoint,
    }


def clear_crashes() -> None:
    """Delete all crash records (useful for fresh demo sessions)."""
    with Session(engine) as session:
        session.query(CrashRecord).delete()
        session.commit()


def _to_dict(r: CrashRecord) -> dict:
    return {
        "id": r.id,
        "timestamp": r.timestamp.isoformat() if r.timestamp else None,
        "endpoint": r.endpoint,
        "method": r.method,
        "input_payload": r.input_payload,
        "crash_type": r.crash_type,
        "severity": r.severity,
        "http_status": r.http_status,
        "response_body": r.response_body,
        "failure_chain": r.failure_chain,
        "reproduction_steps": r.reproduction_steps,
    }
