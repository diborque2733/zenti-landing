#!/usr/bin/env bash
# Revisión DNS/HTTPS para zentigrants.com (ejecutar en TU Mac, no en sandbox CI).
set -euo pipefail
echo "=== zentigrants.com (apex) ==="
dig +short zentigrants.com A || true
dig +short zentigrants.com AAAA || true
echo ""
echo "=== www.zentigrants.com ==="
dig +short www.zentigrants.com CNAME || true
dig +short www.zentigrants.com A || true
echo ""
echo "=== Cabeceras HTTPS (esperado: 200 o 301/302 a GitHub Pages) ==="
curl -sS -I --max-time 25 "https://zentigrants.com/" | head -15 || true
echo ""
curl -sS -I --max-time 25 "https://www.zentigrants.com/" | head -15 || true
echo ""
echo "=== Referencia GitHub Pages (apex) ==="
echo "Registros A típicos: 185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153"
echo "CNAME www -> diborque2733.github.io (sin path /zenti-landing)"
echo "Repo zenti-landing: Settings -> Pages -> Custom domain: zentigrants.com + Enforce HTTPS"
