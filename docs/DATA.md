# 데이터

최종 수정: 2026-09-11  
스키마: `schemas/*.schema.json`  
**새 차종 추가:** [VEHICLE_ONBOARDING.md](VEHICLE_ONBOARDING.md)  
**용어·카피:** [TERMINOLOGY.md](TERMINOLOGY.md)

## 원본과 배포본

| 위치 | 용도 |
|------|------|
| `data/` | 사람이 편집하는 원본 |
| `site/data/` | Pages가 서빙. **직접 편집하지 않음** |

```bash
./scripts/sync-data.sh
```

## 다중 차량

```text
data/vehicles.json                 # 차종 목록(허브·기본 id)
data/vehicles/<vehicleId>/vehicle.json
data/vehicles/<vehicleId>/accessories.json
…
```

차종마다 폴더를 분리한다. 목록·기본 차종은 `data/vehicles.json`, 공통 환율·사이트명은 `data/meta.json`.

사이트는 `?v=<vehicleId>`로 차종을 고른다. **최초 진입은 `index.html`(모델 정보, 기본=iX3)**. 차종 목록은 `vehicles.html`.

필드 의미·수집 매핑은 [VEHICLE_ONBOARDING.md](VEHICLE_ONBOARDING.md)의 표를 단일 기준으로 한다.

## 공통 규칙

- 날짜는 `YYYY-MM-DD`
- 금액은 숫자 + `currency` (`EUR` | `GBP` | `KRW`)
- 출처 있는 사실에는 `sourceUrl` 또는 `sources[]`
- 추측은 `confidence`: `confirmed` | `inferred` | `unverified` | tips의 `community`
- **세대·코드가 다른 차량 부품·제원을 섞지 않음**
- 카피 어조는 TERMINOLOGY 준수

## meta.json

사이트명, `updatedAt`, 환율 스냅샷. 단일 차종 id는 두지 않는다(목록은 `vehicles.json`).

```json
"fx": {
  "eurKrw": 1563.3,
  "gbpKrw": 1813.3,
  "asOf": "2026-09-08",
  "source": "설명",
  "sourceUrl": "https://..."
}
```

`eurKrw`와 `gbpKrw` 기준일이 다르면 `eurKrwAsOf` / `gbpKrwAsOf`. 없으면 `fx.asOf`.

## vehicles.json

`defaultVehicleId`와 `items[]`(`id`, `displayNameKo`, `codeName`, `blurbKo`, `status`).

## vehicle.json

### 식별

| 필드 | 예 (NA5) | 설명 |
|------|----------|------|
| `id` | `na5-ix3` | vehicleId와 동일 권장 |
| `codeName` | `NA5` | |
| `displayNameKo` | `THE NEW iX3` | 사이트 히어로 약칭 |
| `displayNameEn` | `THE NEW BMW iX3` | 공식 풀네임에 가깝게 |
| `platform` | `Neue Klasse` | |
| `bodyType` | `SAV` | |

### 파워트레인 vs 트림 (중요)

| 필드 | 넣는 것 | 넣지 말 것 |
|------|---------|------------|
| `markets.kr.powertrain` | 공통 파워트레인 (`50 xDrive`) | 트림 약칭 |
| `trims[].nameKo` | 짧은 트림명 (`SE`, `MSP`, `MSP Pro`) | `50 xDrive SE`처럼 파워트레인 반복 |
| `trims[].nameOfficialKo` | 공식 긴 이름 | — |
| `trims[].wheelKo` | 기본 휠만 | 하이라이트 문장 안에 중복 |
| `trims[].highlightsKo` | 장비·옵션 | 휠(휠은 `wheelKo`) |

UI 트림 표 열: **트림 | 가격 | 하이라이트 | 휠**.

### 제원 필드 → UI 라벨

| JSON | UI 라벨 |
|------|---------|
| `range.koreaCertifiedKm(+Min)` | 주행 가능 거리 |
| `range.wltpKm` | 주행 가능 거리 (WLTP) |
| `performance.accel0to100Sec` | 가속력 (0–100 km/h) |
| `performance.topSpeedKmh` | 안전 최고 속도 |
| `performance.systemKw/Hp` | 최대 출력 |
| `battery.efficiencyKmPerKwh*` | 복합 전비 |
| 전 트림 `priceKrw`·min/max 집계 | 가격대 (최저–최고) |

문서끼리 수치가 다르면 `notesKo` / `sources[].noteKo`에 적고, **국내 출시·상품자료를 우선**.

## 로컬 PDF 참조

