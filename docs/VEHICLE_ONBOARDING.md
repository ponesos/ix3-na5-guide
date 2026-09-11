# 차량 추가 가이드 (수집 · 매핑)

최종 수정: 2026-09-11  
관련: [DATA.md](DATA.md), [TERMINOLOGY.md](TERMINOLOGY.md), [UI.md](UI.md), [LEGAL.md](LEGAL.md), [REQUIREMENTS.md](REQUIREMENTS.md)

새 차종을 넣을 때 **이 문서를 먼저** 따른다. UI·카피 수정 요청이 생기면 여기와 TERMINOLOGY / DATA를 같이 고친 뒤 코드를 맞춘다.

## 목표

- 공식·보도에서 **같은 사실이 항상 같은 JSON 필드**로 들어가게 한다.
- 파워트레인과 트림을 섞지 않는다.
- 사이트 표기(약칭)와 공식 표기를 둘 다 남긴다.
- 다른 차종을 추가해도 IA·라벨·표 구조가 같다.

## 폴더 규칙

```text
data/vehicles.json              # 목록에 한 줄 추가
data/vehicles/<vehicleId>/
  vehicle.json
  accessories.json
  tips.json
  reviews.json
  news.json
  competitors.json
  forum.json                    # 선택
schemas/vehicle.schema.json     # 공통 스키마
schemas/vehicles.schema.json    # 목록 스키마
```

- `vehicleId`: 소문자·하이픈. 예: `na5-ix3`, `g70-5series`(예시).
- `codeName`: 사내/업계 코드(NA5 등). 없으면 필드를 생략.
- 원본은 `data/`만 편집 → `./scripts/sync-data.sh` → `site/data/`.
- UI는 `?v=<vehicleId>`. 하드코드 차종 상수는 쓰지 않는다.

## 추가 절차 (요약)

1. TERMINOLOGY에 차종 절(필요 시).
2. `data/vehicles/<id>/`에 JSON 채우기(최소 `vehicle.json`).
3. `data/vehicles.json`의 `items`에 카드 한 줄 + 필요 시 `defaultVehicleId`.
4. `./scripts/sync-data.sh`
5. 브라우저에서 `index.html`(기본 차종 모델 정보)과 `vehicles.html` 목록 확인.

## 수집 순서 (체크리스트)

### A. 공식 용어 수확 (필수)

1. 해당 시장 **공식 모델 페이지**(예: bmw.co.kr 모델 URL)를 연다.
2. 히어로 모델명, 수치 블록 라벨, 트림/패키지명, 옵션 고유명, FAQ 표현을 메모한다.
3. [TERMINOLOGY.md](TERMINOLOGY.md)에 **차종별 절**을 추가하거나 공통 표를 갱신한다.  
   - 공통 라벨(주행 가능 거리, 가속력 등)은 표 하나로 유지.  
   - 차종 고유 약칭(SE/MSP…)은 차종 절에 둔다.
4. 카피는 TERMINOLOGY 어조 규칙을 따른다. 설명체·개발 메모체 금지.

### B. vehicle.json 매핑

| 수집 원문 | JSON 필드 | 규칙 |
|-----------|-----------|------|
| 공식 모델 풀네임 | `displayNameEn` / 약칭 `displayNameKo` | 예: THE NEW BMW iX3 / THE NEW iX3 |
| 플랫폼 | `platform` | Neue Klasse 등. 영문 유지 |
| 차체 | `bodyType` | SAV, Sedan… 공식 용어 |
| 코드네임 | `codeName` | NA5 |
| **공통 파워트레인** | `markets.kr.powertrain` | 트림명에 넣지 않음. 예: `50 xDrive` |
| 구동 | `markets.kr.drive` | 공식 표기(BMW xDrive 사륜구동 등) |
| 트림 약칭 | `trims[].nameKo` | **짧게**: SE, MSP, MSP Pro |
| 트림 공식명 | `trims[].nameOfficialKo` | 예: 50 xDrive M 스포츠 |
| 트림 id | `trims[].id` | 슬러그: `se`, `m-sport`, `m-sport-pro` |
| 가격 | `priceKrw` 또는 min/max | 세율 조건을 `priceTaxBasisKo`·`priceDisclaimerKo`에 |
| 기본 휠 | `trims[].wheelKo` | **별도 필드**. 하이라이트에 넣지 않음 |
| 하이라이트 | `trims[].highlightsKo[]` | 휠 제외. 공식 옵션명 유지 |
| 국내 주행 가능 거리 | `range.koreaCertifiedKm` (+ Min) | UI 라벨: 주행 가능 거리 |
| WLTP | `range.wltpKm` | UI 라벨: 주행 가능 거리 (WLTP) |
| 0–100 | `performance.accel0to100Sec` | UI: 가속력 (0–100 km/h) |
| 최고속 | `performance.topSpeedKmh` | UI: 안전 최고 속도 |
| 출력 | `systemKw` / `systemHp` | UI: 최대 출력 |
| 복합 전비 | `battery.efficiencyKmPerKwh*` | |
| 충전 | `charging.*` | 섹션/노트에서 「차징」 용어 허용 |
| 출처 | `sources[]` | 보도·공식·로컬 PDF 구분 |

