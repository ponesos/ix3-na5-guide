#!/usr/bin/env bash
# Open BMW accessory shop for local VIN fitment checks.
# Never prints the VIN. Reads secrets/vin.local.json only.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIN_FILE="$ROOT/secrets/vin.local.json"

if [[ ! -f "$VIN_FILE" ]]; then
  echo "secrets/vin.local.json 이 없습니다. secrets/README.md 를 보세요." >&2
  exit 1
fi

python3 - "$VIN_FILE" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
vin = (data.get("vin") or "").strip().upper()
if len(vin) != 17 or vin.startswith("REPLACE"):
    print("VIN이 비어 있거나 예시값입니다. vin.local.json을 확인하세요.", file=sys.stderr)
    sys.exit(1)
url = (data.get("shopUrls") or {}).get("DE") or "https://www.bmw.de/de/shop/ls/cp/physical-goods/de-BF_ACCESSORY"
print(url)
PY

URL="$(python3 -c "import json; print((json.load(open('$VIN_FILE')).get('shopUrls') or {}).get('DE') or 'https://www.bmw.de/de/shop/ls/cp/physical-goods/de-BF_ACCESSORY')")"

echo "BMW 액세서리 샵을 엽니다. VIN은 출력하지 않습니다."
echo "브라우저: Fahrzeug hinzufügen → VIN → secrets/vin.local.json 값을 직접 입력"
echo "참고: 한국 사양 VIN은 bmw.de에서 조회 실패할 수 있습니다. NA5 표기 상품은 VIN 없이 수집합니다."

if command -v open >/dev/null 2>&1; then
  open "$URL"
else
  echo "$URL"
fi
