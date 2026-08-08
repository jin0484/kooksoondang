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

    function start() {
        // 백그라운드 탭에서는 setTimeout 이 1초 단위로 묶여서 순서가 무너진다.
        // 탭이 실제로 보일 때 시작한다.
        if (document.hidden) {
            document.addEventListener('visibilitychange', start, { once: true });
            return;
        }

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
    }

    splitWords();
    title.classList.add('is_reveal_ready');
    start();
})();


/* ---------------------------------------------------------------------------
   brand_history 끝 VISION 등장

   intro 타이틀과 같은 방식(.reveal_char + intro_text_reveal)으로
   글자를 하나씩 왼쪽에서 밀어 넣는다.
   다만 VISI(O)N 의 O 는 글자가 아니라 이미지라, 텍스트만 쪼개고
   이미지는 통째로 한 칸으로 다룬다.
   글자가 다 나온 뒤에 아래 문구가 이어서 올라온다.

   가로 탐색이 끝나 검정 패널이 화면을 채우면 재생한다.
   화면 밖으로 나가면 처음 상태로 되돌려서, 다시 들어올 때마다 또 재생된다.
--------------------------------------------------------------------------- */

(() => {
    const word = document.querySelector('.history_vision_word');
    const panel = document.querySelector('.history_vision_tit');

    if (!word || !panel) return;

    // 모션 최소화 설정이면 쪼개지 않고 그대로 둔다 (글자는 처음부터 보임)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lead = document.querySelector('.history_vision_lead');

    // VISION 은 여섯 칸뿐이라 또박또박, 문구는 예순 자가 넘어 촘촘하게
    const WORD_STEP_MS = 70;
    const LEAD_STEP_MS = 18;
    // intro_text_reveal 의 길이. 마지막 글자가 다 나타나는 시점을 잡는 데 쓴다
    const REVEAL_MS = 500;
    // VISION 이 자리를 잡고 나서 문구가 시작하기까지의 사이
    const LEAD_GAP_MS = 120;

    // 쪼갤 글자를 담은 텍스트 노드를 문서 순서대로 모은다.
    // 글자가 없는 요소(O 이미지)는 더 들어가지 않고 통째로 한 칸이 되고,
    // 글자를 품은 요소(em 70 years)는 안으로 들어간다. 그래야 초록색이 유지된다.
    function collect(root, out) {
        [...root.childNodes].forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                out.push(node);
                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return;

            if (node.textContent.trim()) collect(node, out);
            else node.classList.add('reveal_char');
        });
    }

    // 글자를 한 자씩 span 으로 쪼갠다
    function split(root) {
        const texts = [];

        collect(root, texts);

        texts.forEach((node, index) => {
            // 마크업의 줄바꿈·들여쓰기는 화면에서 접히는 공백이라 하나로 줄인다.
            // 없애는 건 맨 앞뒤에서만. 낱말 사이 빈칸은 남겨야 한다.
            let text = node.textContent.replace(/\s+/g, ' ');

            if (index === 0) text = text.replace(/^ /, '');
            if (index === texts.length - 1) text = text.replace(/ $/, '');

            if (!text) {
                node.remove();
                return;
            }

            const fragment = document.createDocumentFragment();

            for (const character of text) {
                // 빈칸은 span 으로 감싸지 않고 그냥 둔다.
                // inline-block 끼리 붙어 있으면 줄바꿈 자리가 생기지 않아서,
                // 빈칸까지 span 으로 만들면 긴 문구가 한 줄로 굳어 버린다.
                if (character === ' ') {
                    fragment.appendChild(document.createTextNode(' '));
                    continue;
                }

                const span = document.createElement('span');

                span.className = 'reveal_char';
                span.textContent = character;
                fragment.appendChild(span);
            }

            node.replaceWith(fragment);
        });
    }

    // 화면을 드나들 때마다 다시 재생하므로, 되돌아간 뒤에 예약만 남은 타이머가
    // 뒤늦게 터지지 않도록 매번 걷어 낸다.
    let timers = [];
    let isShown = false;

    function clearTimers() {
        timers.forEach(window.clearTimeout);
        timers = [];
    }

    const charsOf = (root) => [...root.querySelectorAll('.reveal_char')];

    // 한 덩어리의 글자를 stepMs 간격으로, delayMs 만큼 기다렸다가 등장시킨다
    function reveal(items, stepMs, delayMs) {
        items.forEach((item, index) => {
            timers.push(window.setTimeout(() => {
                item.classList.add('is_revealed');
            }, delayMs + index * stepMs));
        });
    }

    // VISION -> 문구 순서로 실제로 등장시킨다
    function run() {
        // 기다리는 사이에 화면 밖으로 나갔으면 없던 일로 한다
        if (!isShown) return;

        const items = charsOf(word);

        reveal(items, WORD_STEP_MS, 0);

        if (!lead) return;

        // VISION 의 마지막 글자가 다 나타난 뒤에 문구가 이어서 시작한다
        const leadStart = (items.length - 1) * WORD_STEP_MS + REVEAL_MS + LEAD_GAP_MS;

        reveal(charsOf(lead), LEAD_STEP_MS, leadStart);
    }

    function play() {
        if (isShown) return;

        isShown = true;
        clearTimers();

        // 백그라운드 탭에서는 setTimeout 이 1초 단위로 묶여서 순서가 무너진다.
        // 탭이 실제로 보일 때 시작한다. (intro 타이틀과 같은 처리)
        if (document.hidden) {
            document.addEventListener('visibilitychange', run, { once: true });
            return;
        }

        run();
    }

    // 처음 상태로 되돌린다. 화면 밖에서 일어나므로 되감기는 모습은 보이지 않는다.
    function reset() {
        if (!isShown) return;

        isShown = false;
        clearTimers();

        // VISION 과 문구를 한꺼번에 되돌린다 (둘 다 panel 안에 있다)
        charsOf(panel).forEach((item) => item.classList.remove('is_revealed'));
    }

    split(word);

    if (lead) split(lead);

    if (!('IntersectionObserver' in window)) {
        play();
        return;
    }

    // 패널이 화면을 거의 채웠을 때 = 가로 탐색이 끝나갈 때.
    // 관찰 대상이 transform 으로 밀려 들어와도 IntersectionObserver 는
    // 실제로 그려진 자리를 보므로 그대로 쓸 수 있다.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) play();
            else reset();
        });
    }, { threshold: 0.6 });

    observer.observe(panel);
})();


