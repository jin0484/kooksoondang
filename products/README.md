/* Products motion add-on
 * products.css 다음에 불러오세요.
 */

.products_hero,
.products_hero_stage,
.starter_kit {
  overflow: clip;
}

.products_hero_inner,
.products_hero_stage {
  transform-origin: 50% 50%;
  will-change: transform;
}

.hero_splash {
  transform-origin: 50% 55%;
  will-change: transform, opacity;
}

.products_content_layer {
  position: relative;
  z-index: 5;
  will-change: transform;
}

.products_hero_dim {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: #000;
  opacity: 0;
  pointer-events: none;
}

.starter_kit_inner {
  min-height: min(78svh, 760px);
}

.starter_kit_copy,
.starter_kit_list,
.starter_kit_card,
.starter_kit_best {
  will-change: transform, opacity;
}

/* JS가 준비되기 전에는 원래 콘텐츠를 그대로 보여 줍니다. */
.has-motion .starter_kit_title,
.has-motion .starter_kit_desc,
.has-motion .starter_kit_cta,
.has-motion .starter_kit_character,
.has-motion .starter_kit_card,
.has-motion .starter_kit_best {
  visibility: hidden;
}

@media (max-width: 80rem) {
  .starter_kit_inner {
    min-height: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .has-motion .starter_kit_title,
  .has-motion .starter_kit_desc,
  .has-motion .starter_kit_cta,
  .has-motion .starter_kit_character,
  .has-motion .starter_kit_card,
  .has-motion .starter_kit_best {
    visibility: visible;
  }
}

# Products motion 적용 방법

기존 `products.css`와 `products.js`는 그대로 두고 아래 두 줄만 추가합니다.

`<head>`에서 기존 `products.css` 바로 다음:

```html
<link rel="stylesheet" href="./products-motion.css">
```

`</body>` 직전 또는 기존 `products.js` 바로 다음:

```html
<script src="./products-motion.js" defer></script>
```

`products-motion.js`에는 Starter Kit 등장 애니메이션이 포함되어 있습니다. 첨부된 기존 `products.js`의 Hero 인트로와 고정 확대/커버 전환 코드는 그대로 사용합니다.

## 구현된 타이밍

- 섹션 내부가 뷰포트의 약 80% 지점에 진입하면 1회 재생
- 제목 → 설명 → 버튼 순서로 아래에서 부드럽게 등장
- 버튼은 회전과 탄성이 섞인 팝업 모션
- 나머지 카드가 딸기 카드 뒤에 겹쳐 있다가 오른쪽으로 빠르게 펼쳐짐
- 마지막에 `BEST` 도장이 찍히며 카드 묶음이 살짝 흔들림
- 전체 약 0.98초
- 데스크톱, 태블릿, 모바일 공통 적용
- `prefers-reduced-motion` 환경에서는 애니메이션 없이 즉시 노출