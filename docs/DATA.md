# 데이터

최종 수정: 2026-09-08  
스키마 파일: `schemas/*.schema.json`

## 원본과 배포본

| 위치 | 용도 |
|------|------|
| `data/` | 사람이 편집하는 원본 |
| `site/data/` | Pages가 서빙. **직접 편집하지 않음** |

```bash
./scripts/sync-data.sh
```

## 공통 규칙

- 날짜는 `YYYY-MM-DD`
- 금액은 숫자 + `currency` (`EUR` | `GBP` | `KRW`)
- 출처 있는 사실에는 `sourceUrl` 또는 `sources[]`
- 추측은 `confidence`: `confirmed` | `inferred` | `unverified`
- 구형 iX3(G08)와 NA5를 섞지 않음

## meta.json

사이트명, `updatedAt`, 환율 스냅샷.

```json
"fx": {
  "eurKrw": 1563.3,
  "gbpKrw": 1813.3,
  "asOf": "2026-09-08",
  "source": "설명",
  "sourceUrl": "https://..."
}
```

`eurKrw`와 `gbpKrw`의 기준일이 다르면 필드별로 `eurKrwAsOf`를 써도 된다. 없으면 `fx.asOf`를 쓴다.

## vehicle.json

- `id`: `na5-ix3`
- `codeName`: `NA5`
- `markets.kr`: 트림, 가격(개소세 조건), 제원, 색상, 출처
- 항속은 `range.koreaCertifiedKm` / `koreaCertifiedKmMin` / `wltpKm`를 구분
- 치수·배터리·적재는 `dimensionsMm`, `battery`, `cargo`에 둔다
- 문서끼리 수치가 다르면 `notesKo` 또는 `sources[].noteKo`에 차이를 적고, 국내 교육·출시 자료 우선

## 로컬 PDF 참조

`.source-pdfs/README.md`에 파일명만 적고, PDF 자체는 커밋하지 않는다.

## accessories.json

항목 필수:

- `id` (슬러그)
- `oemPartNumber`
- `titleKo`, `titleOriginal`, `titleOriginalLang` (`de` | `en`)
- `summaryKo`
- `category`: `interior` | `cargo` | `charging` | `wheels` | `exterior` | `other`
- `markets[]`: `country` (`DE` | `UK`), `sourceUrl`, `price`, `currency`, `asOf`, `shopProductId`(있으면)
- `fitmentNotes` (예: SA 408 파노라마)
- `na5Dedicated`: NA5 전용으로 확인되면 `true`

UK에 같은 품번이 아직 없으면 DE만 넣는다. 빈 가격으로 채우지 않는다.

## 액세서리 이미지

이미지는 JSON이 아니라 **`site/images/accessories/`** 에 둡니다 (Pages가 그대로 서빙).

```json
"image": {
  "src": "images/accessories/<id>.jpg",
  "altKo": "짧은 설명",
  "credit": "owner",
  "creditKo": "오너 촬영"
}
```

`credit`: `owner` | `contributor` | `licensed` | `placeholder`  
절차는 [site/images/accessories/README.md](../site/images/accessories/README.md). BMW 공식 사진 무단 복제·핫링크는 금지.

## reviews.json / competitors.json / tips.json

- `tips.json`: 오너 FAQ. `status: "ready"` 이면 `site/tips.html`에 표시.
- 항목: `category`, `questionKo`, `answerKo`, `confidence`(`community` 등), 선택 `caveatKo`
- 채팅 원본·닉네임은 넣지 않는다.

`reviews` / `competitors` 는 Phase 2. 빈 배열과 `status: "placeholder"` 허용.

## 액세서리 수집 체크리스트

1. 공식 URL 제목에 iX3 **(NA5)** 또는 동등 표기가 있는가  
2. 품번 11자리(또는 BMW가 표시한 형식)  
3. 가격·통화·조회일  
4. 옵션 코드·장착 조건  
5. 한국어 제목·2~4문장 요약 (의역, 광고 문장 축소)  
6. `./scripts/sync-data.sh`

## VIN으로 적합 확인 (로컬만)

독일 액세서리 허브: [BMW.de Zubehör](https://www.bmw.de/de/shop/ls/cp/physical-goods/de-BF_ACCESSORY)

일부 상품은 VIN 입력 후에야 내 차에 맞는지 알 수 있다.

1. `cp secrets/vin.local.example.json secrets/vin.local.json` 후 VIN 기입  
2. `./scripts/open-accessory-shop.sh` 로 공식몰을 연다 (스크립트는 VIN을 출력하지 않음)  
3. 브라우저에서 **Fahrzeug hinzufügen → VIN → Fortfahren**  
4. 확인된 항목만 `accessories.json`에 기록 (**VIN 문자열은 JSON에 넣지 않음**)  
5. 필요하면 `fitmentNotes`에 “로컬에서 VIN 적합 확인” 정도만 적는다

### 알려진 한계 (2026-09-08)

한국 인도 NA5 VIN을 **bmw.de** 임시 차량 등록에 넣으면 ConnectedDrive 쪽 **“Das Fahrzeug wurde nicht gefunden”(차량을 찾을 수 없음)** 이 날 수 있다. 시장/ConnectedDrive 등록 범위 문제로 보이며, 이 경우:

- 제목에 **iX3 (NA5)** 가 명시된 공식 상품은 VIN 없이 카탈로그에 넣는다  
- 공용 부품·적합성 애매한 항목은 한국 딜러 VIN 조회를 안내한다  
- 영국 등 다른 시장 샵은 별도 확인  