/* ---------------------------------------------------------------------------
   brand_history 두루마리 펼치기

   화면에 들어오면 좌우 막대가 맞붙어 있던 상태에서 오른쪽 막대가 밀려나며
   종이가 좌 -> 우로 펼쳐진다. 움직이는 모습은 CSS 가 그리고 여기서는
   "얼마나 말려 있는지" 를 실측해 넣고 시점만 잡는다.

   재는 값은 전부 offsetLeft / offsetWidth (레이아웃 단위) 다.
   트랙에 scale() 이 걸려 있어서 getBoundingClientRect 로 재면 화면 단위가 나오는데,
   transform / clip-path 는 스케일 안쪽에서 적용되므로 설계 단위로 넣어야 맞는다.
--------------------------------------------------------------------------- */

(() => {
    const all = document.querySelector('.history_scroll_all');
    const leftStick = all?.querySelector('.history_stick_left');
    const paper = all?.querySelector('.history_scroll_inner');
    const rightStick = all?.querySelector('.history_stick_right');

    if (!all || !leftStick || !paper || !rightStick) return;

    // 모션 최소화 설정이면 말지 않는다 (처음부터 펼쳐진 채로 보인다)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // 펼쳐졌을 때 오른쪽 막대가 종이 오른쪽 끝을 물고 있는 만큼(margin-right: -40px).
    // 말렸을 때도 같은 만큼 물려 있어야 종이 끝이 막대 밖으로 삐져나오지 않는다.
    const GRIP = 40;

    let isRolled = false;
    let closedAt = null;    // 다 말린 자리
    let awayAt = null;      // 화면 오른쪽 끝을 막 벗어난 자리

    // 막대가 실제로 오가는 거리는 5600px 이 넘는데 화면 폭은 그 일부뿐이다.
    // 그 거리를 다 애니메이션하면 시간의 대부분을 화면 밖에서 보내게 되어,
    // 한참 아무 일도 없다가 끝에서 순식간에 스치고 지나가는 것처럼 보인다.
    // 그래서 "화면에 보이는 구간" 만 움직이고, 그 바깥은 순간이동으로 건너뛴다.
    //
    // 웹폰트가 바뀌면 종이 폭도 달라지므로 상태를 바꾸기 직전에 다시 잰다.
    function measure() {
        const paperWidth = paper.offsetWidth;

        if (!paperWidth) return false;

        // 트랙에 걸린 scale 을 실측한다 (--history_scale 은 아직 안 정해졌을 수 있다)
        const scale = rightStick.getBoundingClientRect().width / rightStick.offsetWidth || 1;
        const span = document.documentElement.clientWidth / scale;
        // 말렸을 때 오른쪽 막대가 설 자리 = 왼쪽 막대의 오른쪽 끝
        const closed = leftStick.offsetLeft + leftStick.offsetWidth;

        // 막대를 x 에 세우는 값 한 쌍.
        // 종이는 끝이 막대에 GRIP 만큼 물리도록 같이 잘라 낸다.
        const at = (x) => ({
            shift: Math.min(0, x - rightStick.offsetLeft),
            clip: Math.max(0, paperWidth - (x + GRIP - paper.offsetLeft))
        });

        closedAt = at(closed);
        awayAt = at(closed + span);

        return true;
    }

    function apply(vars) {
        all.style.setProperty('--unroll_shift', vars.shift + 'px');
        all.style.setProperty('--unroll_clip', vars.clip + 'px');
    }

    // 지금까지 바꾼 값을 전환 없이 확정한다.
    // 클래스를 붙인 채로 한 번 계산시켜야(offsetWidth) 전환이 생략된다.
    function commit() {
        all.classList.add('is_unroll_instant');
        void all.offsetWidth;
        all.classList.remove('is_unroll_instant');
    }

    // 전환이 끝난 뒤 화면 밖에서 자연 상태로 되돌리는 예약.
    // 그 사이에 상태가 바뀌면 token 이 어긋나 취소된다.
    let settleToken = 0;

    function settleOpen() {
        const token = ++settleToken;
        const durationMs = parseFloat(getComputedStyle(all).getPropertyValue('--unroll_ms')) || 1300;

        const finish = () => {
            if (token !== settleToken || isRolled) return;

            // 여기서 남은 거리를 순간이동으로 건너뛴다. 화면 밖이라 보이지 않는다.
            all.classList.remove('is_rolled');
            all.style.removeProperty('--unroll_shift');
            all.style.removeProperty('--unroll_clip');
            commit();
        };

        rightStick.addEventListener('transitionend', finish, { once: true });
        // 전환이 잘리거나 탭이 숨겨져 transitionend 가 오지 않는 경우 대비
        window.setTimeout(finish, durationMs + 200);
    }

    // 과정 없이 곧장 다 말린 상태로. 진행 중인 전환도 끊는다.
    function rollInstant() {
        if (!measure()) return;

        settleToken++;
        isRolled = true;
        apply(closedAt);
        all.classList.add('is_rolled');
        commit();
    }

    // 화면에 보이는 구간만 지나며 닫힌다
    function rollAnimated() {
        if (isRolled || !measure()) return;

        settleToken++;
        isRolled = true;

        // 펼쳐지는 도중이었다면 지금 자리에서 방향만 되돌린다 (순간이동 금지)
        if (all.classList.contains('is_rolled')) {
            apply(closedAt);
            return;
        }

        // 다 펼쳐진 상태였다면 화면 밖 오른쪽으로 먼저 옮겨 놓고(보이지 않는다)
        apply(awayAt);
        all.classList.add('is_rolled');
        commit();
        // 거기서부터 닫힌 자리까지 — 이 구간이 전부 화면 안이다
        apply(closedAt);
    }

    // 닫힌 자리에서 화면 밖까지만 펼친다. 나머지는 settleOpen 이 건너뛴다.
    function unroll() {
        if (!isRolled || !measure()) return;

        isRolled = false;
        apply(awayAt);
        settleOpen();
    }

    // 펼쳐진 모습이 CSS 의 기본값이라, 시작할 때 한 번 말아 둔다 (과정 없이)
    all.classList.add('is_unroll_ready');
    rollInstant();

    // 말려 있는 동안 종이 폭이 달라지면 잘라 낼 폭도 달라진다
    document.fonts?.ready.then(() => {
        if (isRolled) rollInstant();
    });

    if (!('IntersectionObserver' in window)) {
        unroll();
        return;
    }

    // 관찰 대상은 두루마리가 아니라 섹션이다.
    // 두루마리는 트랙 왼쪽 끝에 있어 가로로 넘기는 도중에 화면 밖으로 나가는데,
    // 그때마다 다시 말리면 되돌아올 때 엉뚱하게 또 펼쳐진다.
    //
    // 섹션 높이는 100svh(= 화면 높이 이하) 라 0.8 은 "화면에 80% 들어왔을 때" 가 된다.
    const OPEN_AT = 0.8;
    // 임계값을 지나는 순간 보고되는 비율이 미세하게 모자랄 수 있어 여유를 둔다
    const EPSILON = 0.01;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            // 80% 넘게 보이면 펼친다
            if (entry.intersectionRatio >= OPEN_AT - EPSILON) unroll();
            // 조금이라도 보이는 동안은 펼칠 때와 같은 속도로 닫힌다
            else if (entry.isIntersecting) rollAnimated();
            // 아예 안 보이면 과정 없이 곧장 처음 상태로
            else rollInstant();
        });
    }, { threshold: [0, OPEN_AT] });

    observer.observe(document.querySelector('.history_section') || all);
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

    // 연혁 한 덩어리가 화면 폭 안에 들어와야 하는 비율.
    // 1 이면 딱 맞고, 조금 줄여서 좌우에 숨 쉴 자리를 남긴다.
    const WIDTH_FIT = 0.95;

    // 폭에 맞추더라도 이 아래로는 줄이지 않는다.
    // 가장 넓은 덩어리(year_2, 1400)에 그대로 맞추면 768px 에서 0.52 까지 떨어지는데,
    // 그러면 본문(설계 15px)이 화면에서 8px 이 되어 읽을 수 없다.
    // 이 선을 넘는 덩어리는 어차피 좌우로 넘겨 가며 보는 구간이라
    // 화면보다 조금 넓어도 된다.
    const READABLE_SCALE = 0.65;

    // 가장 넓은 연혁 덩어리 (설계 단위)
    function widestBlock() {
        let widest = 0;

        section.querySelectorAll('.history_year_con > .year_block').forEach((block) => {
            widest = Math.max(widest, block.offsetWidth);
        });

        return widest;
    }

    // 화면 높이에 트랙을 맞춘다. 시안 높이 1080 을 1 로 본다.
    // vision 패널이 화면 폭만큼 늘어날 수 있어서 트랙 폭은 실측해 stage 에 전달한다.
    function applyScale() {
        const byHeight = screenHeight() / DESIGN_HEIGHT;
        const widest = widestBlock();

        // 높이에만 맞추면 태블릿(768 x 1024 처럼 세로로 긴 화면)에서
        // 연혁 한 덩어리가 화면보다 넓어져 연도 제목이 잘린 채로 지나간다.
        // 그래서 pin 으로 도는 768px 이상에서는 폭도 함께 본다.
        //
        // 높이는 절대 넘지 않는다(넘으면 위아래가 잘린다). 그 안에서
        // 폭에 맞추되 읽을 수 있는 선 아래로는 내려가지 않는다.
        //
        // 768px 미만은 손으로 좌우로 넘기는 구간이라 폭을 맞추지 않는다.
        // 거기서 폭까지 맞추면 scale 이 하한(0.3)까지 떨어져 글자를 읽을 수 없다.
        const byWidth = widest > 0 ? screenWidth() * WIDTH_FIT / widest : byHeight;
        const raw = desktopQuery.matches && widest > 0
            ? Math.min(byHeight, Math.max(byWidth, READABLE_SCALE))
            : byHeight;

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

        // 이 페이지는 가로 탐색 때문에 세로로 소비하는 거리가 길다.
        // 공용 설정(lerp 0.1 / wheelMultiplier 1)이면 한참 굴려야 넘어가서 뻑뻑하게 느껴진다.
        // common.js 는 건드리지 않고, 이 페이지에 올라온 인스턴스의 값만 바꾼다.
        if (lenis.options) {
            // 낮을수록 여운이 길다 (더 미끄러짐)
            lenis.options.lerp = 0.085;
            // 휠 한 칸이 더 멀리 가서 덜 무겁다
            lenis.options.wheelMultiplier = 1.25;
        }

        lenis.__aboutbrandLinked = true;
    }

    /* ---- 네 자리를 오가는 사진 ----
       각 img_box 의 가운데가 화면 가운데에 오는 스크롤 진행도를 구해 두고,
       그 사이를 자리·크기·사진 세 가지 모두 보간한다. */

    const photo = section.querySelector('[data-history-photo]');
    const photoLayers = photo ? [...photo.querySelectorAll('img')] : [];
    let photoSlots = [];

    // 사진과 겹치는 글자만 흰색으로 보이게 할 복제본.
    // 원본과 같은 자리에 겹쳐 두고 사진 상자로 잘라 낸다.
    let photoMask = null;
    const photoText = buildPhotoText();

    function buildPhotoText() {
        if (!photo) return null;

        const host = photo.parentElement;
        const clone = host.cloneNode(true);

        // 복제본 안의 사진 상자는 지운다 (자기 자신이라 무한 중첩됨)
        clone.querySelector('[data-history-photo]')?.remove();
        // 클래스를 갈아 끼운다. history_year_con 을 남겨 두면 원본과 복제본을
        // 선택자로 구분할 수 없다. 레이아웃 값은 CSS 에서 두 클래스가 함께 갖는다.
        clone.className = 'history_photo_text';
        clone.setAttribute('aria-hidden', 'true');

        // 흰 글자는 원본 글자(z-index 1) 보다 위에서 잘려야 한다.
        // 사진 상자(z-index 0) 안에 두면 원본 글자에 가려 테두리만 보인다.
        photoMask = document.createElement('div');
        photoMask.className = 'history_photo_mask';
        photoMask.setAttribute('aria-hidden', 'true');
        photoMask.appendChild(clone);
        host.appendChild(photoMask);

        return clone;
    }

    // 원본 블록과 복제본 블록을 짝지어 흐림 값을 함께 넣는다
    const yearBlocks = [...section.querySelectorAll('.history_year_con > .year_block')];
    const yearBlockPairs = yearBlocks.map((block, index) => [
        block,
        photoText?.querySelectorAll('.year_block')[index]
    ]);

    const MAX_BLUR = 3;
    const MIN_DIM = 0.5;
    // 화면 폭 대비. FOCUS_HOLD 까지는 완전히 선명하고, FOCUS_REACH 에서 가장 흐리다.
    const FOCUS_HOLD = 0.42;
    const FOCUS_REACH = 1.05;

    // 블록별 "지금 사진이 얼마나 가까이 있는가"(0~1) 를 받아 선명도로 옮긴다.
    // 1 이면 완전히 선명(투명도 100%), 0 이면 가장 흐리고 옅다(투명도 50%).
    function applyFocus(nearness) {
        yearBlockPairs.forEach(([block, twin], index) => {
            const near = Math.min(1, Math.max(0, nearness[index] || 0));
            const away = 1 - near;
            const blur = (away * MAX_BLUR).toFixed(2) + 'px';
            const dim = (1 - away * (1 - MIN_DIM)).toFixed(3);

            [block, twin].forEach((target) => {
                if (!target) return;

                target.style.setProperty('--year_blur', blur);
                target.style.setProperty('--year_dim', dim);
            });
        });
    }

    // 폴백(가로 탐색이 아닌 네이티브 스크롤)일 때 쓰는 기준.
    // 이때는 사진이 움직이지 않으므로 각 블록의 img_box 가 화면 가운데에
    // 얼마나 가까운지로 판단한다.
    function updateFocus() {
        // 가로 탐색 중에는 사진 위치가 기준이므로 여기서 덮어쓰지 않는다
        if (isPinned && photoSlots.length > 1) return;

        const width = screenWidth();
        const centerLine = width / 2;

        applyFocus(yearBlockPairs.map(([block]) => {
            const focusEl = block.querySelector('.img_box') || block;
            const rect = focusEl.getBoundingClientRect();

            if (!rect.width) return 1;

            const distance = Math.abs(rect.left + rect.width / 2 - centerLine) / width;
            const ratio = (distance - FOCUS_HOLD) / (FOCUS_REACH - FOCUS_HOLD);

            return 1 - smooth(Math.min(1, Math.max(0, ratio)));
        }));
    }

    const lerp = (from, to, ratio) => from + (to - from) * ratio;
    // 자리에 붙었다 떨어질 때 덜 딱딱하도록 부드럽게
    const smooth = (ratio) => ratio * ratio * (3 - 2 * ratio);

    function measurePhotoSlots() {
        if (!photo) return;

        const host = photo.parentElement;
        const hostRect = host.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        const scale = parseFloat(getComputedStyle(section).getPropertyValue('--history_scale')) || 1;
        const distance = getScrollDistance();
        const centerLine = screenWidth() / 2;

        // 복제본에도 .img_box 가 있으므로 원본 블록의 것만 고른다
        const boxes = [...section.querySelectorAll('.history_year_con > .year_block .img_box')];

        photoSlots = boxes.map((box) => {
            const rect = box.getBoundingClientRect();
            // 화면 기준 좌표를 설계 좌표로 되돌린다
            const slot = {
                x: (rect.left - hostRect.left) / scale,
                y: (rect.top - hostRect.top) / scale,
                w: rect.width / scale,
                h: rect.height / scale,
                // 이 자리가 어느 연혁 블록의 것인지 (사진이 닿으면 그 블록이 선명해진다)
                block: yearBlocks.indexOf(box.closest('.year_block'))
            };

            // 멈춰 서는 시점은 사진 상자가 아니라 글자까지 포함한
            // 블록 전체가 화면 가운데에 왔을 때로 잡는다.
            // (사진만 가운데에 두면 글자가 왼쪽으로 쏠려 보인다)
            const blockRect = (box.closest('.year_block') || box).getBoundingClientRect();
            const centerOnTrack = blockRect.left + blockRect.width / 2 - trackRect.left;

            slot.at = distance > 0
                ? Math.min(1, Math.max(0, (centerOnTrack - centerLine) / distance))
                : 0;

            return slot;
        });
    }

    function updatePhoto(progress) {
        if (!photo || photoSlots.length < 2) return;

        let index = 0;

        while (index < photoSlots.length - 2 && progress > photoSlots[index + 1].at) index++;

        const from = photoSlots[index];
        const to = photoSlots[index + 1];
        const span = to.at - from.at;
        const ratio = span > 0 ? Math.min(1, Math.max(0, (progress - from.at) / span)) : 0;
        const eased = smooth(ratio);

        const x = lerp(from.x, to.x, eased);
        const y = lerp(from.y, to.y, eased);

        photo.style.left = x + 'px';
        photo.style.top = y + 'px';
        photo.style.width = lerp(from.w, to.w, eased) + 'px';
        photo.style.height = lerp(from.h, to.h, eased) + 'px';

        // 흰 글자를 자를 창은 사진과 똑같은 자리·크기,
        // 그 안의 복제본은 사진 좌표의 반대값으로 되돌려 원본 글자와 겹친다
        if (photoMask && photoText) {
            const host = photo.parentElement;

            photoMask.style.left = photo.style.left;
            photoMask.style.top = photo.style.top;
            photoMask.style.width = photo.style.width;
            photoMask.style.height = photo.style.height;

            photoText.style.left = -x + 'px';
            photoText.style.top = -y + 'px';
            photoText.style.width = host.offsetWidth + 'px';
            photoText.style.height = host.offsetHeight + 'px';
        }

        photoLayers.forEach((layer, layerIndex) => {
            if (layerIndex === index) layer.style.opacity = String(1 - eased);
            else if (layerIndex === index + 1) layer.style.opacity = String(eased);
            else layer.style.opacity = '0';
        });

        // 사진이 떠나온 자리와 다가가는 자리의 블록만 밝다.
        // 사진이 붙어 있는 쪽이 100%, 완전히 멀어진 나머지는 50%.
        const nearness = yearBlockPairs.map(() => 0);

        if (from.block >= 0) nearness[from.block] = 1 - eased;
        if (to.block >= 0) nearness[to.block] = eased;

        applyFocus(nearness);
    }

    function resetPhoto() {
        if (!photo) return;

        photo.removeAttribute('style');
        photoLayers.forEach((layer) => layer.removeAttribute('style'));
    }

    function getScrollDistance() {
        // 스케일이 적용된 stage 가 화면보다 얼마나 더 넓은지.
        // 소수점을 올림해서 오른쪽 끝에 서브픽셀 틈이 남지 않게 한다.
        const stageWidth = Math.ceil(stage.getBoundingClientRect().width);

        return Math.max(0, stageWidth - screenWidth());
    }

    // 가로 이동이 끝난 뒤, vision 패널을 화면 한 번 분량만큼 붙잡아 둔다.
    // 이 구간에서는 아무것도 움직이지 않고 pin 만 유지되므로,
    // 화면이 완전히 넘어간 뒤에야 세로 스크롤로 풀린다.
    const holdDistance = () => screenHeight();

    // 사진이 각 img_box 자리에 닿을 때마다 한 번씩 멈춰 서는 거리.
    // 이만큼은 스크롤을 해도 트랙이 움직이지 않아서, 한 번 걸렸다가
    // 다시 스크롤하면 다음 자리로 넘어간다.
    const dwellDistance = () => Math.round(screenHeight() * 0.4);

    // 멈춰 설 지점(트랙 이동 거리 기준). 이미 자리에 있는 첫 칸(0)은 뺀다.
    function dwellStops(distance) {
        return photoSlots
            .map((slot) => slot.at * distance)
            .filter((position) => position > 1)
            .sort((a, b) => a - b);
    }

    // 멈춰 서는 구간을 포함한 전체 스크롤 길이
    function getTotalDistance() {
        const distance = getScrollDistance();

        return distance + dwellStops(distance).length * dwellDistance() + holdDistance();
    }

    // 멈춤 지점을 오갈 때 속도를 어느 정도까지 죽일지.
    // 1 이면 완전히 섰다가 출발해 툭툭 끊기고, 0 이면 등속이라 그냥 지나친다.
    // 조금 남겨 두어야 구간 초입에서 "안 움직인다" 는 느낌이 나지 않는다.
    const EASE_MIX = 0.85;

    // 구간 안에서는 천천히 들어와 천천히 빠져나간다.
    // 멈춤 구간의 속도(0)와 이어져서 끊기는 느낌이 없다.
    const easeRun = (ratio) => ratio * (1 - EASE_MIX) + smooth(ratio) * EASE_MIX;

    // 스크롤한 거리(멈춤 포함) -> 트랙이 실제로 움직인 거리.
    // 멈춤 지점마다 dwell 만큼 스크롤을 먹고 트랙은 제자리에 있는다.
    function movedByScroll(scrolled, distance) {
        const dwell = dwellDistance();
        const stops = dwellStops(distance);
        // 마지막 목적지(트랙 끝)에는 멈춤을 두지 않는다
        const targets = [...stops, distance];
        let moved = 0;
        let used = 0;

        for (let index = 0; index < targets.length; index++) {
            const run = targets[index] - moved;

            if (run > 0) {
                if (scrolled - used < run) {
                    return moved + run * easeRun((scrolled - used) / run);
                }

                used += run;
                moved = targets[index];
            }

            if (index === targets.length - 1) break;

            if (scrolled - used < dwell) return moved;

            used += dwell;
        }

        return Math.min(distance, moved);
    }

    // 스크럽으로 부드럽게 만든 값을 받아 쓰기 위한 대리 객체
    const scrollProxy = { progress: 0 };

    function renderHorizontal() {
        const distance = getScrollDistance();
        const total = getTotalDistance();
        // 끝에서 붙잡아 두는 구간을 뺀, 가로로 쓸 수 있는 스크롤 거리
        const usable = Math.max(0, total - holdDistance());
        const scrolled = Math.min(usable, scrollProxy.progress * total);
        const moved = distance > 0
            ? Math.min(1, movedByScroll(scrolled, distance) / distance)
            : 0;

        gsap.set(stage, { x: -distance * moved });
        updatePhoto(moved);
        updateFocus();
    }

    function buildHorizontalScroll() {
        if (horizontalTween) return;

        connectLenis();

        section.classList.add('is_history_pinned');
        isPinned = true;
        viewport.scrollLeft = 0;
        scrollProxy.progress = 0;

        horizontalTween = gsap.to(scrollProxy, {
            progress: 1,
            ease: 'none',
            onUpdate: renderHorizontal,
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                // 가로로 밀 거리 + 자리마다 멈추는 거리 + 끝에서 붙잡아 두는 거리
                end: () => '+=' + getTotalDistance(),
                pin: true,
                // lenis 가 이미 스크롤을 부드럽게 만들어 주므로 scrub 까지 길게 잡으면
                // 두 번 뭉개져서 손끝을 따라오지 않는 느낌이 난다
                scrub: 0.5,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                // 자리 계산은 refresh 시점의 실제 크기로 다시 한다
                onRefresh: () => {
                    measurePhotoSlots();
                    renderHorizontal();
                }
            }
        });

        measurePhotoSlots();
        renderHorizontal();
    }

    function destroyHorizontalScroll() {
        if (!horizontalTween) return;

        horizontalTween.scrollTrigger?.kill();
        horizontalTween.kill();
        horizontalTween = null;

        gsap.set(stage, { clearProps: 'transform' });
        section.classList.remove('is_history_pinned');
        isPinned = false;
        resetPhoto();
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
        updateFocus();
    }

    // 폴백(네이티브 가로 스크롤)일 때도 가운데 블록만 선명하게 유지한다
    let focusFrame = 0;

    viewport.addEventListener('scroll', () => {
        if (focusFrame) return;

        focusFrame = window.requestAnimationFrame(() => {
            focusFrame = 0;
            updateFocus();
        });
    }, { passive: true });

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


