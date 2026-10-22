/* =========================================================
   제품 넘기기 (좌우 화살표) — 회전 테이블처럼

   히어로의 "병 + 글" 한 장(.pd_slide)이 통째로 옆으로 돌아 넘어가고,
   다음 제품이 반대편에서 같은 방식으로 돌아 들어옴.
   양옆의 흐린 병은 바로 앞·뒤 제품. 순서는 둥글게 이어짐.

   ※ Draft 말고는 설명 글과 ABV·용량을 모르는 상태라 임시 문구로 채워 둠
      (meta 가 null 이면 그 줄을 숨김). 실제 문구가 정해지면 PRODUCTS 만 고치면 됨.
   ※ crop 은 Figma 시안에서 큰 그림(1200x1800)의 일부만 잘라 쓴 값(left, top, width, height: %)
========================================================= */

(() => {
    const product = document.querySelector('[data-pd-product]');
    const firstSlide = product && product.querySelector('[data-pd-slide]');
    if (!firstSlide) return;

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
            name: 'Original Makgeolli',
            img: IMG + 'draft_bottle.png',
            crop: [-67.55, -3.59, 227.7, 105.94],
            desc: 'Kooksoondang Original Draft Makgeolli pairs the soft sweetness of rice with gentle fruity notes reminiscent of banana and melon. Live yeast creates a light fizz that tickles the tongue, while a mild tang keeps it easy to enjoy, even for first-timers. It goes down creamy yet light, finishing clean with a subtle, nutty hint of rice.',
            meta: ['ABV: 6%', 'Volume: 500ml'],
        },
        {
            name: 'Banana Makgeolli',
            img: IMG + 'banana.png',
            crop: [-62.94, -1.72, 223.46, 103.45],
            desc: 'Soft and creamy, with the gentle sweetness of ripe banana in every sip.',
            meta: null,
        },
        {
            name: 'Peach Makgeolli',
            img: IMG + 'peach.png',
            crop: [-62.94, -1.79, 223.46, 103.93],
            desc: 'A juicy, fragrant peach flavor blended into smooth, lightly sparkling makgeolli.',
            meta: null,
        },
        {
            name: 'White Grape Makgeolli',
            img: IMG + 'white_grape.png',
            crop: [-61.76, -1.79, 220.59, 103.93],
            desc: 'Fresh and crisp white grape, bright and refreshing with a clean finish.',
            meta: null,
        },
        {
            name: 'Strawberry Makgeolli',
            img: IMG + 'strawberry.png',
            crop: [-62.64, -1.72, 223.05, 103.45],
            desc: 'Sweet and tangy strawberry wrapped in the creamy softness of makgeolli.',
            meta: null,
        },
        {
            name: 'Rice Makgeolli',
            img: IMG + 'rice.png',
            crop: [-64.62, -2.63, 223.46, 105.2],
            desc: 'A smooth, authentic makgeolli brewed from carefully selected rice and nuruk.',
            meta: null,
        },
        {
            name: '100 Billion Prebiotics',
            img: IMG + 'prebiotics.png',
            crop: [-63.38, -1.84, 223.05, 103.69],
            desc: 'Made with rice and nuruk, a vegan makgeolli with a clean, balanced finish.',
            meta: null,
        },
        {
            name: 'Chestnut Makgeolli',
            img: IMG + 'chestnut.png',
            crop: [-61.58, -1.72, 220.59, 103.45],
            desc: 'Rich, nutty chestnut flavor wrapped in the creamy softness of makgeolli.',
            meta: null,
        },
    ];

    const count = PRODUCTS.length;
    let index = 0; // Original(Draft) 부터 시작
    let busy = false;

    const wrap = (i) => (i + count) % count;

    const setCrop = (img, crop) => {
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
            '<img class="pd_slide_deco" style="--x:1045;--y:500;--w:90;--h:300" src="' + IMG + 'pet.svg" alt="" aria-hidden="true">' +
            '<img class="pd_slide_deco" style="--x:940;--y:664;--w:71;--h:136" src="' + IMG + 'union.svg" alt="" aria-hidden="true">' +
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
            finish();
            return;
        }

        // dir > 0(다음): 현재는 왼쪽으로, 다음은 오른쪽에서. dir < 0 은 반대
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

    // 처음에는 HTML 에 이미 Draft 슬라이드가 들어 있으므로 옆 병만 맞춤
    paintSides();
})();