`.source-pdfs/README.md`에 파일명만. PDF는 커밋하지 않음. [LEGAL.md](LEGAL.md).

## accessories.json

사이트 섹션명: **액세서리** (필터로 **정품 / 서드파티** 구분).

필수: `id`, `origin`(`oem`|`thirdParty`), `titleKo`, `titleOriginal`, `titleOriginalLang`, `summaryKo`, `category`, `markets[]`, 전용 여부 플래그.

- `origin: "oem"`: BMW 오리지널(정품). `oemPartNumber` 권장·사실상 필수에 가깝게 채움
- `origin: "thirdParty"`: 사제·애프터마켓. `brandKo` 권장, 품번 생략 가능. BMW 공식 품번처럼 보이게 지어내지 않음
- `markets[]`: `country`, `sourceUrl`, `price`, `currency`, `asOf`, 선택 `shopProductId`·`listPrice`·`promoUntil`·`channelKo`
  - 국가: `DE`|`UK`|`NL`|`KR`|`EB`(eBay). 통화: `EUR`|`GBP`|`KRW`
  - 국내 네이버쇼핑 등은 `country: "KR"`, `currency: "KRW"`, `channelKo`에 채널명
  - eBay 리스팅은 `country: "EB"`(UI **eBay**), `channelKo: "eBay"`. 이미 DE/NL 공식 카탈로그에 있는 SKU는 중복 항목을 만들지 않음
- **자동 크롤링 금지.** 검색·개별 URL을 보고 수동 등록. 가격은 스냅샷일·표시 통화 기준

현재 NA5 전용 플래그 필드명: `na5Dedicated`. 다중 차종 시 `dedicated` + 파일 경로의 vehicleId로 일반화.

## 액세서리 이미지

`site/images/accessories/` + JSON `image` 필드. 절차는 해당 README. **없으면 UI에 사진 영역을 만들지 않음**(플레이스홀더 금지).

## tips / reviews / forum / competitors

- `tips.json`: FAQ. 공식 용어 우선, 커뮤니티는 `confidence`·caveat
- `reviews.json`: 시승·리뷰. **`publishedAt` 내림차순**으로 UI 표시. 전문 전사 금지, 짧은 `summaryKo` + URL
  - `priorityChannels[]`: 구독자·품질 기준으로 사용자가 고른 채널 목록을 고정
  - 해당 채널에 차종 영상이 없으면 `sourceNoteKo`에 미확인을 적고 항목을 비움
  - 구형 세대(예: G08 iX3)와 NA5를 섞지 않음
- `news.json`: 국내 뉴스 요약. **`publishedAt` 내림차순**. 전문 전재 금지, `summaryKo` + 원문 `url`
  - 수집: NAVER API HUB **뉴스** 검색(쇼핑 검색은 종료됨). Client Secret은 `secrets/` 로컬만
  - 필터: 출시 이후(NA5는 **2026-08-01** 이후). 질의에 NA5·노이어/노이에 클라세·풀체인지·THE NEW iX3 등 포함
  - 동일 보도 다매체 전재는 대표 1~2건만. 시승·출시·제원·판매를 우선하고 행사·영화 PPL은 소량
- `forum.json`: 해외 포럼(1차: **MOTOR-TALK** `bmw-ix3-neue-klasse-na5-b1240`) 스레드 **메타만**
  - 필드: `titleOriginal`, `titleKo`, `summaryKo`(1~2문장), `url`, `lastActivityAt`, `replies`, `views`, `pinned?`
  - UI: **최신** = `lastActivityAt` 내림차순, **인기** = `replies`(없으면 `views`) 내림차순
  - 본문·닉네임·긴 인용 금지. `scripts/sync-motor-talk.py --html <목록저장.html>` 수동 sync
  - Bimmerpost·네이버 카페 **자동/수동 연동은 하지 않음**(카페는 약관·접근 제한). 국내 토론은 이후 **사이트 자체 포럼**으로 검토(ROADMAP)
  - `syncedAt`·`source.url` 필수
- `competitors`: Phase 2, placeholder 허용

## 액세서리 수집 체크리스트

1. 공식 URL에 해당 차종·세대 표기  
2. 품번  
3. 가격·통화·조회일  
4. 옵션 코드·장착 조건  
5. 한국어 제목·요약(광고 문장 축소, TERMINOLOGY 어조)  
6. `./scripts/sync-data.sh`

## VIN 적합 확인 (로컬만)

[VEHICLE_ONBOARDING](VEHICLE_ONBOARDING.md) 및 secrets README. VIN은 git·공개 JSON에 넣지 않음.
