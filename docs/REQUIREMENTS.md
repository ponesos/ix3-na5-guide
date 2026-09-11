# 요구사항

최종 수정: 2026-09-09  
관련: [PRODUCT.md](PRODUCT.md), [ROADMAP.md](ROADMAP.md), [UI.md](UI.md), [DATA.md](DATA.md), [TERMINOLOGY.md](TERMINOLOGY.md), [VEHICLE_ONBOARDING.md](VEHICLE_ONBOARDING.md), [LEGAL.md](LEGAL.md)

기능·차종 추가는 **문서(특히 ONBOARDING·DATA·TERMINOLOGY)를 먼저** 고친 뒤 스키마와 코드를 맞춘다.

## 범위

**Must (Phase 0–1)**

- GitHub Pages 정적 사이트 (`site/`)
- 비공식 고지, 데이터 기준일
- 차량 **모델 정보**: 공통 파워트레인, 트림 약칭(SE/MSP…), 가격, 제원, 출처  
  - 트림 표: 트림 | 가격 | 하이라이트 | 휠  
  - 제원 라벨: TERMINOLOGY(주행 가능 거리, 가속력 등)
- **액세서리**: 정품(`oem`)·서드파티(`thirdParty`) 구분. 유럽·국내(KR/네이버쇼핑 등) 링크·가격. 사진 기본 없음
- 정품: 한국어명, 원문명, 품번, 현지가, 추정 KRW(해외), 공식 링크, 장착 조건
- 서드파티: 브랜드, 요약, 국내 표시가·구매 링크. 가짜 BMW 품번 금지
- 네이버쇼핑 등 **개별 URL 수동 등록**만. 검색 결과·카탈로그 자동 수집 없음
- 카테고리·시장 필터
- HTTP로 JSON 로드 (로컬 `python3 -m http.server` 등)
- 데이터는 `data/vehicles/<id>/`에 차종별 적재 (UI는 당분간 단일 차량)

**Should (Phase 2)**

- 동급 비교 표
- 시승기 카드(링크+짧은 요약)
- 다중 차량 목록·라우팅

**Could (Phase 3+)**

- 환율 자동, 검색, 댓글 → 서버 검토

**Won’t (현재)**

- 대리 구매, VIN 공개 API, 스크래퍼, 공식 사진 무단 재호스팅, 앱 스토어

## 정보 우선순위

1. 해당 세대 전용 정품 액세서리  
2. 국내 제원·트림·가격  
3. 시승기 요약  
4. 동급 비교  
5. FAQ·운용 팁  

## 수용 기준 — 모델 정보

- `powertrain`과 `trims[].nameKo`가 분리되어 있다.
- 각 트림에 `nameKo`, 가능하면 `nameOfficialKo`, `wheelKo`(해당 시), 가격·세율 조건이 있다.
- 국내 인증 거리와 WLTP를 구분한다.
- 출처가 있다.
- 카피가 TERMINOLOGY 어조를 만족한다.

## 수용 기준 — 정품 액세서리

- `oemPartNumber`, `markets[].sourceUrl`, `asOf` 필수.
- 원화는 추정 + 환율 기준일.
- 국내 판매가·재고 아님 고지.
- 타 세대 부품 혼입 없음.
- 사진 플레이스홀더를 두지 않는다.

## 새 차종 수용

[VEHICLE_ONBOARDING.md](VEHICLE_ONBOARDING.md) 체크리스트를 모두 통과해야 “추가 완료”로 본다.

## 비교군 (제안)

Tesla Model Y, Genesis GV60, Mercedes-Benz EQE SUV, Audi Q6 e-tron, Porsche Macan Electric, Hyundai Ioniq 5.

축: 국내 가격대, 주행 가능 거리, 급속·800V, 전장·적재, 구동.

## 품질

- 모바일 ~375px에서 내비·표·필터가 사용 가능하다.
- JSON은 DATA·스키마를 따른다.
- UI 구조 변경은 UI.md + ONBOARDING에 반영 후 구현한다.
