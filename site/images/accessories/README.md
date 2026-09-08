# 액세서리 이미지

GitHub Pages가 서빙하는 정적 파일입니다. JSON의 `image.src`는 **`site/` 기준 상대 경로**입니다.

## 넣는 방법

1. 사진을 `site/images/accessories/`에 복사합니다.  
   권장 이름: `액세서리-id.jpg` (예: `panorama-roof-shade.jpg`)  
   권장 형식: JPG/WebP, 긴 변 1200px 전후, 파일당 300KB 이하
2. `data/vehicles/na5-ix3/accessories.json` 해당 항목에:

```json
"image": {
  "src": "images/accessories/panorama-roof-shade.jpg",
  "altKo": "파노라마 루프 차양 실물",
  "credit": "owner",
  "creditKo": "오너 촬영"
}
```

3. `./scripts/sync-data.sh` (JSON만 동기화; 이미지는 이미 `site/`에 있음)
4. 로컬에서 액세서리 페이지 확인 후 커밋·배포

Finder에서 파일을 이 폴더로 끌어다 넣으면 됩니다. 별도 업로드 서버는 없습니다.

## 출처 규칙 (중요)

| credit | 의미 |
|--------|------|
| `owner` | 본인이 촬영한 실물·장착 사진 (권장) |
| `contributor` | 제보자가 제공·사용 허락한 사진 |
| `licensed` | 사용 허가·라이선스가 명확한 자료 |
| `placeholder` | 임시 자리표시 |

**하지 말 것:** BMW 공식몰/카탈로그 사진을 다운로드해 올리기, CDN URL 핫링크, 딜러 교육 PDF 캡처 재배포.

이미지가 없으면 카드에 회색 플레이스홀더만 보입니다.
