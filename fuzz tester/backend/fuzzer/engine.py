"""
fuzzer/engine.py
Payload generation engine — 7 mutation categories, priority-ranked.
"""

from __future__ import annotations
from typing import Any
from .prioritizer import Prioritizer

prioritizer = Prioritizer()

# ─── Mutation banks ───────────────────────────────────────────────────────────

_NULL_VARIANTS: list[Any] = [None, "", {}, [], 0, False, "null", "undefined"]

_BOUNDARY_NUMBERS: list[Any] = [
    -1, 0, 1, -9999999, 2147483647, -2147483648, 9999999999, 0.0001, -0.0001,
]

_OVERSIZED_STRINGS: list[str] = [
    "A" * 10_000,
    "B" * 65_535,
    " " * 5_000,
    "\t\n" * 2_000,
]

_INJECTION_STRINGS: list[str] = [
    "'; DROP TABLE transactions;--",
    '" OR "1"="1',
    "<script>alert('xss')</script>",
    "../../../etc/passwd",
    "{{7*7}}",
    "${7*7}",
    "' UNION SELECT * FROM users--",
    "admin'--",
    "<img src=x onerror=alert(1)>",
    "1; EXEC xp_cmdshell('dir')--",
]

_ENCODING_ATTACKS: list[Any] = [
    "\x00",
    "\xff\xfe",
    "😀" * 500,
    "\u202e",
    "%00",
    "%0d%0a",
    "\r\n\r\nHTTP/1.1 200 OK",
]

_WRONG_TYPES: dict[str, list[Any]] = {
    "string": [123, True, ["array"], {"obj": 1}, 3.14],
    "number": ["not_a_number", None, [], {}, True, "1e999"],
    "path_param": [-1, "", None, "../../admin", "<id>"],
}


# ─── Engine ───────────────────────────────────────────────────────────────────

class FuzzEngine:
    """Generates all malformed payloads for a given endpoint schema."""

    def __init__(self):
        self._dynamic_queue: dict[str, list[dict]] = {}  # endpoint_path -> [payloads]

    def add_dynamic_payloads(self, endpoint_path: str, payloads: list[dict]):
        """Inject AI-generated payloads into the fuzzer's queue."""
        if endpoint_path not in self._dynamic_queue:
            self._dynamic_queue[endpoint_path] = []
        self._dynamic_queue[endpoint_path].extend(payloads)

    def generate_payloads(self, endpoint: dict) -> list[dict]:
        """Return a priority-ranked list of fuzz payloads for *endpoint*.

        Each payload dict contains the field values to send plus a hidden
        ``_meta`` key describing category and targeted field.
        """
        payloads: list[dict] = []
        fields: dict[str, str] = endpoint.get("fields", {})

        for field, ftype in fields.items():
            if ftype == "path_param":
                payloads += self._path_param_variants(field)
            else:
                payloads += self._mutate_field(field, ftype, fields)

        # Always add a fully-missing-fields payload
        payloads.append({"_meta": {"category": "null_required", "field": "__all__"}})

        # Inject AI dynamic payloads if any exist for this path
        path = endpoint.get("path", "")
        if path in self._dynamic_queue:
            payloads.extend(self._dynamic_queue[path])
            # Clear them so we don't repeat them forever
            self._dynamic_queue[path] = []

        return prioritizer.rank(payloads)

    # ── Per-field mutation helpers ──────────────────────────────────────────

    def _mutate_field(self, field: str, ftype: str, all_fields: dict) -> list[dict]:
        mutations: list[dict] = []
        mutations += self._empty_variants(field, ftype, all_fields)
        mutations += self._boundary_variants(field, ftype, all_fields)
        mutations += self._injection_variants(field, all_fields)
        mutations += self._type_confusion_variants(field, ftype, all_fields)
        mutations += self._encoding_variants(field, all_fields)
        mutations += self._oversized_variants(field, all_fields)
        return mutations

    def _base_payload(self, all_fields: dict) -> dict:
        """Craft a minimal 'valid' base payload for a field set."""
        base: dict = {}
        for f, t in all_fields.items():
            if t == "string":
                base[f] = "test_value"
            elif t == "number":
                base[f] = 1
            elif t == "path_param":
                base[f] = "1"
        return base

    def _empty_variants(self, field: str, ftype: str, all_fields: dict) -> list[dict]:
        results = []
        for val in _NULL_VARIANTS:
            p = self._base_payload(all_fields)
            p[field] = val
            p["_meta"] = {"category": "null_required", "field": field}
            results.append(p)
        return results

    def _boundary_variants(self, field: str, ftype: str, all_fields: dict) -> list[dict]:
        results = []
        if ftype == "number":
            for val in _BOUNDARY_NUMBERS:
                p = self._base_payload(all_fields)
                p[field] = val
                category = "negative_number" if isinstance(val, (int, float)) and val < 0 else "edge_case"
                p["_meta"] = {"category": category, "field": field}
                results.append(p)
        return results

    def _injection_variants(self, field: str, all_fields: dict) -> list[dict]:
        results = []
        for val in _INJECTION_STRINGS:
            p = self._base_payload(all_fields)
            p[field] = val
            p["_meta"] = {"category": "sql_injection", "field": field}
            results.append(p)
        return results

    def _type_confusion_variants(self, field: str, ftype: str, all_fields: dict) -> list[dict]:
        results = []
        wrong_types = _WRONG_TYPES.get(ftype, [])
        for val in wrong_types:
            p = self._base_payload(all_fields)
            p[field] = val
            p["_meta"] = {"category": "wrong_type", "field": field}
            results.append(p)
        return results

    def _encoding_variants(self, field: str, all_fields: dict) -> list[dict]:
        results = []
        for val in _ENCODING_ATTACKS:
            p = self._base_payload(all_fields)
            p[field] = val
            p["_meta"] = {"category": "edge_case", "field": field}
            results.append(p)
        return results

    def _oversized_variants(self, field: str, all_fields: dict) -> list[dict]:
        results = []
        for val in _OVERSIZED_STRINGS:
            p = self._base_payload(all_fields)
            p[field] = val
            p["_meta"] = {"category": "oversized_string", "field": field}
            results.append(p)
        return results

    def _path_param_variants(self, field: str) -> list[dict]:
        variants = [
            (-1, "negative_number"),
            ("", "null_required"),
            (None, "null_required"),
            ("../../etc/passwd", "sql_injection"),
            ("A" * 500, "oversized_string"),
            ("<script>", "sql_injection"),
            (0, "edge_case"),
            ("99999999", "edge_case"),
        ]
        results = []
        for val, cat in variants:
            results.append({"id": val, "_meta": {"category": cat, "field": field}})
        return results
