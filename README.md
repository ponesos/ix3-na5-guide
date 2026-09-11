# 글로벌 EV 노트 (비공식)

수입 전기차 제원·트림·가격·액세서리를 모아 둔 **비공식** 한국어 안내 사이트입니다. BMW 등 공식 채널이 아니며, **국내 브랜드 전기차는 다루지 않습니다.** 첫 차종은 더 뉴 BMW iX3(NA5)입니다.

지금 단계: **정적 HTML + JSON**, 공유는 **GitHub Pages URL**. 자체 웹 서버는 트래픽·실시간 갱신 수요가 생길 때까지 두지 않습니다. 이유는 [docs/ROADMAP.md](docs/ROADMAP.md)를 봅니다.

## 문서 먼저, 코드는 그다음

기능을 넣을 때 순서:

1. `docs/` — 특히 [VEHICLE_ONBOARDING.md](docs/VEHICLE_ONBOARDING.md), REQUIREMENTS, DATA, TERMINOLOGY, UI
2. `schemas/` (필드가 바뀌면)
3. `data/` 수정 → `./scripts/sync-data.sh`
4. `site/` UI
5. 브라우저 확인

| 문서 | 내용 |
|------|------|
| [docs/PRODUCT.md](docs/PRODUCT.md) | 비전, 페르소나, 비목표 |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | 기능·수용 기준 |
| [docs/VEHICLE_ONBOARDING.md](docs/VEHICLE_ONBOARDING.md) | **새 차종 수집·매핑 체크리스트** |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phase 0–4, 서버 이관 트리거 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 폴더, 정적→API |
| [docs/DATA.md](docs/DATA.md) | JSON 규칙·필드 매핑 |
| [docs/TERMINOLOGY.md](docs/TERMINOLOGY.md) | 공식 용어·카피 규칙 |
| [docs/UI.md](docs/UI.md) | 정보 구조·시각 방향 |
| [docs/LEGAL.md](docs/LEGAL.md) | 상표, 요약, 스크래핑 금지 |

## 로컬에서 보기

`site/`를 `file://`로 열면 JSON `fetch`가 막힙니다. **반드시 HTTP**로 엽니다.

저장소 루트에서:

```bash
./scripts/sync-data.sh
npx --yes serve site
```

터미널에 나온 주소(보통 `http://localhost:3000`)를 브라우저에서 엽니다. 처음 열면 **기본 차종(iX3) 모델 정보**가 바로 보입니다. 차종 목록은 내비 **차종**(`vehicles.html`)에서 볼 수 있습니다.

`npx serve`가 환경에서 실패하면 `site/`에서 다음을 씁니다.

```bash
cd site && python3 -m http.server 4173
```

그다음 `http://127.0.0.1:4173/` 을 엽니다.

VS Code/Cursor Live Server를 쓸 때는 **문서 루트를 `site` 폴더**로 지정합니다.

## GitHub Pages 배포

원격 저장소를 만든 뒤:

1. GitHub 저장소 **Settings → Pages**
2. Source: **GitHub Actions** 가 아니라 **Deploy from a branch**
3. Branch: `main` (또는 기본 브랜치), **Folder: `/site`**
   - UI에 `/site`가 없으면 **GitHub Actions** 워크플로로 `site/`를 올리는 방식을 씁니다. 아래 “폴더 옵션이 없을 때”를 참고합니다.
4. 저장 후 `https://<계정>.github.io/<저장소>/` 가 열릴 때까지 1–2분 기다립니다.

프로젝트 사이트(루트가 아닌 하위 경로)에서도 동작하도록 프론트는 **루트 상대가 아닌 상대 경로** `data/...json` 을 사용합니다.

### `/site` 폴더 옵션이 없을 때

일부 계정은 Pages 소스가 저장소 루트 또는 `/docs`만 됩니다. 그때는 `site/` 내용을 루트로 옮기지 말고, 워크플로로 `site`를 배포합니다. 예: 브랜치의 `site/`를 Pages 아티팩트로 업로드.

카페/메신저에는 **Pages URL만** 올립니다. HTML 파일 첨부는 이번 공유 방식에서 쓰지 않습니다.

원격 생성과 `git push`는 이 README에 적혀 있어도, **요청 없이 푸시하지 않습니다.**

## 데이터 수정

원본은 `data/` 입니다. `site/data/`는 복사본이라 직접 고치지 않습니다.

```bash
# 예: 액세서리 항목 추가 후
./scripts/sync-data.sh
```

환율 스냅샷은 `data/meta.json`의 `fx`입니다. 추정 원화는 구매가가 아닙니다.

## 해외 포럼(MOTOR-TALK) 메타 갱신

1차 소스는 [MOTOR-TALK iX3 Neue Klasse NA5](https://www.motor-talk.de/forum/bmw-ix3-neue-klasse-na5-b1240.html)입니다. 본문·닉네임은 저장하지 않고 제목·날짜·댓글·짧은 한글 요약만 `forum.json`에 넣습니다.

1. 위 보드를 브라우저에서 연다  
2. 페이지 저장(HTML만)  
3. 실행:

```bash
python3 scripts/sync-motor-talk.py --html /path/to/saved-forum.html
# 번역 API 없이(기존 한글 유지):  --no-translate
./scripts/sync-data.sh
```

샘플 덤프: `scripts/fixtures/motor-talk-na5-sample.html`

(참고) Bimmerpost·네이버 카페 연동은 하지 않습니다. 국내 토론은 이후 사이트 자체 포럼으로 검토합니다(ROADMAP).

## 액세서리 사진

사진을 `site/images/accessories/`에 넣고, `data/vehicles/na5-ix3/accessories.json`에 `image` 필드를 추가합니다. 자세한 절차는 [site/images/accessories/README.md](site/images/accessories/README.md).

## VIN (로컬만)

실제 VIN은 `secrets/vin.local.json`에만 둡니다 (Git 제외). 공개 사이트·JSON에는 넣지 않습니다. 자세한 규칙은 [secrets/README.md](secrets/README.md), [docs/DATA.md](docs/DATA.md)를 봅니다.

```bash
./scripts/open-accessory-shop.sh
```

## 스택

HTML, CSS, 바닐라 JavaScript. 번들러 없음. Node는 로컬 `npx serve`용으로만 있으면 됩니다.
