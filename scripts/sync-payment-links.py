#!/usr/bin/env python3
"""
Sincroniza links de pago/consultoria en landing + nodos de email/report.

Uso:
  python3 scripts/sync-payment-links.py
  python3 scripts/sync-payment-links.py --config scripts/payment-links.json
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def replace_or_fail(content: str, pattern: str, repl: str, file: Path) -> str:
    updated, n = re.subn(pattern, repl, content, flags=re.MULTILINE)
    if n == 0:
        raise RuntimeError(f"No se encontro patron en {file}: {pattern}")
    return updated


def choose_existing(*candidates: Path) -> Path:
    for c in candidates:
        if c.exists():
            return c
    raise FileNotFoundError(f"No existe ninguno de los paths esperados: {', '.join(str(c) for c in candidates)}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="scripts/payment-links.json")
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    cfg_path = root / args.config
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))

    premium_usd = cfg["premiumUsd"]
    premium_clp = cfg["premiumClp"]
    consult_cal = cfg["consultCal"]
    ga4_id = cfg.get("ga4MeasurementId", "")

    files = {
        "landing": choose_existing(root / "index.html", root / "workflows/zenti-landing/zenti-eval-chat.html"),
        "render": root / "workflows/zenti-node-code/render-html-premium.js",
        "render_premium": root / "workflows/zenti-node-code/render-premium-report.js",
        "email": root / "workflows/zenti-node-code/preparar-email-premium.js",
    }

    # Landing JS object
    landing = files["landing"]
    c = landing.read_text(encoding="utf-8")
    c = replace_or_fail(
        c,
        r"const ZENTI_PAY_LINKS = \{[\s\S]*?\};",
        (
            "const ZENTI_PAY_LINKS = {\n"
            f"      premiumUsd: '{premium_usd}',\n"
            f"      premiumClp: '{premium_clp}',\n"
            f"      consultCal: '{consult_cal}',\n"
            "    };"
        ),
        landing,
    )
    if "const ZENTI_GA4_MEASUREMENT_ID" in c:
        c = replace_or_fail(
            c,
            r"const ZENTI_GA4_MEASUREMENT_ID = '[^']*';",
            f"const ZENTI_GA4_MEASUREMENT_ID = '{ga4_id}';",
            landing,
        )
    c = re.sub(r'href="https://(?:cal\.com/zenti|calendly\.com/diego-zentigrants/consultoria-estrategica-zenti)"', f'href="{consult_cal}"', c)
    landing.write_text(c, encoding="utf-8")

    # Render report constants + consultoria CTA
    render = files["render"]
    c = render.read_text(encoding="utf-8")
    c = replace_or_fail(
        c,
        r"const ZENTI_LINK_PREMIUM_USD = '[^']*';",
        f"const ZENTI_LINK_PREMIUM_USD = '{premium_usd}';",
        render,
    )
    c = replace_or_fail(
        c,
        r"const ZENTI_LINK_PREMIUM_CLP = '[^']*';",
        f"const ZENTI_LINK_PREMIUM_CLP = '{premium_clp}';",
        render,
    )
    c = re.sub(r'href="https://(?:cal\.com/zenti|calendly\.com/diego-zentigrants/consultoria-estrategica-zenti)"', f'href="{consult_cal}"', c)
    render.write_text(c, encoding="utf-8")

    # Premium render node consult link constant
    render_premium = files["render_premium"]
    c = render_premium.read_text(encoding="utf-8")
    c = replace_or_fail(
        c,
        r"const CONSULT_CAL_LINK = '[^']*';",
        f"const CONSULT_CAL_LINK = '{consult_cal}';",
        render_premium,
    )
    render_premium.write_text(c, encoding="utf-8")

    # Email constants + consultoria CTA
    email = files["email"]
    c = email.read_text(encoding="utf-8")
    c = replace_or_fail(
        c,
        r"const LINK_PREMIUM_USD = '[^']*';",
        f"const LINK_PREMIUM_USD = '{premium_usd}';",
        email,
    )
    c = replace_or_fail(
        c,
        r"const LINK_PREMIUM_CLP = '[^']*';",
        f"const LINK_PREMIUM_CLP = '{premium_clp}';",
        email,
    )
    c = re.sub(r'href="https://(?:cal\.com/zenti|calendly\.com/diego-zentigrants/consultoria-estrategica-zenti)"', f'href="{consult_cal}"', c)
    email.write_text(c, encoding="utf-8")

    print("OK: links sincronizados (landing, render-html-premium, render-premium-report, preparar-email-premium)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
