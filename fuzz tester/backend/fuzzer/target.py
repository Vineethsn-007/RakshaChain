"""
fuzzer/target.py
Loads the blockchain API schema from target_config.json and exposes
the endpoint list to the engine.
Supports runtime override from the discovery engine (zero-knowledge mode).
"""

from __future__ import annotations
import json
import os
from typing import Any

_DEFAULT_CONFIG = os.path.join(os.path.dirname(__file__), "..", "target_config.json")


class TargetAdapter:
    """Reads endpoint schema and resolves URLs for the fuzzer monitor."""

    def __init__(self, config_path: str = _DEFAULT_CONFIG) -> None:
        self.config_path = config_path
        self._config: dict[str, Any] = {}
        self._dynamic_endpoints: list[dict] | None = None  # set by discovery
        self.load()

    def load(self) -> None:
        """(Re)load config from disk."""
        with open(self.config_path, encoding="utf-8") as fh:
            self._config = json.load(fh)

    def set_base_url(self, url: str) -> None:
        """Override base URL at runtime (called from /fuzz/target or discovery)."""
        self._config["base_url"] = url.rstrip("/")
        # Clear dynamic endpoints so the new URL starts fresh
        self._dynamic_endpoints = None

    def set_endpoints(self, endpoints: list[dict]) -> None:
        """Inject a discovered endpoint list, bypassing target_config.json."""
        self._dynamic_endpoints = endpoints

    @property
    def base_url(self) -> str:
        return self._config.get("base_url", "http://localhost:8000")

    @property
    def endpoints(self) -> list[dict]:
        # Dynamic (discovered) endpoints take priority over config file
        if self._dynamic_endpoints is not None:
            return self._dynamic_endpoints
        return self._config.get("endpoints", [])

    def resolve_url(self, endpoint: dict, payload: dict) -> str:
        """Build full URL, substituting path params from payload."""
        path: str = endpoint["path"]
        # Replace any {param} style path variables
        for key, val in payload.items():
            if key.startswith("_"):
                continue
            placeholder = "{" + key + "}"
            if placeholder in path:
                path = path.replace(placeholder, str(val))
        # Fallback for legacy {id}
        if "{id}" in path:
            id_val = payload.get("id", "1")
            path = path.replace("{id}", str(id_val))
        return f"{self.base_url}{path}"

    def discovered_summary(self) -> list[str]:
        return [f"{e['method']} {e['path']}" for e in self.endpoints]
