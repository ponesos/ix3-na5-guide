# 아키텍처

최종 수정: 2026-09-08

## 원칙

**화면이 아니라 데이터가 소스 오브 트루스다.** 나중에 서버를 붙여도 카드 마크업을 다시 짜지 않고 데이터 소스만 바꾼다.

브라우저에서 BMW 공식몰을 긁지 않는다. CORS·약관·파손되기 쉬운 DOM에 의존하지 않는다. 수집은 사람이 공식 페이지를 보고 `data/`에 적거나, 이후 `scripts/`의 **오프라인 보조 도구**로 분리한다.

## 흐름

```text
docs (요구) → data JSON → site 정적 페이지 → GitHub Pages
                         ↘ 이후 API가 같은 JSON 형태를 제공
```

## 폴더

| 경로 | 역할 |
|------|------|
| `docs/` | 살아있는 개발 문서 |
| `data/` | 편집용 원본 JSON |
| `schemas/` | JSON Schema |
| `site/` | Pages 루트. `site/data/`는 원본 복사본 |
| `scripts/sync-data.sh` | `data/` → `site/data/` |

GitHub Pages는 **`site/` 폴더만** 공개한다. 따라서 브라우저는 `site/data/...`만 fetch한다. **원본은 항상 `data/`를 고치고 스크립트로 복사**한다.

## 정적 → 서버

Phase 0–3: `fetch('data/....json')` (사이트 루트 기준 **상대 경로**. 프로젝트 Pages `/저장소명/`에서도 동작)

Phase 4 예시:

- 같은 JSON을 `GET /api/vehicles/na5-ix3/accessories`로 제공
- `site/js`의 `DATA_BASE`만 `/api`로 변경
- 환율만 서버에서 넣고 액세서리는 계속 파일일 수도 있음

DB는 트래픽·다중 편집자가 생기기 전에는 불필요하다.

## 차종 확장

차량 키는 폴더명과 JSON의 `vehicleId`로 통일한다. 예: `na5-ix3`.

```text
data/vehicles/<vehicleId>/
  vehicle.json
  accessories.json
  reviews.json
  competitors.json
  tips.json
```

사이트는 이후 `vehicles/<id>/` 라우트 또는 쿼리로 연다. **지금은 iX3만** 하드코드해도 되지만 파일은 이미 이 구조를 쓴다.

## 프론트

- HTML + CSS + 바닐라 JS. React/Next는 비목표.
- 빌드 스텝 없음. JSON fetch.
- `file://`에서는 fetch가 막힌다. 로컬은 반드시 정적 서버.

## 환율

실시간 API 없음. `data/meta.json`의 `fx.eurKrw`, `fx.gbpKrw`, `asOf`, `source`. 추정 원화 = 현지가격 × 해당 환율. 갱신은 수동. 자동 갱신이 필요해지면 서버 트리거.
