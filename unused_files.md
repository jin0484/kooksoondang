# 안 쓰는 파일·코드 정리 목록

작업하면서 더 이상 쓰지 않게 된 것과, 프로젝트 전체를 훑어서 어디에서도 불러오지 않는 것을 모았습니다.
**`product_detail/` 폴더 안의 안 쓰는 파일 27개만 `product_detail/_unused/` 로 옮겼습니다(지우지 않음).** 다른 폴더의 파일은 모두 그대로 두었습니다.
`product_detail/_unused/` 안에 원래 폴더 구조 그대로 들어 있어서, 되살리려면 그 경로를 `product_detail/` 밑으로 되돌리면 됩니다.
(예: `product_detail/_unused/draft.js` → `product_detail/draft.js`)

아래 2~3번 목록 중 `product_detail/` 밖의 것(`asset/`, `test/`, `pairing/`, `products/`, `tmp/`, `yultest/`, `main/_cachebust_tmp.html` 등)은 **목록으로만 남기고 옮기지 않았습니다.**

옮긴 것: `draft.js`, `draft_backup.*`, `draft copy.html`, `rice.html`, `test_product_detail.html`, `loading.*`, `rice_loading.*`(빈 파일), `product_detail.*`(빈 파일·PDF), `product_detail_asset/` 의 쓰지 않는 아이콘·이미지 10개.
옮기지 않고 남긴 것(product_detail 안): `products_detail.html`, `test.html`(이름이 겹쳐 확인이 부정확).

확인 방법: 모든 `.html` `.css` `.js` `.json` 안에서 파일 이름이 한 번도 나오지 않으면 "참조 없음"으로 봤습니다.
(이미지 이름을 코드에서 조립해서 불러오는 경우는 이름이 코드에 들어 있으므로 "쓰는 것"으로 남겼습니다.
예: 페어링의 음식·음료·아이콘 이미지 40개는 `pairing.js` 가 이름으로 불러와서 목록에서 뺐습니다.)

---

## 1. 이번 수정으로 안 쓰게 된 것

### 제품 상세(`product_detail/`) 3D 병 제거로
| 대상 | 내용 |
|---|---|
| `product_detail/draft.js` (약 2,360줄) | three.js 3D 병 + 스크롤 연출. `draft.html` 이 더 이상 불러오지 않음. 파일은 그대로 남겨 둠 |
| `product_detail/draft_backup.js`, `.css`, `.html` | 3D 시절의 백업본. 어디에서도 불러오지 않음 |
| `draft.css` 의 `#scene` (68줄 근처) | 3D 캔버스 스타일. 캔버스를 지웠으므로 불필요 |
| `draft.css` 의 `.product_hero_bottle_area` (126줄 근처) | 3D 병이 들어가던 빈 영역. 지금은 빈 칸으로 남아 여백만 차지함 |
| `draft.css` 1179줄 근처 주석 | "fixed Three.js canvas" 설명. 의미 없어진 주석 |
| `draft.html` 의 `THREE.JS BOTTLE AREA` 주석 / `.more_products` 위 260px | 병이 내려앉을 자리로 잡아 둔 값. 3D 가 없으니 여백으로만 남음 |
| 초록 `LOADING` 화면(`#loader`) | 3D 를 기다리던 용도라 HTML·CSS·JS 에서 모두 지움 (이미 삭제됨) |

### 메인 이벤트 병 물들기 변경으로
| 대상 | 내용 |
|---|---|
| `main/main.js` 의 `--event-bottle-color` (1854, 1936줄 근처) | 병이 물드는 방식을 색 변경에서 채움(`--event-bottle-fill`)으로 바꿔서, 이 값을 읽는 CSS 가 없어짐. 계속 값만 넣고 있음 |
| `main/main.css` 3263줄 근처 `--event-bottle-color: var(--kooksoondang_orange)` | 위와 같은 이유로 의미 없음 (모바일 3번째 장은 `--event-bottle-fill: 1` 이 대신함) |

---

## 2. 어디에서도 불러오지 않는 이미지·아이콘 (확실)

용량이 큰 것 위주로 먼저 보세요. 합계는 약 **50MB** 입니다.

### 용량이 큰 것
| 파일 | 크기 |
|---|---|
| `asset/img/brandstory1_1.png` ~ `brandstory4_1.png` (4개) | 약 25MB (`brandstory1~4.png` 는 쓰는 중, `_1` 이 붙은 것만 안 씀) |
| `test/test_asset/` 의 손·하이·주먹·술병 캐릭터 PNG 19개 | 약 11MB |
| `test/test_asset/Pyeongmin_*.png`, `Yangban_*.png` (7개) | 약 5.6MB |
| `tmp/previous_research-1.png` | 약 3MB |
| `product_detail/product_detail_asset/img/renew.png` | 약 1.9MB |
| `pairing/pairing_asset/img/food/figma/` 의 피자·카레 3개 | 약 3MB |

