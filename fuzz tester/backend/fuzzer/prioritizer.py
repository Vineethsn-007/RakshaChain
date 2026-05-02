"""
fuzzer/prioritizer.py
Risk-score based payload prioritizer. 
Higher-risk payloads bubble to the top so demos find crashes sooner.
"""

from __future__ import annotations
from typing import Any


# Risk score table keyed on payload category tag
RISK_SCORES: dict[str, int] = {
    "sql_injection": 10,
    "null_required": 9,
    "negative_number": 8,
    "oversized_string": 7,
    "wrong_type": 6,
    "missing_optional": 3,
    "edge_case": 1,
}


class Prioritizer:
    """Ranks a list of payload dicts by their risk score (descending)."""

    def rank(self, payloads: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Return payloads sorted highest-risk first.

        Each payload dict is expected to carry a ``_meta`` key with at minimum
        a ``category`` string that maps to RISK_SCORES.
        """
        return sorted(
            payloads,
            key=lambda p: RISK_SCORES.get(p.get("_meta", {}).get("category", "edge_case"), 1),
            reverse=True,
        )
