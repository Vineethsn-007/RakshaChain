"""
mock_target.py — Intentionally vulnerable API for local testing.
Run this as the 'blockchain site' when the real site is unavailable.
  uvicorn mock_target:app --port 8000 --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI(title="Mock Blockchain Target (Vulnerable)")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.post("/api/login")
def login(data: dict):
    username = data["username"]          # KeyError crash if missing
    password = data["password"]          # KeyError crash if missing
    if len(username) > 100:
        raise Exception("Traceback: username too long — internal buffer overflow")
    return {"token": "fake-jwt-token"}


@app.post("/api/add-transaction")
def add_transaction(data: dict):
    amount = data["amount"]              # KeyError crash if missing
    if amount > 0:                       # TypeError crash if amount is not a number
        return {"status": "success", "tx_id": "TX123"}
    return {"status": "error"}           # No check for negative — logic bug


@app.get("/api/funds/{id}")
def get_funds(id: str):
    if id == "":
        return {}                        # Empty response — LOW severity anomaly
    if "script" in str(id).lower():
        return {"error": "Traceback: XSS attempt detected at line 42"}
    return {"id": id, "balance": 9999}


@app.post("/api/flag-transaction")
def flag_transaction(data: dict):
    transaction_id = data["transaction_id"]  # KeyError crash if missing
    reason = data.get("reason", "")
    if len(str(transaction_id)) > 50:
        import time; time.sleep(5)      # Simulates timeout
    return {"flagged": True}
