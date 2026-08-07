/* ---------------------------------------------------------------------------
   aboutbrand.js
   brand_history 의 좌→우 가로 탐색.

   시안이 1920 x 1080 고정 캔버스라, 트랙 안쪽은 CSS 에서 시안 픽셀 그대로 짜고
   여기서 --history_scale (화면 높이 / 1080) 만 계산해 넣는다.
   .history_stage 가 스케일된 실제 크기를 레이아웃에 알려 주므로
   GSAP 은 stage 를 x 로 밀기만 하면 된다.

   - GSAP core + ScrollTrigger (무료 배포본) 만 사용. 유료 플러그인 없음.
   - 스무스 스크롤은 common.js 가 만든 window.siteLenis 를 그대로 쓰고 연결만 한다.
   - GSAP 이 없거나(CDN 차단) prefers-reduced-motion 이거나 768px 미만이면
     CSS 의 overflow-x 로 사용자가 직접 좌우로 넘긴다.
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   intro 타이틀 등장 애니메이션
   참고: https://illustudio.github.io/text-reveal-animation/
   글자를 하나씩 span 으로 쪼개 50ms 간격으로 왼쪽에서 밀려 들어오게 한다.
   화면에 처음 들어왔을 때 한 번만 재생한다.
--------------------------------------------------------------------------- */

(() => {
    const title = document.querySelector('.intro_title');

    if (!title) return;

    // 모션 최소화 설정이면 쪼개지 않고 그대로 둔다 (글자는 처음부터 보임)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const STEP_MS = 50;
    const REVEAL_MS = 500;

    // 글자를 쪼갤 대상은 .intro_title_word 안쪽뿐. 줄바꿈·들여쓰기 공백은 건드리지 않는다.
    function splitWords() {
        title.querySelectorAll('.intro_title_word').forEach((word) => {
            const text = word.textContent;
            const fragment = document.createDocumentFragment();

            for (const character of text) {
                const span = document.createElement('span');

                span.className = 'reveal_char';
                // 공백은 폭이 무너지지 않도록 줄바꿈 없는 공백으로 바꾼다
                span.textContent = character === ' ' ? ' ' : character;
                fragment.appendChild(span);
            }

            word.textContent = '';
            word.appendChild(fragment);
        });
    }

    function play() {
        // 글자 + 아이콘을 문서 순서대로 모아 차례대로 등장시킨다
        const items = title.querySelectorAll('.reveal_char, .intro_title_icon');

        items.forEach((item, index) => {
            window.setTimeout(() => item.classList.add('is_revealed'), index * STEP_MS);
        });

        // 마지막 글자가 다 나타난 시점
        const endMs = (items.length - 1) * STEP_MS + REVEAL_MS;

        window.setTimeout(() => {
            // 글자가 전부 등장한 뒤에 주황 하이라이트가 채워지고
            title.querySelector('.intro_title_mark')?.classList.add('is_revealed');
            // 아이콘은 그때부터 90도씩 끊어서 계속 돈다
            title.querySelector('.intro_title_icon')?.classList.add('is_spinning');
        }, endMs);
    }

    function isInView() {
        const box = title.getBoundingClientRect();

        return box.top < window.innerHeight && box.bottom > 0;
    }

    splitWords();
    title.classList.add('is_reveal_ready');

    // intro 는 맨 위라 대부분 처음부터 화면 안에 있다.
    // 그 경우 관찰자를 기다리지 않고 바로 재생한다.
    if (isInView() || !('IntersectionObserver' in window)) {
        play();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            observer.disconnect();
            play();
        });
    }, { threshold: 0.25 });

    observer.observe(title);
})();


