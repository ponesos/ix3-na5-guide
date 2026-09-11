# UI · 정보 구조

최종 수정: 2026-09-11

용어·카피: [TERMINOLOGY.md](./TERMINOLOGY.md)  
데이터·매핑: [DATA.md](./DATA.md), [VEHICLE_ONBOARDING.md](./VEHICLE_ONBOARDING.md)

## 목표

모바일에서 공유 링크를 열었을 때 **3탭 안**에 제원·가격·부품번호·FAQ에 도달한다.

## 사이트맵

| 경로 | 내비 라벨 | 내용 |
|------|-----------|------|
| `index.html` / `index.html?v=` | 모델 정보 | 제원·트림·가격 (**기본 진입**, defaultVehicleId=iX3) |
| `vehicles.html` | 차종 | 차종 허브(카드 목록) |
| `model.html?v=` | (리다이렉트) | `index.html?v=`로 이동 |
| `accessories.html?v=` | 액세서리 | 정품·서드파티 |
| `tips.html?v=` | FAQ | 질문 요약 |
| `compare.html?v=` | 비교 | 준비 중 |
| `reviews.html?v=` | 시승기 | 유튜브 카드 |
| `news.html?v=` | 뉴스 | 국내 보도 요약·원문 링크 |
| `community.html?v=` | 커뮤니티 | 해외 포럼 메타(최신/인기) |

헤더: 사이트명 · 비공식 · 데이터 기준일 · **현재 차종**(1대면 표시, 2대 이상이면 전환).  
섹션 URL은 `?v=<vehicleId>`를 유지한다. 잘못된 id는 `vehicles.json`의 `defaultVehicleId`로 폴백.

## 시각 방향

- 다크 히어로 + 라이트 본문
- Pretendard. 공식 전용 서체·로고 미사용
- 액센트 블루는 CI 복제가 아닌 가독용
- 알약형 과다·크림/퍼플 테마 금지
- 액세서리: **사진 영역 없음**(링크·가격 중심). 허가 사진만 예외. 필터로 정품/서드파티 구분
- 허브: 차종 카드 그리드. 브랜드 히어로 + 카드 목록

## 모델 정보 (전 차종 동일 패턴)

1. 히어로: `displayNameKo` + 킥커(`모델 · codeName · powertrain`) + 한 줄 소개  
2. 통계 4칸: **가격대**(최저–최고) / 주행 가능 거리 / WLTP / 가속력  
3. 트림 표 열: **트림 | 가격 | 하이라이트 | 휠**  
   - 트림 셀: `nameKo` 강조, `nameOfficialKo` 보조  
   - 상단 안내: `{powertrain} 공통 사양 · 트림은 …`  
4. 주요 제원 · 출처  

## 페이지별 노트

- 시승기: `reviews.json` **게재일 최신순**. 채널·날짜·짧은 요약·영상 링크.
- 뉴스: `news.json` **게재일 최신순**. 매체·날짜·짧은 요약·원문 링크. 전문 전재 금지.
- 커뮤니티: 포럼 메타만. 본문·닉네임 금지.
- 네이버쇼핑 등은 개별 URL만 수동 등록. 검색 결과 페이지 일괄 수집 없음.
- 섹션 JSON이 없으면 “아직 준비 중” empty 상태.
