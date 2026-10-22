/* =========================================================
   제품 넘기기 (좌우 화살표) — 회전 테이블처럼

   히어로의 "병 + 글" 한 장(.pd_slide)이 통째로 옆으로 돌아 넘어가고,
   다음 제품이 반대편에서 같은 방식으로 돌아 들어옴.
   양옆의 흐린 병은 바로 앞·뒤 제품. 순서는 둥글게 이어짐.

   ※ Draft 말고는 설명 글과 ABV·용량을 모르는 상태라 임시 문구로 채워 둠
      (meta 가 null 이면 그 줄을 숨김. 지금은 모든 제품에 임시값을 넣어 켜 둠). 실제 문구가 정해지면 PRODUCTS 만 고치면 됨.
   ※ crop 은 Figma 시안에서 큰 그림(1200x1800)의 일부만 잘라 쓴 값(left, top, width, height: %)
========================================================= */

(() => {
    const product = document.querySelector('[data-pd-product]');
    const firstSlide = product && product.querySelector('[data-pd-slide]');
    if (!firstSlide) return;

    const banner = document.querySelector('.pd_banner');
    const prevBtn = document.querySelector('[data-pd-prev]');
    const nextBtn = document.querySelector('[data-pd-next]');
    const sides = {
        prev: document.querySelector('[data-pd-side="prev"]'),
        next: document.querySelector('[data-pd-side="next"]'),
    };
    if (!prevBtn || !nextBtn) return;

    const IMG = './product_detail_asset/new/';

    // 순서: 가운데가 Draft 일 때 왼쪽 Chestnut, 오른쪽 Banana (시안과 같음)
    const PRODUCTS = [
        {
            slug: 'draft',
            tone: '#2C8B62', // 상품 목록 카드의 배경색
            name: 'Original Makgeolli',
            img: IMG + 'draft_bottle.png',
            crop: [-67.55, -3.59, 227.7, 105.94],
            desc: 'Kooksoondang Original Draft Makgeolli pairs the soft sweetness of rice with gentle fruity notes reminiscent of banana and melon. Live yeast creates a light fizz that tickles the tongue, while a mild tang keeps it easy to enjoy, even for first-timers. It goes down creamy yet light, finishing clean with a subtle, nutty hint of rice.',
            meta: ['ABV: 6%', 'Volume: 500ml'],
        },
        {
            slug: 'banana',
            tone: '#F2D757', // 상품 목록 카드의 배경색
            name: 'Banana Makgeolli',
            img: IMG + 'banana.png',
            crop: [-62.94, -1.72, 223.46, 103.45],
            desc: 'Kooksoondang Banana Makgeolli blends the soft sweetness of rice with the ripe, mellow aroma of banana. Its texture is creamy and smooth, with a gentle fizz that keeps every sip light and easy to enjoy. The fruit note stays soft rather than sharp, fading into a clean, rounded finish that makes it a friendly first choice for anyone new to makgeolli.',
            meta: ['ABV: 6%', 'Volume: 500ml'], // 임시값(Draft 와 같음). 제품별 실제 값이 정해지면 교체
        },
        {
            slug: 'peach',
            tone: '#F5B4C1', // 상품 목록 카드의 배경색
            name: 'Peach Makgeolli',
            img: IMG + 'peach.png',
            crop: [-62.94, -1.79, 223.46, 103.93],
            desc: 'Kooksoondang Peach Makgeolli pairs the gentle sweetness of rice with the juicy fragrance of ripe peach. A light fizz lifts the aroma on the first sip, while a soft, creamy body keeps the flavor smooth and rounded. It finishes clean and refreshing, with a lingering hint of fruit that makes it easy to enjoy chilled at any time of day.',
            meta: ['ABV: 6%', 'Volume: 500ml'], // 임시값(Draft 와 같음). 제품별 실제 값이 정해지면 교체
        },
        {
            slug: 'whitegrape',
            tone: '#B3C643', // 상품 목록 카드의 배경색
            name: 'White Grape Makgeolli',
            img: IMG + 'white_grape.png',
            crop: [-61.76, -1.79, 220.59, 103.93],
            desc: 'Kooksoondang White Grape Makgeolli brings the crisp, refreshing character of fresh grape to the soft sweetness of rice. A light fizz adds a lively sparkle, and the bright fruit note keeps every sip clean and easy to drink. It finishes crisp with a subtle sweetness, making it a refreshing companion for light dishes and relaxed gatherings.',
            meta: ['ABV: 6%', 'Volume: 500ml'], // 임시값(Draft 와 같음). 제품별 실제 값이 정해지면 교체
        },
        {
            slug: 'strawberry',
            tone: '#F28E8E', // 상품 목록 카드의 배경색
            name: 'Strawberry Makgeolli',
            img: IMG + 'strawberry.png',
            crop: [-62.64, -1.72, 223.05, 103.45],
            desc: 'Kooksoondang Strawberry Makgeolli combines the sweet-tangy taste of ripe strawberry with the creamy softness of rice. A gentle fizz brightens the first sip, while the fruit keeps its fresh, playful tang all the way through. It goes down smooth and light, finishing with a sweet, berry-like note that makes it a joyful choice for any occasion.',
            meta: ['ABV: 6%', 'Volume: 500ml'], // 임시값(Draft 와 같음). 제품별 실제 값이 정해지면 교체
        },
        {
            slug: 'rice',
            tone: '#B0916E', // 상품 목록 카드의 배경색
            name: 'Rice Makgeolli',
            img: IMG + 'rice.png',
            crop: [-64.62, -2.63, 223.46, 105.2],
            desc: 'Kooksoondang Rice Makgeolli is a smooth, authentic makgeolli made with carefully selected rice and nuruk. Its flavor is simple and honest, with the natural sweetness of rice and a soft, mild tang that never feels heavy. Vegan and gently sparkling, it finishes clean with a subtle, nutty hint of rice that lingers pleasantly on the palate.',
            meta: ['ABV: 6%', 'Volume: 500ml'], // 임시값(Draft 와 같음). 제품별 실제 값이 정해지면 교체
        },
        {
            slug: 'prebiotics',
            tone: '#272625', // warm black (bekseju_darker_warm). 카드 색(#FBF7F2)은 너무 밝아 배너에는 쓰지 않음
            name: '100 Billion Prebiotics',
            img: IMG + 'prebiotics.png',
            crop: [-63.38, -1.84, 223.05, 103.69],
            desc: 'Kooksoondang 100 Billion Prebiotics Makgeolli is made with rice and nuruk for a clean, balanced taste. The natural sweetness of rice meets the gentle depth of nuruk, creating a smooth body that is light on the palate. Vegan and easy to drink, it finishes cleanly and quietly, making it a comfortable everyday makgeolli to enjoy at your own pace.',
            meta: ['ABV: 6%', 'Volume: 500ml'], // 임시값(Draft 와 같음). 제품별 실제 값이 정해지면 교체
        },
        {
            slug: 'chestnut',
            tone: '#845C42', // 상품 목록 카드의 배경색
            name: 'Chestnut Makgeolli',
            img: IMG + 'chestnut.png',
            crop: [-61.58, -1.72, 220.59, 103.45],
            desc: 'Kooksoondang Chestnut Makgeolli wraps the rich, nutty sweetness of chestnut in the creamy softness of rice. A gentle fizz opens the flavor, and the warm, toasty note settles into a smooth, mellow body. It finishes with a lingering nutty depth that makes it a comforting choice, especially on cooler days or alongside savory dishes.',
            meta: ['ABV: 6%', 'Volume: 500ml'], // 임시값(Draft 와 같음). 제품별 실제 값이 정해지면 교체
        },
    ];

    const count = PRODUCTS.length;
    // 상품 목록에서 누른 제품으로 시작: draft.html?product=banana
    const wanted = new URLSearchParams(location.search).get('product');
    const found = PRODUCTS.findIndex((p) => p.slug === wanted);
    let index = found >= 0 ? found : 0; // 값이 없거나 모르는 제품이면 Original(Draft)
    let busy = false;

    const wrap = (i) => (i + count) % count;

    // 제품 색으로 글자와 장식을 칠함. 밝은 색(바나나 등)은 흰 바탕에서 글씨가 안 보이므로
    // 글자용 색(--ink)만 읽을 수 있을 때까지 어둡게 섞음
    const lum = ([r, g, b]) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const BG = lum([250, 248, 247]);
    const inkFor = (hex) => {
        const rgb = toRgb(hex);
        const dark = [35, 35, 35];
        for (let t = 0; t <= 1.0001; t += 0.05) {
            const mix = rgb.map((v, i) => Math.round(v * (1 - t) + dark[i] * t));
            if ((BG + 0.05) / (lum(mix) + 0.05) >= 4) return 'rgb(' + mix.join(',') + ')';
        }
        return 'rgb(35,35,35)';
    };
    const tint = (el, p) => {
        el.style.setProperty('--tone', p.tone);
        el.style.setProperty('--ink', inkFor(p.tone));
    };

    const setCrop = (img, crop) => {
        img.classList.toggle('is_plain', !crop);

        if (!crop) {
            ['left', 'top', 'width', 'height'].forEach((k) => img.style.removeProperty(k));
            return;
        }

        img.style.left = crop[0] + '%';
        img.style.top = crop[1] + '%';
        img.style.width = crop[2] + '%';
        img.style.height = crop[3] + '%';
    };

    // 슬라이드 한 장(병 + 글) 만들기. 모양은 HTML 에 처음부터 들어 있는 Draft 슬라이드와 같음
    const buildSlide = (p) => {
        const slide = document.createElement('div');
        slide.className = 'pd_slide';
        slide.setAttribute('data-pd-slide', '');
        slide.innerHTML =
            '<span class="pd_slide_deco" style="--x:1045;--y:500;--w:90;--h:300;--mask:url(' + IMG + 'pet.svg)" aria-hidden="true"></span>' +
            '<span class="pd_slide_deco pd_slide_deco_can" style="--x:940;--y:664;--w:71;--h:136;--mask:url(' + IMG + 'union.svg)" aria-hidden="true"></span>' +
            '<div class="pd_product_bottle"><img alt=""></div>' +
            '<div class="pd_product_copy">' +
                '<div class="pd_product_head">' +
                    '<p class="pd_product_brand">Kooksoondang</p>' +
                    '<h1 class="pd_product_title"></h1>' +
                '</div>' +
                '<div class="pd_product_body">' +
                    '<p class="pd_product_desc"></p>' +
                    '<p class="pd_product_meta"></p>' +
                '</div>' +
            '</div>';

        tint(slide, p);

        const img = slide.querySelector('.pd_product_bottle img');
        img.src = p.img;
        img.alt = p.name + ' bottle';
        setCrop(img, p.crop);

        slide.querySelector('.pd_product_title').textContent = p.name;
        slide.querySelector('.pd_product_desc').textContent = p.desc;

        const meta = slide.querySelector('.pd_product_meta');
        meta.hidden = !p.meta;
        meta.innerHTML = p.meta ? p.meta.map((t) => '<span>' + t + '</span>').join('') : '';

        return slide;
    };

    const paintSides = () => {
        [['prev', -1], ['next', 1]].forEach(([key, dir]) => {
            const p = PRODUCTS[wrap(index + dir)];
            const img = sides[key].querySelector('img');
            img.src = p.img;
            setCrop(img, p.crop);
        });
    };

    // 배너 배경색을 제품 색으로 (CSS 가 색이 서서히 바뀌게 함)
    const paintTone = (i) => {
        if (banner) banner.style.setProperty('--pd-tone', PRODUCTS[i].tone);
    };

    const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 회전 테이블: 현재 슬라이드는 한쪽으로 돌아 나가고, 다음 슬라이드는 반대쪽에서 돌아 들어옴
    const ANGLE = 42; // 돌아 나가는 각도(도)
    const DURATION = 900;
    const EASING = 'cubic-bezier(0.65, 0, 0.25, 1)';

    const go = (dir) => {
        if (busy) return;
        busy = true;

        const current = product.querySelector('[data-pd-slide]');
        const nextIndex = wrap(index + dir);
        const incoming = buildSlide(PRODUCTS[nextIndex]);
        product.appendChild(incoming);

        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            current.remove();
            index = nextIndex;
            paintSides();
            sides.prev.classList.remove('is_out');
            sides.next.classList.remove('is_out');
            busy = false;
        };

        if (reduce() || !current.animate) {
            paintTone(nextIndex);
            finish();
            return;
        }

        // dir > 0(다음): 현재는 왼쪽으로, 다음은 오른쪽에서. dir < 0 은 반대
        paintTone(nextIndex);

        const out = -dir * ANGLE;
        const inn = dir * ANGLE;

        sides.prev.classList.add('is_out');
        sides.next.classList.add('is_out');

        const opts = { duration: DURATION, easing: EASING, fill: 'both' };

        current.animate([
            { transform: 'rotateY(0deg)', opacity: 1 },
            { transform: `rotateY(${out}deg)`, opacity: 0 },
        ], opts);

        const anim = incoming.animate([
            { transform: `rotateY(${inn}deg)`, opacity: 0 },
            { transform: 'rotateY(0deg)', opacity: 1 },
        ], opts);

        anim.onfinish = finish;
        anim.oncancel = finish;
        // 탭이 백그라운드라 애니메이션 이벤트가 오지 않아도 멈춰 있지 않게 타이머로도 마무리
        setTimeout(finish, DURATION + 100);
    };

    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));

    // HTML 에는 Draft 슬라이드가 들어 있으므로, 다른 제품으로 열린 경우 그 슬라이드로 바꿔 끼움
    if (index !== 0) {
        firstSlide.replaceWith(buildSlide(PRODUCTS[index]));
        document.title = 'KOOKSOONDANG — ' + PRODUCTS[index].name;
    }

    paintSides();
    paintTone(index);
    tint(product.querySelector('[data-pd-slide]'), PRODUCTS[index]);
})();
