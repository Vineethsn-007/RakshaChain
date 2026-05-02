"""
fuzzer/discovery.py
Zero-knowledge API discovery engine.

Probes a target URL to discover endpoints, infer schemas, and build a fuzz config
without any prior knowledge of the API structure.

Discovery pipeline:
  1. OpenAPI/Swagger check  — if /openapi.json exists, parse the full schema
  2. Common path probing    — tries 40+ typical REST API patterns
  3. Schema inference       — sends empty POST, parses 422/400 validation errors
  4. Type inference         — guesses field type (string/number) from field name
"""

from __future__ import annotations
import re
import requests
from typing import Optional

_TIMEOUT = 3  # seconds per probe request

# ─── OpenAPI probe paths ─────────────────────────────────────────────────────

_OPENAPI_PATHS = [
    "/openapi.json",
    "/swagger.json",
    "/docs/openapi.json",
    "/api/openapi.json",
    "/api-docs",
    "/api/docs",
    "/swagger/v1/swagger.json",
    "/api/v1/openapi.json",
    "/v1/api-docs",
    "/redoc",
]

# ─── Common REST endpoint patterns ───────────────────────────────────────────
# (path, method, hint_fields)  — hints are used if schema inference fails

_COMMON_PATHS: list[tuple[str, str, dict]] = [
    # Auth
    ("/api/login",              "POST", {"username": "string", "password": "string"}),
    ("/api/register",           "POST", {"username": "string", "email": "string", "password": "string"}),
    ("/api/auth/login",         "POST", {"username": "string", "password": "string"}),
    ("/api/auth/register",      "POST", {"email": "string", "password": "string"}),
    ("/api/logout",             "POST", {}),
    ("/api/token",              "POST", {"username": "string", "password": "string"}),
    ("/api/verify",             "POST", {"token": "string"}),
    ("/api/reset-password",     "POST", {"email": "string"}),
    ("/api/forgot-password",    "POST", {"email": "string"}),
    # Users / profile
    ("/api/users",              "GET",  {}),
    ("/api/user",               "GET",  {}),
    ("/api/profile",            "GET",  {}),
    ("/api/me",                 "GET",  {}),
    ("/api/users/1",            "GET",  {}),
    # Health / status
    ("/health",                 "GET",  {}),
    ("/api/health",             "GET",  {}),
    ("/status",                 "GET",  {}),
    ("/api/status",             "GET",  {}),
    ("/ping",                   "GET",  {}),
    # Finance / blockchain
    ("/api/transactions",       "GET",  {}),
    ("/api/transaction",        "POST", {"amount": "number", "to": "string"}),
    ("/api/add-transaction",    "POST", {"amount": "number", "to": "string", "purpose": "string"}),
    ("/api/funds",              "GET",  {}),
    ("/api/funds/1",            "GET",  {}),
    ("/api/balance",            "GET",  {}),
    ("/api/transfer",           "POST", {"from": "string", "to": "string", "amount": "number"}),
    ("/api/payments",           "POST", {"amount": "number", "method": "string"}),
    ("/api/flag-transaction",   "POST", {"transaction_id": "string", "reason": "string"}),
    ("/api/wallet",             "GET",  {}),
    ("/api/ledger",             "GET",  {}),
    # E-commerce
    ("/api/products",           "GET",  {}),
    ("/api/orders",             "GET",  {}),
    ("/api/cart",               "GET",  {}),
    ("/api/search",             "GET",  {}),
    # Generic REST
    ("/api/data",               "GET",  {}),
    ("/api/items",              "GET",  {}),
    ("/api/records",            "GET",  {}),
    ("/api/upload",             "POST", {"file": "string"}),
    ("/api/submit",             "POST", {"data": "string"}),
]

# ─── Field name → type heuristics ────────────────────────────────────────────

_NUMBER_HINTS = (
    "amount", "price", "cost", "fee", "total", "balance",
    "count", "qty", "quantity", "age", "limit", "offset",
    "num", "number", "port", "size", "score", "rate", "tax",
    "id", "page", "index", "rank", "weight",
)


def _guess_type(field_name: str) -> str:
    """Heuristically guess field type from its name."""
    name = field_name.lower()
    if any(hint in name for hint in _NUMBER_HINTS):
        return "number"
    return "string"


# ─── HTTP helpers ─────────────────────────────────────────────────────────────

def _get(base: str, path: str) -> Optional[requests.Response]:
    try:
        return requests.get(f"{base}{path}", timeout=_TIMEOUT)
    except Exception:
        return None


def _post(base: str, path: str, body: dict) -> Optional[requests.Response]:
    try:
        return requests.post(f"{base}{path}", json=body, timeout=_TIMEOUT)
    except Exception:
        return None


def _request(method: str, base: str, path: str, body: dict) -> Optional[requests.Response]:
    try:
        return requests.request(method, f"{base}{path}", json=body, timeout=_TIMEOUT)
    except Exception:
        return None


# ─── OpenAPI parser ───────────────────────────────────────────────────────────

