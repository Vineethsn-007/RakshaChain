"""
main.py — FastAPI fuzz tester server
Exposes 8 REST endpoints; runs the fuzzer engine in a background thread.
"""

from __future__ import annotations
import threading
import time
import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from fuzzer.engine import FuzzEngine
from fuzzer.monitor import monitor_request, check_behavioral_consistency
from fuzzer.logger import log_crash, get_all_crashes, get_crash_by_id, get_report, clear_crashes
from fuzzer.target import TargetAdapter
from fuzzer.discovery import discover as run_discovery
from fuzzer.ai_reporter import generate_ai_report
from fuzzer.ai_mutator import get_ai_targeted_payloads

# ─── App setup ───────────────────────────────────────────────────────────────

app = FastAPI(title="AI Fuzz Tester", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Shared state ────────────────────────────────────────────────────────────

engine = FuzzEngine()
target = TargetAdapter()

_state: dict = {
    "running": False,
    "session_id": None,
    "inputs_sent": 0,
    "crashes_found": 0,
    "start_time": None,
    "stop_time": None,
    "custom_headers": {},
    "recent_logs": [],  # Store last 20 requests for the live stream
}

_stop_event = threading.Event()
_lock = threading.Lock()

# ─── Pydantic schemas ─────────────────────────────────────────────────────────

class TargetPayload(BaseModel):
    base_url: str


class StartPayload(BaseModel):
    headers: Optional[dict] = None


class DiscoverPayload(BaseModel):
    base_url: str


# ─── Fuzzer worker ───────────────────────────────────────────────────────────

def _fuzzer_worker() -> None:
    """Background thread: iterate all endpoints, fire all payloads, log crashes."""
    endpoints = target.endpoints
    RATE_LIMIT_DELAY = 0.1  # 10 req/s max
    seen_errors = set()  # track unique (path, error_msg) to avoid AI spam

    while not _stop_event.is_set():
        for endpoint in endpoints:
            if _stop_event.is_set():
                break

            payloads = engine.generate_payloads(endpoint)
            method = endpoint.get("method", "POST")

            for payload in payloads:
                if _stop_event.is_set():
                    break

                url = target.resolve_url(endpoint, payload)

                # Inject custom headers
                headers = _state.get("custom_headers", {})
                result = monitor_request(url, payload, method, headers=headers)

                with _lock:
                    _state["inputs_sent"] += 1
                    # Add to live log
                    log_entry = {
                        "id": _state["inputs_sent"],
                        "method": method,
                        "url": endpoint['path'],
                        "status": result.get("http_status", "???"),
                        "crash": result["crash"]
                    }
                    _state["recent_logs"] = [log_entry] + _state["recent_logs"][:19]

                if result["crash"]:
                    log_crash(
                        endpoint=f"{method} {endpoint['path']}",
                        method=method,
                        payload=payload,
                        crash_type=result["crash_type"],
                        severity=result["severity"],
                        http_status=result.get("http_status"),
                        response_body=result.get("response_body", ""),
                    )
                    with _lock:
                        _state["crashes_found"] += 1

                # Behavioral consistency check (every 10th payload)
                if _state["inputs_sent"] % 10 == 0:
                    bc = check_behavioral_consistency(url, payload, method)
                    if bc:
                        log_crash(
                            endpoint=f"{method} {endpoint['path']}",
                            method=method,
                            payload=payload,
                            crash_type=bc["crash_type"],
                            severity=bc["severity"],
                            http_status=bc.get("http_status"),
                            response_body=bc.get("response_body", ""),
                        )
                        with _lock:
                            _state["crashes_found"] += 1

                # ── AI Feedback Loop ──────────────────────────────────────────
                # If we get a 400/422, the server is telling us how its validation works.
                # Let's ask the AI to help us bypass it.
                status = result.get("http_status")
                if status in (400, 422):
                    err_msg = result.get("response_body", "")[:200]
                    path = endpoint['path']
                    error_key = f"{path}:{err_msg}"
                    
                    if error_key not in seen_errors:
                        seen_errors.add(error_key)
                        # Generate targeted payloads (sync for now, could be async)
                        ai_payloads = get_ai_targeted_payloads(path, method, payload, err_msg)
                        if ai_payloads:
                            engine.add_dynamic_payloads(path, ai_payloads)

                time.sleep(RATE_LIMIT_DELAY)

        # Loop continuously until stopped
        if not _stop_event.is_set():
            time.sleep(1)

    with _lock:
        _state["running"] = False


# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/fuzz/health")
def health() -> dict:
    """Health check."""
    return {"ok": True}


@app.post("/fuzz/start")
def start_fuzzing(payload: Optional[StartPayload] = None) -> dict:
    """Start fuzzing all configured endpoints in a background thread."""
    global _stop_event

    with _lock:
        if _state["running"]:
            return {"status": "already_running", "session_id": _state["session_id"]}

        _stop_event = threading.Event()
        session_id = str(uuid.uuid4())
        
        headers = payload.headers if payload else {}
        
        _state.update({
            "running": True,
            "session_id": session_id,
            "inputs_sent": 0,
            "crashes_found": 0,
            "start_time": time.time(),
            "stop_time": None,
            "custom_headers": headers,
            "recent_logs": [],
        })

    t = threading.Thread(target=_fuzzer_worker, daemon=True)
    t.start()

    return {"status": "running", "session_id": session_id}


@app.post("/fuzz/stop")
def stop_fuzzing() -> dict:
    """Signal the fuzzer to stop after the current request."""
    _stop_event.set()
    with _lock:
        _state["running"] = False
        _state["stop_time"] = time.time()  # freeze the timer
        stats = {
            "inputs_sent": _state["inputs_sent"],
            "crashes_found": _state["crashes_found"],
        }
    return {"status": "stopped", "stats": stats}


@app.get("/fuzz/status")
def get_status() -> dict:
    """Return current run statistics."""
    with _lock:
        if _state["start_time"] is None:
            elapsed = 0
        elif _state["running"]:
            elapsed = round(time.time() - _state["start_time"], 1)
        else:
            # Fuzzer stopped — use frozen stop_time so timer doesn't keep climbing
            end = _state["stop_time"] or _state["start_time"]
            elapsed = round(end - _state["start_time"], 1)
        return {
            "running": _state["running"],
            "session_id": _state["session_id"],
            "inputs_sent": _state["inputs_sent"],
            "crashes_found": _state["crashes_found"],
            "elapsed_seconds": elapsed,
            "recent_logs": _state["recent_logs"],
        }


@app.get("/fuzz/crashes")
def list_crashes(limit: int = 100) -> list:
    """Return all logged crashes, newest first."""
    return get_all_crashes(limit=limit)


@app.get("/fuzz/crashes/{crash_id}")
def get_crash(crash_id: str) -> dict:
    """Return full detail for a single crash by ID."""
    crash = get_crash_by_id(crash_id)
    if not crash:
        raise HTTPException(status_code=404, detail="Crash not found")
    return crash


@app.get("/fuzz/report")
def summary_report() -> dict:
    """Return an aggregate report grouped by severity and endpoint."""
    return get_report()


@app.get("/fuzz/generate-report")
def download_ai_report() -> dict:
    """Generates an AI remediation report using OpenRouter and returns it as Markdown text."""
    markdown_content = generate_ai_report()
    return {"report_markdown": markdown_content}


@app.post("/fuzz/discover")
def discover_target(payload: DiscoverPayload) -> dict:
    """
    Zero-knowledge API discovery.
    Probes the given URL for OpenAPI docs, common paths, and infers field
    schemas from validation error responses — no prior knowledge needed.
    Discovered endpoints are immediately loaded into the target adapter,
    ready for /fuzz/start.
    """
    result = run_discovery(payload.base_url)

    # Push discovered config into the live target adapter
    target.set_base_url(payload.base_url)
    if result["endpoints"]:
        target.set_endpoints(result["endpoints"])

    return result


@app.post("/fuzz/target")
def set_target(payload: TargetPayload) -> dict:
    """Override the target blockchain base URL at runtime."""
    target.set_base_url(payload.base_url)
    return {
        "target_url": target.base_url,
        "endpoints_discovered": target.discovered_summary(),
    }


@app.post("/fuzz/clear")
def clear_data() -> dict:
    """Clear all crash records (fresh demo reset)."""
    clear_crashes()
    with _lock:
        _state["inputs_sent"] = 0
        _state["crashes_found"] = 0
    return {"cleared": True}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=500, content={"error": str(exc)})
