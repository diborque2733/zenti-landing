#!/usr/bin/env python3
"""Aplica código de `workflows/zenti-node-code/*.js` al workflow ZENTI.eval en n8n Cloud.

Requiere:
- N8N_BASE_URL (ej: https://zenti.app.n8n.cloud)
- N8N_API_KEY  (Public API key)
Opcional:
- N8N_WORKFLOW_ID (default: oabhou5V20poYB55)
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NODE_CODE_DIR = ROOT / "workflows" / "zenti-node-code"
DEFAULT_WORKFLOW_ID = "oabhou5V20poYB55"

NODE_FILE_MAP = {
    "🧷 Normalizar binario PDF": "normalizar-binario-pdf.js",
    "⚙️ Preparar Datos": "preparar-datos.js",
    "📦 Consolidar": "consolidar.js",
    "🖥️ Render HTML Reporte": "render-html-premium.js",
    "📥 Descargar reporte.html": "descargar-reporte-pdf-o-html.js",
    "🔗 Preparar entrega email": "preparar-email-premium.js",
}


def fail(msg: str, code: int = 1) -> int:
    print(f"ERROR: {msg}", file=sys.stderr)
    return code


def read_node_code() -> dict[str, str]:
    result: dict[str, str] = {}
    missing: list[str] = []
    for node_name, rel_file in NODE_FILE_MAP.items():
        fp = NODE_CODE_DIR / rel_file
        if not fp.exists():
            missing.append(str(fp.relative_to(ROOT)))
            continue
        result[node_name] = fp.read_text(encoding="utf-8")

    if missing:
        raise FileNotFoundError("Faltan archivos de código: " + ", ".join(missing))
    return result


def api_request(base_url: str, api_key: str, method: str, path: str, payload: dict | None = None) -> dict:
    url = base_url.rstrip("/") + path
    headers = {
        "X-N8N-API-KEY": api_key,
        "Accept": "application/json",
    }
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url=url, method=method.upper(), headers=headers, data=data)
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} {method} {path}: {body}") from e


def main() -> int:
    base_url = os.getenv("N8N_BASE_URL", "").strip()
    api_key = os.getenv("N8N_API_KEY", "").strip()
    workflow_id = os.getenv("N8N_WORKFLOW_ID", DEFAULT_WORKFLOW_ID).strip()

    if not base_url:
        return fail("Definir N8N_BASE_URL")
    if not api_key:
        return fail("Definir N8N_API_KEY")
    if not workflow_id:
        return fail("Definir N8N_WORKFLOW_ID o usar default")

    try:
        code_by_node = read_node_code()
    except Exception as e:
        return fail(str(e))

    print(f"[1/3] Descargando workflow {workflow_id}...")
    wf = api_request(base_url, api_key, "GET", f"/api/v1/workflows/{urllib.parse.quote(workflow_id)}")

    nodes = wf.get("nodes") or []
    updated = 0
    missing_nodes = []

    for node_name, js_code in code_by_node.items():
        found = False
        for node in nodes:
            if node.get("name") == node_name:
                params = node.setdefault("parameters", {})
                params["jsCode"] = js_code
                found = True
                updated += 1
                break
        if not found:
            missing_nodes.append(node_name)

    if missing_nodes:
        return fail("No se encontraron nodos en workflow: " + ", ".join(missing_nodes))

    print(f"[2/3] Subiendo workflow con {updated} nodos actualizados...")
    payload = {
        "name": wf.get("name"),
        "nodes": nodes,
        "connections": wf.get("connections", {}),
        "settings": wf.get("settings", {}),
        "staticData": wf.get("staticData", {}),
        "pinData": wf.get("pinData", {}),
        "versionId": wf.get("versionId"),
        "meta": wf.get("meta", {}),
    }
    api_request(base_url, api_key, "PUT", f"/api/v1/workflows/{urllib.parse.quote(workflow_id)}", payload=payload)

    print("[3/3] OK: workflow actualizado en n8n Cloud.")
    print(f"Workflow ID: {workflow_id}")
    print(f"Base URL: {base_url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