(() => {
    const section = document.querySelector('.history_section');
    const viewport = section?.querySelector('[data-history-viewport]');
    const stage = section?.querySelector('[data-history-stage]');
    const track = section?.querySelector('[data-history-track]');

    if (!section || !viewport || !stage || !track) return;

    const DESIGN_HEIGHT = 1080;
    const MIN_SCALE = 0.3;
    const MAX_SCALE = 1.6;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopQuery = window.matchMedia('(min-width: 768px)');

    let horizontalTween = null;
    let isPinned = false;

    const canUseGsap = () => typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const shouldPin = () => canUseGsap() && desktopQuery.matches && !reducedMotionQuery.matches;

    // pin 이 걸리면 .history_viewport 의 크기는 ScrollTrigger 의 pin-spacer 가 잡아 두기
    // 때문에 창을 줄여도 예전 값이 그대로 나온다. 그래서 화면 크기는 문서 요소에서 직접 읽는다.
    const screenWidth = () => document.documentElement.clientWidth;
    const screenHeight = () => document.documentElement.clientHeight;

    // 화면 높이에 트랙을 맞춘다. 시안 높이 1080 을 1 로 본다.
    // vision 패널이 화면 폭만큼 늘어날 수 있어서 트랙 폭은 실측해 stage 에 전달한다.
    function applyScale() {
        const raw = screenHeight() / DESIGN_HEIGHT;
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, raw));

        section.style.setProperty('--history_scale', String(scale));
        section.style.setProperty('--history_vw', screenWidth() + 'px');

        // JS 가 없을 때를 대비한 값 (설계 단위)
        section.style.setProperty('--history_track_w', track.offsetWidth + 'px');

        // stage 는 "화면에 그려지는 트랙 크기" 그대로여야 오른쪽 끝에 틈이 안 생긴다.
        // calc(offsetWidth * scale) 은 offsetWidth 가 정수로 반올림돼 실제보다 넓어질 수 있어서
        // 스케일이 적용된 실측 폭을 내림해서 직접 넣는다.
        stage.style.width = Math.floor(track.getBoundingClientRect().width) + 'px';
    }

    // lenis 는 자체 rAF 로 스크롤 값을 만들기 때문에 ScrollTrigger 에 알려 줘야
    // pin 위치가 한 프레임씩 밀리지 않는다. common.js 를 고치지 않고 여기서만 연결.
    function connectLenis() {
        const lenis = window.siteLenis;

        if (!lenis || lenis.__aboutbrandLinked) return;

        lenis.on('scroll', ScrollTrigger.update);
        lenis.__aboutbrandLinked = true;
    }

    function getScrollDistance() {
        // 스케일이 적용된 stage 가 화면보다 얼마나 더 넓은지.
        // 소수점을 올림해서 오른쪽 끝에 서브픽셀 틈이 남지 않게 한다.
        const stageWidth = Math.ceil(stage.getBoundingClientRect().width);

        return Math.max(0, stageWidth - screenWidth());
    }

    function buildHorizontalScroll() {
        if (horizontalTween) return;

        connectLenis();

        section.classList.add('is_history_pinned');
        isPinned = true;
        viewport.scrollLeft = 0;

        horizontalTween = gsap.to(stage, {
            x: () => -getScrollDistance(),
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                // 가로로 밀 거리만큼 세로 스크롤을 소비시킨다.
                // 이 거리가 끝나면 pin 이 풀리고 vision 부터 다시 세로 스크롤이 된다.
                end: () => '+=' + getScrollDistance(),
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });
    }

    function destroyHorizontalScroll() {
        if (!horizontalTween) return;

        horizontalTween.scrollTrigger?.kill();
        horizontalTween.kill();
        horizontalTween = null;

        gsap.set(stage, { clearProps: 'transform' });
        section.classList.remove('is_history_pinned');
        isPinned = false;
    }

    // pin 이 걸리면 뷰포트는 스크롤되지 않으므로 초점을 줄 이유가 없고,
    // 폴백일 때는 실제로 좌우 스크롤되는 영역이라 키보드로도 넘길 수 있게 한다
    function syncViewportFocusability() {
        if (isPinned) {
            viewport.removeAttribute('tabindex');
            viewport.removeAttribute('role');
            viewport.removeAttribute('aria-label');
            return;
        }

        viewport.setAttribute('tabindex', '0');
        viewport.setAttribute('role', 'group');
        viewport.setAttribute('aria-label', 'Brand history timeline, scrollable left to right');
    }

    function syncMode() {
        applyScale();

        if (shouldPin()) buildHorizontalScroll();
        else destroyHorizontalScroll();

        syncViewportFocusability();
    }

    function refreshScrollTrigger() {
        if (!canUseGsap()) return;

        ScrollTrigger.refresh();
    }

    window.addEventListener('load', () => {
        syncMode();
        refreshScrollTrigger();

        // 웹폰트와 이미지가 들어오면서 크기가 한 번 더 바뀌는 경우가 있어
        // 레이아웃이 안정된 다음 프레임에 한 번 더 맞춘다
        window.requestAnimationFrame(() => {
            syncMode();
            refreshScrollTrigger();
        });
    });

    // 웹폰트 교체로 트랙 폭이 달라지면 밀어야 할 거리도 달라진다
    document.fonts?.ready.then(() => {
        syncMode();
        refreshScrollTrigger();
    });

    desktopQuery.addEventListener('change', syncMode);
    reducedMotionQuery.addEventListener('change', syncMode);

    // matchMedia 의 change 가 늘 발화한다고 믿을 수 없어서(개발자도구 뷰포트 변경,
    // 모바일 주소창 접힘 등) resize 로도 한 번 더 확인한다
    let resizeTimer = 0;

    function scheduleSync() {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            syncMode();
            refreshScrollTrigger();
        }, 200);
    }

    window.addEventListener('resize', scheduleSync);

    // resize 이벤트가 오지 않는 경우(모바일 주소창 접힘, 확대/축소, 스크롤바 등장)에도
    // 뷰포트 상자가 바뀌면 scale 과 트랙 폭을 다시 계산해야 한다
    if ('ResizeObserver' in window) {
        new ResizeObserver(scheduleSync).observe(viewport);
    }

    syncMode();
})();