**파워트레인 ≠ 트림**

```text
❌ nameKo: "50 xDrive SE"
✅ powertrain: "50 xDrive"
✅ nameKo: "SE"
✅ nameOfficialKo: "50 xDrive SE"
```

단일 파워트레인이면 모든 트림이 같은 `powertrain`을 공유한다. 파워트레인이 여러 개면 `markets.kr.powertrains[]` 확장 전에 DATA·스키마를 먼저 고친다.

### C. 화면 표 구조 (모델 정보)

트림 표 열 순서 고정:

1. 트림 (`nameKo`, 필요 시 `nameOfficialKo` 보조 표기)
2. 가격
3. 하이라이트
4. 휠 (`wheelKo`) ← **오른쪽 끝 전용 열**

히어로 킥커 예: `{브랜드 모델} · {codeName} · {powertrain}`

통계 카드 기본 4칸:

1. **가격대** (전 트림 최저–최고)
2. 주행 가능 거리
3. 주행 가능 거리 (WLTP)
4. 가속력 (0–100 km/h)

### D. accessories.json

| 규칙 | 내용 |
|------|------|
| 사이트 표기 | **액세서리**. UI에서 `origin`으로 **정품(oem)** / **서드파티(thirdParty)** 구분 |
| 차종 전용 | 해당 코드/세대만. 구형·타코드 혼입 금지 |
| 정품 | BMW 오리지널. `oemPartNumber`·공식/딜러 출처 권장 |
| 서드파티 | 사제. `brandKo` 권장. 가짜 BMW 품번 금지 |
| 국내 쇼핑 | `markets[].country: KR`, `currency: KRW`, 개별 상품 URL만 수동 등록 |
| 필수 | origin, titleKo, titleOriginal, markets[].sourceUrl·price·asOf |
| 사진 | 기본 없음. 링크만. 오너·허가 사진만 `image` |
| 전용 플래그 | 현재 `na5Dedicated`. 다중 차종 시 `dedicated: true` + 상위 `vehicleId`로 이관 예정 |
| 카테고리 UI | interior→인테리어 등 [app.js CATEGORY_KO](../site/js/app.js) |

### E. tips / reviews / competitors

- tips: 익명 FAQ만. 공식과 충돌 시 공식 우선 + caveat.
- reviews: 우선 유튜브 채널을 `priorityChannels`에 고정 → 해당 채널에서 **해당 세대만** 검색 → `publishedAt` 최신순 정렬. 요약 2~4문장, URL 필수. 없으면 노트만.
- forum: 해외 1차 **MOTOR-TALK NA5** 보드는 **메타만** (`forum.json`). 본문 금지. `sync-motor-talk.py`로 목록 HTML 파싱. 네이버 카페·Bimmerpost 연동은 하지 않음.
- competitors: placeholder 허용. 전문 전·무단 복제 금지.

## 새 차종 온보딩 절차

1. `data/vehicles/<id>/` 생성, `na5-ix3`를 템플릿으로 복사 후 비우기·채우기.
2. 공식 페이지에서 용어 수확 → TERMINOLOGY 갱신.
3. vehicle.json 채우기 → 스키마 검증(가능하면).
4. accessories / tips 최소분.
5. `sync-data.sh`.
6. `data/vehicles.json`에 카드 한 줄 추가. 브라우저에서 허브 → `model.html?v=<id>`·섹션 확인.
7. 수용 기준: REQUIREMENTS의 차량·액세서리 항목을 차종 일반화 문장으로 통과 확인.

## 수정 요청이 들어올 때

사용자가 UI·용어·표 구조 변경을 요청하면:

1. **코드만 고치지 않는다.**
2. 이 파일 + TERMINOLOGY + DATA(+ 필요 시 UI/스키마)에 규칙을 남긴다.
3. 그다음 JSON·렌더러를 맞춘다.

이렇게 해야 다음 차종 수집 시 같은 매핑이 재사용된다.