def _parse_openapi(spec: dict) -> list[dict]:
    """Parse OpenAPI 3.x or Swagger 2.x spec into our endpoint list format."""
    endpoints = []
    paths = spec.get("paths", {})

    for path, path_item in paths.items():
        for method, operation in path_item.items():
            if method.upper() not in ("GET", "POST", "PUT", "PATCH", "DELETE"):
                continue

            fields: dict[str, str] = {}

            # OpenAPI 3.x — requestBody
            req_body = operation.get("requestBody", {})
            content = req_body.get("content", {})
            schema = content.get("application/json", {}).get("schema", {})
            for fname, fschema in schema.get("properties", {}).items():
                ftype = fschema.get("type", "string")
                fields[fname] = "number" if ftype in ("integer", "number", "float") else "string"

            # OpenAPI 3.x / Swagger 2.x — parameters
            for param in operation.get("parameters", []):
                pin = param.get("in", "")
                if pin == "body":
                    # Swagger 2.x body parameter
                    body_schema = param.get("schema", {})
                    for fname, fschema in body_schema.get("properties", {}).items():
                        ftype = fschema.get("type", "string")
                        fields[fname] = "number" if ftype in ("integer", "number") else "string"
                elif pin == "path":
                    fields[param["name"]] = "path_param"
                elif pin == "query":
                    fields[param["name"]] = "string"

            endpoints.append({
                "path": path,
                "method": method.upper(),
                "fields": fields,
                "source": "openapi",
            })

    return endpoints


# ─── Schema inference from validation errors ──────────────────────────────────

def _infer_schema(base: str, path: str, method: str) -> dict[str, str]:
    """
    Send an empty body and parse the validation error to discover field names.
    Works with FastAPI (422), Django REST Framework (400), Express-validator, etc.
    """
    if method == "GET":
        return {}

    fields: dict[str, str] = {}
    r = _request(method, base, path, {})
    if r is None:
        return fields

    # ── FastAPI / Pydantic — 422 with structured detail ──────────────────
    if r.status_code == 422:
        try:
            body = r.json()
            for error in body.get("detail", []):
                loc = error.get("loc", [])
                # loc is like ["body", "field_name"] or ["body", "nested", "field"]
                if len(loc) >= 2 and loc[0] in ("body", "json"):
                    fname = str(loc[1])
                    if fname not in ("__root__",):
                        fields[fname] = _guess_type(fname)
        except Exception:
            pass

    # ── Generic pattern matching on 400 / 422 text ────────────────────────
    if not fields and r.status_code in (400, 422):
        text = r.text
        patterns = [
            r"""['\"](\w+)['\"][\s:]+(?:is\s+)?required""",
            r"""missing\s+required\s+(?:field\s+)?['\"]?(\w+)['\"]?""",
            r"""['\"](\w+)['\"]:\s*\[""",
            r"""field\s+['\"](\w+)['\"]""",
        ]
        for pattern in patterns:
            for m in re.finditer(pattern, text, re.IGNORECASE):
                name = m.group(1)
                if name.lower() not in ("null", "true", "false", "error", "message", "detail"):
                    fields[name] = _guess_type(name)

    return fields


# ─── Main discovery function ──────────────────────────────────────────────────

def discover(base_url: str) -> dict:
    """
    Full zero-knowledge discovery pipeline. Returns a config dict compatible
    with target_config.json that can be loaded directly into the fuzzer.

    Args:
        base_url: e.g. "http://localhost:8000" or "https://api.example.com"

    Returns:
        {
            "base_url":      str,
            "openapi_found": bool,
            "source":        "openapi" | "probe",
            "probed":        int,    # total URLs checked
            "discovered":    int,    # endpoints found
            "endpoints":     [ {path, method, fields, source} ],
        }
    """
    base_url = base_url.rstrip("/")

    result: dict = {
        "base_url": base_url,
        "openapi_found": False,
        "source": "probe",
        "probed": 0,
        "discovered": 0,
        "endpoints": [],
    }

    # ── Step 1: OpenAPI / Swagger ─────────────────────────────────────────
    for opath in _OPENAPI_PATHS:
        result["probed"] += 1
        r = _get(base_url, opath)
        if r and r.status_code == 200:
            try:
                spec = r.json()
                if "paths" in spec:
                    endpoints = _parse_openapi(spec)
                    if endpoints:
                        result["endpoints"] = endpoints
                        result["openapi_found"] = True
                        result["source"] = "openapi"
                        result["discovered"] = len(endpoints)
                        return result
            except Exception:
                pass

    # ── Step 2: Common path probing + schema inference ────────────────────
    found: list[dict] = []

    for path, method, hint_fields in _COMMON_PATHS:
        result["probed"] += 1

        # Build a probe body from hints so we don't get 400 on structural issues
        probe_body = {
            f: ("test_value" if t == "string" else 1)
            for f, t in hint_fields.items()
            if t != "path_param"
        }

        r = _request(method, base_url, path, probe_body)
        if r is None:
            continue

        # 404 / 405 = endpoint doesn't exist; everything else = it's there
        if r.status_code in (404, 405):
            continue

        # Infer schema from validation errors on the real endpoint
        inferred = _infer_schema(base_url, path, method)

        # Merge: inferred fields take precedence, hints fill in the rest
        merged_fields = {**hint_fields, **inferred}

        found.append({
            "path": path,
            "method": method,
            "fields": merged_fields,
            "source": "probe",
            "http_status": r.status_code,
        })

    result["endpoints"] = found
    result["discovered"] = len(found)

    return result
