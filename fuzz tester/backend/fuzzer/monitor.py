"""
fuzzer/monitor.py
HTTP crash monitor — 5 detection mechanisms:
  1. HTTP status code (≥500 → CRITICAL)
  2. Timeout (3-second limit)
  3. Memory spike (>50 MB)
  4. Stack trace / secret leakage in response body
  5. Behavioral inconsistency (same payload, different responses)
"""

from __future__ import annotations
import time
import requests
import psutil
from typing import Optional


_TRACE_MARKERS = [
    "Traceback", "SQLException", "at line", "Error:", "stack trace",
    "NullPointerException", "SQLSTATE", "Internal Server Error",
    "Unhandled exception", "Fatal error",
]

_TIMEOUT_SECONDS = 3
_MEMORY_SPIKE_BYTES = 50 * 1024 * 1024  # 50 MB


def _current_memory() -> int:
    return psutil.virtual_memory().used


def _make_request(url: str, method: str, payload: dict, timeout: float, headers: dict = None) -> requests.Response:
    clean = {k: v for k, v in payload.items() if k != "_meta"}
    return requests.request(method, url, json=clean, timeout=timeout, headers=headers)


def monitor_request(url: str, payload: dict, method: str = "POST", headers: dict = None) -> dict:
    """Send one fuzz payload and classify the result.

    Returns a result dict with keys:
      input, crash, crash_type, severity, http_status, response_body, elapsed_ms
    """
    result: dict = {
        "input": payload,
        "crash": False,
        "crash_type": None,
        "severity": None,
        "http_status": None,
        "response_body": "",
        "elapsed_ms": 0,
    }

    mem_before = _current_memory()
    t0 = time.monotonic()

    try:
        r = _make_request(url, method, payload, _TIMEOUT_SECONDS, headers=headers)
        elapsed = (time.monotonic() - t0) * 1000
        mem_after = _current_memory()

        result["http_status"] = r.status_code
        result["response_body"] = r.text[:2000]
        result["elapsed_ms"] = round(elapsed, 1)

        # Mechanism 1 — HTTP status
        if r.status_code >= 500:
            result.update({"crash": True, "crash_type": "SERVER_ERROR", "severity": "CRITICAL"})

        # Mechanism 4 — Stack trace leakage (even on 200)
        elif any(marker in r.text for marker in _TRACE_MARKERS):
            result.update({"crash": True, "crash_type": "STACK_TRACE_LEAKED", "severity": "HIGH"})

        # Mechanism 3 — Memory spike
        elif (mem_after - mem_before) > _MEMORY_SPIKE_BYTES:
            result.update({"crash": True, "crash_type": "MEMORY_SPIKE", "severity": "MEDIUM"})

        # Mechanism 1b — 400 with stack trace keywords
        elif r.status_code == 400 and any(m in r.text for m in _TRACE_MARKERS):
            result.update({"crash": True, "crash_type": "BAD_REQUEST_WITH_TRACE", "severity": "HIGH"})

        # Empty response anomaly
        elif len(r.text.strip()) == 0:
            result.update({"crash": True, "crash_type": "EMPTY_RESPONSE", "severity": "LOW"})

    except requests.exceptions.Timeout:
        result.update({
            "crash": True,
            "crash_type": "TIMEOUT",
            "severity": "MEDIUM",
            "elapsed_ms": _TIMEOUT_SECONDS * 1000,
        })

    except requests.exceptions.ConnectionError:
        result.update({
            "crash": True,
            "crash_type": "CONNECTION_ERROR",
            "severity": "LOW",
        })

    except Exception as exc:  # noqa: BLE001
        result.update({
            "crash": True,
            "crash_type": "MONITOR_ERROR",
            "severity": "LOW",
            "response_body": str(exc)[:500],
        })

    return result


def check_behavioral_consistency(url: str, payload: dict, method: str = "POST", headers: dict = None) -> Optional[dict]:
    """Send the same payload twice; return a result if responses differ."""
    try:
        r1 = _make_request(url, method, payload, _TIMEOUT_SECONDS, headers=headers)
        r2 = _make_request(url, method, payload, _TIMEOUT_SECONDS, headers=headers)
        if r1.status_code != r2.status_code:
            return {
                "input": payload,
                "crash": True,
                "crash_type": "INCONSISTENT_BEHAVIOR",
                "severity": "MEDIUM",
                "http_status": r1.status_code,
                "response_body": f"First: {r1.status_code}, Second: {r2.status_code}",
                "elapsed_ms": 0,
            }
    except Exception:  # noqa: BLE001
        pass
    return None