/* ---------------------------------------------------------------------------
   vision - 4 keywords 흩어지기

   원 네 개가 한가운데 겹쳐 있다가 스크롤을 내리면 제자리로 흩어지고,
   흩어지는 동안 원 안의 글자가 왼쪽부터 차례로 나타난다.
   원이 다 펼쳐진 뒤에 아래 화살표, 마지막으로 문구가 이어서 나타난다.

   네 단계가 이어지는 동안 섹션을 화면 가운데에 붙잡아 둔다.
   붙잡지 않으면 스크롤을 길게 쓰는 만큼 섹션이 위로 밀려 올라가서,
   마지막 문구가 화면 밖으로 빠져나가기 전에 서둘러 끝내야 한다.

   흩어진 뒤의 모습이 CSS 의 기본 배치라, GSAP 이 없거나 모션 최소화 설정이면
   아무것도 하지 않고 처음부터 흩어진 상태로 보인다.
--------------------------------------------------------------------------- */

(() => {
    const section = document.querySelector('.vision_section');
    const list = section?.querySelector('.vision_circles');

    if (!section || !list) return;

    const circles = [...list.querySelectorAll('.vision_circle')];
    const names = circles.map((circle) => circle.querySelector('.vision_circle_name'));
    const arrow = section.querySelector('.vision_arrow');
    const statement = section.querySelector('.vision_statement');

    if (!circles.length) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const canUseGsap = () => typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const shouldAnimate = () => canUseGsap() && !reducedMotionQuery.matches;

    const clamp = (value) => Math.min(1, Math.max(0, value));
    const smooth = (ratio) => ratio * ratio * (3 - 2 * ratio);

    // 전체 진행도(0~1) 안에서 각 단계가 차지하는 구간.
    // 원 흩어짐 -> 원 안 글자 -> 화살표 -> 문구 순으로 이어진다.
    const phase = (progress, start, span) => smooth(clamp((progress - start) / span));

    // 원이 다 흩어지는 시점
    const SPREAD_SPAN = 0.5;
    // 원 안 글자. 흩어지는 도중부터 왼쪽 원부터 차례로
    const NAME_START = 0.3;
    const NAME_SPAN = 0.25;
    const NAME_STEP = 0.05;
    // 원이 다 펼쳐진 뒤 화살표, 그다음 문구
    const ARROW_START = 0.68;
    const ARROW_SPAN = 0.16;
    const STATEMENT_START = 0.8;
    const STATEMENT_SPAN = 0.2;
    // 모여 있을 때 살짝 작게 시작해 흩어지면서 제 크기가 된다
    const GATHER_SCALE = 0.94;
    // 화살표·문구는 아래에서 살짝 올라오며 나타난다
    const RISE_PX = 16;

    // 네 단계에 쓸 스크롤 길이 (화면 높이의 배수).
    // 붙잡아 두는 구간이라 이 값이 클수록 그 자리에서 천천히 재생된다.
    const SCROLL_SPAN = 1.8;

    let slots = [];
    let tween = null;

    const screenHeight = () => document.documentElement.clientHeight;

    // 붙잡아 둘 자리. 섹션이 화면 가운데에 오게 한다.
    // 섹션이 화면보다 크면(모바일) 위에 맞춰서 아래가 잘리지 않게 한다.
    const pinOffset = () => Math.max(0, Math.round((screenHeight() - section.offsetHeight) / 2));

    // 모였을 때 각 원이 이동해야 할 거리. transform 의 영향을 받지 않는
    // offsetLeft / offsetTop 으로 재서 다시 계산해도 값이 밀리지 않게 한다.
    // (360px 에서는 2 x 2 로 접히므로 세로 거리도 함께 본다)
    function measure() {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        circles.forEach((circle) => {
            minX = Math.min(minX, circle.offsetLeft);
            maxX = Math.max(maxX, circle.offsetLeft + circle.offsetWidth);
            minY = Math.min(minY, circle.offsetTop);
            maxY = Math.max(maxY, circle.offsetTop + circle.offsetHeight);
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        slots = circles.map((circle) => ({
            x: centerX - (circle.offsetLeft + circle.offsetWidth / 2),
            y: centerY - (circle.offsetTop + circle.offsetHeight / 2)
        }));
    }

    // progress 0 = 한가운데 겹침, 1 = 제자리
    const scrollProxy = { progress: 0 };

    function render() {
        const progress = scrollProxy.progress;
        const spread = phase(progress, 0, SPREAD_SPAN);
        const gathered = 1 - spread;

        circles.forEach((circle, index) => {
            const slot = slots[index];

            if (!slot) return;

            gsap.set(circle, {
                x: slot.x * gathered,
                y: slot.y * gathered,
                scale: GATHER_SCALE + (1 - GATHER_SCALE) * spread
            });
        });

        names.forEach((name, index) => {
            if (!name) return;

            gsap.set(name, {
                opacity: phase(progress, NAME_START + index * NAME_STEP, NAME_SPAN)
            });
        });

        // 원이 다 펼쳐진 다음 화살표, 마지막으로 문구
        [
            [arrow, ARROW_START, ARROW_SPAN],
            [statement, STATEMENT_START, STATEMENT_SPAN]
        ].forEach(([target, start, span]) => {
            if (!target) return;

            const shown = phase(progress, start, span);

            gsap.set(target, { opacity: shown, y: RISE_PX * (1 - shown) });
        });
    }

    function build() {
        if (tween) return;

        measure();

        tween = gsap.to(scrollProxy, {
            progress: 1,
            ease: 'none',
            onUpdate: render,
            scrollTrigger: {
                trigger: section,
                // 섹션이 화면 가운데에 자리 잡으면 붙잡고, 그때부터 원이 흩어진다
                start: () => 'top ' + pinOffset() + 'px',
                // 원 -> 글자 -> 화살표 -> 문구 네 단계가 이 길이 안에서 이어진다
                end: () => '+=' + Math.round(screenHeight() * SCROLL_SPAN),
                pin: true,
                // 빠르게 굴려 들어와도 붙잡히는 순간이 튀지 않게 미리 준비시킨다
                anticipatePin: 1,
                scrub: 1,
                invalidateOnRefresh: true,
                // 창 크기가 바뀌면 흩어질 거리도 달라진다.
                // 재는 동안에는 transform 을 지워 원래 배치에서 값을 읽는다.
                onRefreshInit: () => {
                    gsap.set(circles, { clearProps: 'transform' });
                    measure();
                },
                onRefresh: render
            }
        });

        render();
    }

    function destroy() {
        if (!tween) return;

        // pin 을 걸었으므로 되돌려서 끝낸다 (pin-spacer 가 남지 않게)
        tween.scrollTrigger?.kill(true);
        tween.kill();
        tween = null;

        gsap.set(circles, { clearProps: 'transform' });
        [...names, arrow, statement].forEach((target) => {
            if (target) gsap.set(target, { clearProps: 'opacity,transform' });
        });
    }

    function syncMode() {
        if (shouldAnimate()) build();
        else destroy();
    }

    reducedMotionQuery.addEventListener('change', syncMode);

    window.addEventListener('load', syncMode);

    // 창 크기 변화는 ScrollTrigger 가 스스로 refresh 하면서
    // onRefreshInit 에서 거리를 다시 재므로 따로 듣지 않는다.
    syncMode();
})();


/* ---------------------------------------------------------------------------
   VISION 문구 붙들기

   가로 탐색이 끝나 pin 이 풀리면 brand_history 섹션이 통째로 위로 밀려 올라가고
   VISION 문구도 같이 사라진다. 아래에서 vision 섹션이 올라오는 동안 문구가
   조금 더 남아 있도록, 섹션이 올라가는 만큼 문구를 패널 안에서 아래로 흘려보낸다.

   완전히 고정하려면 한 화면 분량을 내려가야 하는데, 문구 아래로 남은 자리는
   패널(1080) 안에서 0.4 화면 남짓이다. 그 밖으로 나가면 .history_vision 의
   overflow: hidden 에 잘리므로, 남은 자리 안에서만 늦게 따라간다.

   이 IIFE 는 vision 섹션에 pin 을 거는 위쪽 IIFE 다음에 와야 한다.
   ScrollTrigger 가 pin-spacer 를 만든 뒤에 start/end 를 재야 자리가 맞는다.
--------------------------------------------------------------------------- */

(() => {
    const section = document.querySelector('.history_section');
    const tit = document.querySelector('.history_vision_tit');
    const next = document.querySelector('.vision_section');

    if (!section || !tit || !next) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // 섹션이 올라가는 거리 중 문구가 따라 내려갈 비율. 1 이면 제자리에 붙어 있는 셈.
    const LAG = 0.5;
    // 문구와 패널 아래 끝 사이에 남겨 둘 여유 (설계 단위)
    const BREATH = 24;

    // 옅어지는 구간. 처음에는 또렷하게 남아 있다가 서서히 사라진다.
    // 끝(1)보다 조금 일찍 다 사라지게 해서, 잘려 나가며 툭 끊기는 일이 없게 한다.
    const FADE_FROM = 0.2;
    const FADE_TO = 0.9;

    // 시작과 끝이 완만한 곡선 (이 파일의 다른 곳과 같은 방식)
    const smooth = (ratio) => ratio * ratio * (3 - 2 * ratio);

    function fade(progress) {
        const ratio = (progress - FADE_FROM) / (FADE_TO - FADE_FROM);

        return 1 - smooth(Math.min(1, Math.max(0, ratio)));
    }

    // 문구가 패널 안에서 내려갈 수 있는 최대 거리
    function room() {
        const holder = tit.offsetParent;

        if (!holder) return 0;

        return Math.max(0, holder.offsetHeight - (tit.offsetTop + tit.offsetHeight) - BREATH);
    }

    // 실제로 내려갈 거리. 화면 픽셀을 설계 단위로 바꾼 뒤 남은 자리에 맞춰 자른다
    // (문구는 scale 이 걸린 트랙 안에 있어서 transform 도 설계 단위로 들어간다)
    function travel() {
        const scale = parseFloat(getComputedStyle(section).getPropertyValue('--history_scale')) || 1;
        const want = document.documentElement.clientHeight * LAG / scale;

        return Math.min(want, room());
    }

    function render(self) {
        gsap.set(tit, {
            y: self.progress * travel(),
            opacity: fade(self.progress)
        });
    }

    // vision 섹션이 아래에서 올라와 화면을 채울 때까지가 딱 그 구간이다
    ScrollTrigger.create({
        trigger: next,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: render,
        onRefresh: render
    });
})();


/* ---------------------------------------------------------------------------
   respected company - 등장 순서

   섹션이 화면을 꽉 채우면 잠깐 붙잡아 두고(pin) 아래 순서로 한 번만 보여 준다.

   1) 컵이 흔들리고
   2) 그 바람에 물방울이 하나씩 튀어오르고
   3) respected / competitiveness 가 흰색에서 초록으로 칠해지고
   4) 마지막 물방울로부터 1초 뒤, 아래 태그가 차례로 물결처럼 차오른다.

   태그의 차오름만 스크롤 방향을 따라간다. 위로 되돌아 나가면 다시 빠지고,
   내려오면 또 차오른다. (칠하기는 한 번만)

   움직이는 모습은 전부 CSS 가 그리고, 여기서는 시점만 잡는다.
--------------------------------------------------------------------------- */

(() => {
    const section = document.querySelector('.respected_section');

    if (!section) return;

    const points = [...section.querySelectorAll('.respected_point')];
    const tags = [...section.querySelectorAll('.respected_tag')];

    if (!points.length && !tags.length) return;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 관찰자가 없거나 모션 최소화 설정이면 과정 없이 결과만 보여 준다.
    // (강조 단어는 CSS 기본값이 이미 초록이라 그대로 두면 된다)
    if (!('IntersectionObserver' in window) || isReduced) {
        tags.forEach((tag) => tag.classList.add('is_filled'));
        // 물방울은 .is_splash_ready 를 안 붙이면 처음부터 제자리에 보인다
        return;
    }

    const icon = section.querySelector('.respected_icon');
    const cup = section.querySelector('.respected_cup');
    const drops = icon ? [...icon.querySelectorAll('.respected_drop')] : [];

    /* ---- 재생 순서(ms) ----
       컵이 흔들리고 -> 물방울이 하나씩 튀고 -> 강조 단어가 칠해지고
       -> 마지막 물방울로부터 1초 뒤 아래 태그가 차례로 차오른다. */
    const DROP_LEAD_MS = 120;   // 컵이 흔들리기 시작하고 첫 물방울이 뜨기까지
    const DROP_STEP_MS = 220;   // 물방울끼리
    const PAINT_DELAY_MS = 700;
    const PAINT_STEP_MS = 180;  // 강조 단어끼리
    const TAG_GAP_MS = 1000;    // 마지막 물방울 뒤
    const TAG_STEP_MS = 160;    // 태그끼리
    // 빠질 때는 기다리지 않고 바로, 차오를 때보다 촘촘하게 (되돌아 나가는 길이 짧다)
    const TAG_DRAIN_STEP_MS = 90;

    const lastDropMs = DROP_LEAD_MS + Math.max(0, drops.length - 1) * DROP_STEP_MS;

    section.classList.add('is_paint_ready');

    if (icon) icon.classList.add('is_splash_ready');

    function addLater(items, stepMs, doneClass, delayMs) {
        items.forEach((item, index) => {
            window.setTimeout(() => item.classList.add(doneClass), delayMs + index * stepMs);
        });
    }

    /* ---- 태그 차오름 / 빠짐 ----
       스크롤 방향을 따라 몇 번이든 다시 재생되므로, 반대 방향으로 바뀌었을 때
       예약만 되어 있던 타이머가 뒤늦게 터지지 않도록 매번 걷어 낸다. */
    let tagTimers = [];
    let isTagFilled = false;

    function clearTagTimers() {
        tagTimers.forEach(window.clearTimeout);
        tagTimers = [];
    }

    function fillTags() {
        if (isTagFilled) return;

        isTagFilled = true;
        clearTagTimers();

        // 물방울이 다 튄 뒤 왼쪽부터 차례로
        tags.forEach((tag, index) => {
            tagTimers.push(window.setTimeout(() => {
                tag.classList.add('is_filled');
            }, lastDropMs + TAG_GAP_MS + index * TAG_STEP_MS));
        });
    }

    function drainTags() {
        if (!isTagFilled) return;

        isTagFilled = false;
        clearTagTimers();

        // 나중에 찬 오른쪽 태그부터 빠진다 (차오름의 역순)
        [...tags].reverse().forEach((tag, index) => {
            tagTimers.push(window.setTimeout(() => {
                tag.classList.remove('is_filled');
            }, index * TAG_DRAIN_STEP_MS));
        });
    }

    // 컵이 한 번 흔들리고 그 바람에 물방울이 튄다. 여러 번 다시 부를 수 있다.
    let splashTimers = [];

    function splash() {
        splashTimers.forEach(window.clearTimeout);
        splashTimers = [];

        // 클래스를 뗐다 붙여야 애니메이션과 전환이 처음부터 다시 재생된다.
        // 사이에 크기를 한 번 읽어, 브라우저가 두 상태를 따로 인식하게 만든다.
        cup?.classList.remove('is_shaking');
        drops.forEach((drop) => drop.classList.remove('is_splashed'));
        void section.offsetWidth;

        cup?.classList.add('is_shaking');

        drops.forEach((drop, index) => {
            splashTimers.push(window.setTimeout(() => {
                drop.classList.add('is_splashed');
            }, DROP_LEAD_MS + index * DROP_STEP_MS));
        });
    }

    let hasPlayed = false;

    // 스크롤이 걸려 멈추는 순간 컵이 흔들린다. "여기서 멈췄다" 는 신호라
    // 되돌아 올라와 다시 걸릴 때도 매번 흔들린다.
    // 태그도 그때마다 다시 차오른다. 칠하기만 한 번이다.
    function playSequence() {
        splash();
        fillTags();

        if (hasPlayed) return;

        hasPlayed = true;

        addLater(points, PAINT_STEP_MS, 'is_painted', PAINT_DELAY_MS);
    }

    // 컵에 마우스를 올릴 때마다 한 번씩 흔들린다.
    // mouseenter 는 들어올 때 한 번만 나므로, 계속 올려 두어도 다시 흔들리지 않고
    // 뗐다가 다시 올리면 그때 또 흔들린다.
    if (cup) cup.addEventListener('mouseenter', splash);

    const canUseGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    if (canUseGsap) {
        // 이 섹션은 그냥 두면 한 번에 지나가 버려서 순서대로 나오는 걸 볼 틈이 없다.
        // 화면을 꽉 채운 동안 잠깐 붙잡아 두고, 다 보여 준 뒤 놓아 준다.
        // 붙잡는 자리를 화면의 15% 만큼 더 내린다.
        // 다만 섹션이 화면보다 큰 만큼(여유분)과 콘텐츠 위 빈 공간까지만 쓴다.
        // 그 이상 내리면 맨 위의 컵이 화면 밖으로 잘려 나간다.
        const BREATH_PX = 48;   // 컵 위에 남겨 둘 자리
        const content = section.querySelector('.respected_content');

        const pinOffset = () => {
            const screen = document.documentElement.clientHeight;
            const slack = Math.max(0, section.offsetHeight - screen);
            const headroom = content
                ? Math.max(0, content.offsetTop - BREATH_PX)
                : 0;

            return Math.round(Math.min(screen * 0.15, slack + headroom));
        };

        // pin 은 걸지 않는다.
        //
        // pin 을 걸면 ScrollTrigger 가 섹션을 pin-spacer 로 감싸고 붙잡는 거리만큼
        // 여백을 넣는데, 그 여백이 그대로 "섹션 끝 ~ 푸터 사이의 빈 구간" 이 된다.
        // (실측: 768px. 붙잡는 거리를 줄여도 그만큼 빈 구간이 남을 뿐이다.)
        //
        // 이 섹션의 등장 순서는 스크롤에 묶인 게 아니라 시간(setTimeout)으로 도는
        // 연출이라 붙잡아 둘 이유도 없다. 섹션 자체가 화면을 꽉 채우는 높이여서
        // 그냥 지나가도 한 화면 분량의 스크롤 동안 머문다.
        ScrollTrigger.create({
            trigger: section,
            start: () => 'top -' + pinOffset(),
            end: () => '+=' + Math.round(document.documentElement.clientHeight * 0.4),
            invalidateOnRefresh: true,
            onEnter: playSequence,
            onEnterBack: playSequence,
            // 위로 되돌아 나가면 태그가 다시 빠진다. 내려오면 onEnter 로 또 찬다.
            // (아래로 지나간 경우는 이미 다 본 자리라 채운 채로 둔다)
            onLeaveBack: drainTags,
            // 이미 지나온 자리에서 페이지가 열린 경우
            onRefresh: (self) => {
                if (self.progress > 0) playSequence();
            }
        });

        return;
    }

    // GSAP 이 없으면 붙잡아 두지는 못해도 순서는 그대로 보여 준다.
    // 관찰을 끊지 않아서, 화면 가운데를 드나들 때마다 태그가 차고 빠진다.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) playSequence();
            else drainTags();
        });
    }, { rootMargin: '-25% 0px -25% 0px' });

    observer.observe(section);
})();