### 전체 목록 (55개)
```
aboutbrand/aboutbrand_asset/icon/brand_story_cup.svg
asset/icon/divider_line.svg
asset/icon/drink_bg_1.svg   drink_bg_2.svg   drink_bg_3.svg   drink_bg_4.svg
asset/icon/ellipse_bottle_shadow.svg
asset/icon/trans_00.svg
asset/img/brandstory1_1.png  brandstory2_1.png  brandstory3_1.png  brandstory4_1.png
pairing/pairing_asset/img/food/DubuKimchi.jpg
pairing/pairing_asset/img/food/figma/popular_margherita_pizza.png
pairing/pairing_asset/img/food/figma/world_margherita_pizza.png
pairing/pairing_asset/img/food/figma/world_thai_green_curry.png
pairing/pairing_asset/img/result/prebiotics_can.png
product_detail/product_detail_asset/icon/deco11.svg ~ deco16.svg   (6개)
product_detail/product_detail_asset/icon/renewal.svg
product_detail/product_detail_asset/icon/Vector1-1.svg
product_detail/product_detail_asset/img/renew.png
products/products_asset/img/테스트2 1.png
test/test_asset/ 손·하이·주먹·술병 캐릭터 PNG 19개 (예: 하이_웃는 4.png, 주먹쥔_화난 1.png …)
test/test_asset/Pyeongmin_1.png  Pyeongmin_2.png  Pyeongmin_solo.png  Pyeongmin_with.png
test/test_asset/Yangban_1.png    Yangban_2.png    Yangban_solo.png    Yangban_with.png
tmp/previous_research-1.png
```

---

## 3. 어디에서도 링크되지 않는 페이지·파일

페이지(`.html`)는 주소로 직접 열 수 있어서 "안 쓴다"고 단정하기 어렵습니다. 지울지는 직접 판단하세요.

| 파일 | 상태 |
|---|---|
| `product_detail/draft copy.html` | 복사본. 참조 없음 |
| `product_detail/draft_backup.html` / `.css` / `.js` | 백업본. 참조 없음 |
| `product_detail/rice.html` | 참조 없음 |
| `product_detail/products_detail.html` | 참조 없음. 제품 목록은 `draft.html` 로 이동함 |
| `product_detail/test_product_detail.html` | 약 2.2MB, 참조 없음 |
| `product_detail/loading.html` / `.css` / `.js` | 로딩 페이지. 서로만 참조하고 어디서도 이동해 오지 않음 |
| `product_detail/rice_loading.html` / `.css` / `.js` | 파일 크기 0KB (빈 파일) |
| `product_detail/product_detail.html` / `.css` / `.js` | 파일 크기 0KB (빈 파일) |
| `product_detail/product_detail.pdf` | 약 1MB, 시안 PDF 로 보임 |
| `products/product_list_mobile.pdf`, `product_list_tablet.pdf` | 각 약 8.4MB, 시안 PDF 로 보임 |
| `main/_cachebust_tmp.html` | 이름 그대로 캐시 확인용 임시 파일. `main.html` 의 복사본 |
| `common/default.html` | 공통 헤더·푸터 틀. 어디에서도 불러오지 않지만, 공통 스타일 확인용으로 쓰고 있었음 |
| `yultest/kook.html`, `yultest/img/` | 테스트용 폴더 |
| `design-analysis.md` (루트), `products/*.md`, `products/README.md`, `aboutbrand/aboutbrand_asset/md/*.txt` | 작업 메모. 사이트에서는 쓰지 않음 |

> `product_detail/test.html` 과 `test/test.html` 은 이름이 "test" 여서 다른 파일의 링크와 이름이 겹쳐 확인이 정확하지 않았습니다.
> 지우기 전에 주소창에서 직접 열어 보세요.

---

## 4. 지우기 전 추천 순서

1. **용량이 큰 이미지부터**: 2번 목록의 `brandstory*_1.png`(25MB), `tmp/`(3MB), `test/test_asset` 안 쓰는 캐릭터. 사이트 속도와 저장소 용량에 가장 도움이 됩니다.
2. **3D 잔재**: `draft.js`, `draft_backup.*`, `draft copy.html`, `draft.css` 의 `#scene` 과 `.product_hero_bottle_area`.
3. **0KB 빈 파일**: `rice_loading.*`, `product_detail.*`.
4. **PDF·메모**: 지금 시안으로 쓰지 않는다면.

바로 지우기가 불안하면 `_unused/` 같은 새 폴더를 만들어 그 안에 옮겨 두고 며칠 써 본 뒤 지우면 됩니다.
(옮기면 경로가 바뀌므로, 이 문서의 파일 중 다른 파일이 불러오는 것이 없는 것만 옮기는 것이 안전합니다.)
