/* =========================================================
   Products 페이지 인터랙션

   1. 제품 필터 / 검색
   2. TOP 버튼
   3. Hero Intro Animation
   4. Hero → Content Scroll Transition
   5. Product Showcase Reveal
========================================================= */


/* =========================================================
   1. 제품 필터 / 검색 / 버튼
========================================================= */

(() => {
    const grid = document.querySelector('[data-product-grid]');

    if (!grid) return;


    const cards = Array.from(
        grid.querySelectorAll('.product_card')
    );


    const categoryList =
        document.querySelector('[data-product-category]');


    const categoryButtons =
        categoryList
            ? Array.from(
                categoryList.querySelectorAll(
                    '.category_button'
                )
            )
            : [];


    const tagList =
        document.querySelector('[data-experience-tags]');


    const tagButtons =
        tagList
            ? Array.from(
                tagList.querySelectorAll(
                    '.experience_tag'
                )
            )
            : [];


    const searchForm =
        document.querySelector('[data-craving-search]');


    const searchInput =
        document.querySelector('[data-craving-input]');


    const emptyMessage =
        document.querySelector('[data-product-empty]');


    const viewAllButton =
        document.querySelector('[data-view-all]');


    const viewDetailsButton =
        document.querySelector('[data-view-details]');


    const showcase =
        document.getElementById('product_showcase');


    const state = {
        category: 'makgeolli',
        experience: '',
        keyword: ''
    };


    function matchesCard(card) {

        const category =
            card.dataset.category || '';


        const experience =
            (card.dataset.experience || '')
                .split(/\s+/)
                .filter(Boolean);


        const name =
            (
                card.querySelector(
                    '.product_name'
                )?.textContent || ''
            ).toLowerCase();


        const taste =
            (
                card.querySelector(
                    '.product_taste'
                )?.textContent || ''
            ).toLowerCase();


        if (
            state.category &&
            category !== state.category
        ) {
            return false;
        }


        if (
            state.experience &&
            !experience.includes(
                state.experience
            )
        ) {
            return false;
        }


        if (
            state.keyword &&
            !name.includes(state.keyword) &&
            !taste.includes(state.keyword)
        ) {
            return false;
        }


        return true;
    }


    function renderProducts() {

        let visibleCount = 0;


        cards.forEach((card) => {

            const isVisible =
                matchesCard(card);


            card.hidden = !isVisible;


            if (isVisible) {
                visibleCount += 1;
            }

        });


        if (emptyMessage) {
            emptyMessage.hidden =
                visibleCount > 0;
        }
    }


    function setPressed(
        button,
        isPressed
    ) {

        button.classList.toggle(
            'is_active',
            isPressed
        );


        button.setAttribute(
            'aria-pressed',
            String(isPressed)
        );
    }


    function handleCategoryClick(event) {

        const button =
            event.target.closest(
                '.category_button'
            );


        if (!button) return;


        state.category =
            button.dataset.category || '';


        categoryButtons.forEach(
            (item) => {

                setPressed(
                    item,
                    item === button
                );

            }
        );


        renderProducts();
    }


    function handleTagClick(event) {

        const button =
            event.target.closest(
                '.experience_tag'
            );


        if (!button) return;


        const clickedExperience =
            button.dataset.experience || '';


        const nextExperience =
            state.experience ===
                clickedExperience

                ? ''

                : clickedExperience;


        state.experience =
            nextExperience;


        tagButtons.forEach(
            (item) => {

                setPressed(
                    item,

                    item.dataset.experience ===
                    state.experience
                );

            }
        );


        renderProducts();
    }


    function handleSearchSubmit(event) {

        event.preventDefault();


        state.keyword =
            (
                searchInput?.value || ''
            )
                .trim()
                .toLowerCase();


        renderProducts();
    }


    function handleSearchInput() {

        if (!searchInput) return;


        if (
            searchInput.value !== ''
        ) {
            return;
        }


        state.keyword = '';


        renderProducts();
    }


    function handleViewAllClick() {

        state.category = '';
        state.experience = '';
        state.keyword = '';


        categoryButtons.forEach(
            (item) => {

                setPressed(
                    item,
                    false
                );

            }
        );


        tagButtons.forEach(
            (item) => {

                setPressed(
                    item,
                    false
                );

            }
        );


        if (searchInput) {
            searchInput.value = '';
        }


        renderProducts();
    }


    function handleViewDetailsClick() {

        state.category =
            'makgeolli';

        state.experience =
            'beginner';

        state.keyword = '';


        categoryButtons.forEach(
            (item) => {

                setPressed(
                    item,

                    item.dataset.category ===
                    'makgeolli'
                );

            }
        );


        tagButtons.forEach(
            (item) => {

                setPressed(
                    item,

                    item.dataset.experience ===
                    'beginner'
                );

            }
        );


        if (searchInput) {
            searchInput.value = '';
        }


        renderProducts();


        if (!showcase) return;


        const behavior =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches

                ? 'auto'

                : 'smooth';


        if (window.siteLenis) {

            window.siteLenis.scrollTo(
                showcase
            );

        } else {

            showcase.scrollIntoView({
                behavior,
                block: 'start'
            });

        }
    }


    categoryList?.addEventListener(
        'click',
        handleCategoryClick
    );


    tagList?.addEventListener(
        'click',
        handleTagClick
    );


    searchForm?.addEventListener(
        'submit',
        handleSearchSubmit
    );


    searchInput?.addEventListener(
        'input',
        handleSearchInput
    );


    viewAllButton?.addEventListener(
        'click',
        handleViewAllClick
    );


    viewDetailsButton?.addEventListener(
        'click',
        handleViewDetailsClick
    );


    renderProducts();

})();



/* =========================================================
   3. Products Hero Intro Animation

   순서

   제목
   ↓
   Rice / 1000 / Draft / Strawberry
   ↓
   Splash
   ↓
   백세주
========================================================= */

(() => {

    const hero =
        document.querySelector(
            '.products_hero'
        );


    if (!hero) return;


    if (
        typeof gsap ===
        'undefined'
    ) {

        console.warn(
            '[products hero] GSAP이 로드되지 않았습니다.'
        );

        return;
    }


    const titleLines =
        hero.querySelectorAll(
            '.products_hero_title span'
        );


    const rice =
        hero.querySelector(
            '.hero_bottle_rice'
        );


    const draft =
        hero.querySelector(
            '.hero_bottle_draft'
        );


    const prebiotics =
        hero.querySelector(
            '.hero_bottle_prebiotics'
        );


    const strawberry =
        hero.querySelector(
            '.hero_bottle_strawberry'
        );


    const splash =
        hero.querySelector(
            '.hero_splash'
        );


    const center =
        hero.querySelector(
            '.hero_bottle_center'
        );


    const prefersReducedMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;


    if (prefersReducedMotion) {

        gsap.set(
            [
                ...titleLines,
                rice,
                draft,
                prebiotics,
                strawberry,
                splash,
                center
            ].filter(Boolean),

            {
                opacity: 1
            }
        );


        return;
    }


    const introTl =
        gsap.timeline({

            defaults: {
                ease: 'power3.out'
            }

        });


    /* 제목 */

    if (titleLines.length) {

        introTl.fromTo(
            titleLines,

            {
                y: -55,
                opacity: 0
            },

            {
                y: 0,
                opacity: 1,

                duration: 0.9,

                stagger: 0.12
            }
        );

    }


    /* Rice */

    if (rice) {

        introTl.fromTo(
            rice,

            {
                x: -320,
                y: -80,
                opacity: 0
            },

            {
                x: 0,
                y: 0,
                opacity: 1,

                duration: 1.05
            },

            '-=0.2'
        );

    }


    /* 1000 */

    if (prebiotics) {

        introTl.fromTo(
            prebiotics,

            {
                x: 300,
                y: -130,
                opacity: 0
            },

            {
                x: 0,
                y: 0,
                opacity: 1,

                duration: 1.05
            },

            '-=0.82'
        );

    }


    /* Draft */

    if (draft) {

        introTl.fromTo(
            draft,

            {
                x: -270,
                y: 230,
                opacity: 0
            },

            {
                x: 0,
                y: 0,
                opacity: 1,

                duration: 1.05
            },

            '-=0.78'
        );

    }


    /* Strawberry */

    if (strawberry) {

        introTl.fromTo(
            strawberry,

            {
                x: 270,
                y: 230,
                opacity: 0
            },

            {
                x: 0,
                y: 0,
                opacity: 1,

                duration: 1.05
            },

            '-=0.78'
        );

    }


    /* Splash */

    if (splash) {

        introTl.fromTo(
            splash,

            {
                scale: 0.25,
                opacity: 0
            },

            {
                scale: 1,
                opacity: 1,

                duration: 0.8,

                ease:
                    'back.out(1.7)'
            },

            '-=0.3'
        );

    }




    /* 백세주 */

    if (center) {

        introTl.fromTo(
            center,

            {
                y: 280,
                opacity: 0
            },

            {
                y: 0,
                opacity: 1,

                duration: 1.15,

                ease:
                    'back.out(1.25)'
            },

            '-=0.5'
        );

    }


    /*
     * 이 연출이 언제 끝나는지 아래 4번(화면 잠금)에서 알아야 해서 내보냄.
     * 스크롤 잠금이 풀리는 기준이 곧 이 타임라인의 완료 시점
     */
    window.productsHeroIntro = introTl;

})();


/* =========================================================
   4. Hero → Content Cover Transition
========================================================= */

(() => {

    const hero =
        document.querySelector(
            '.products_hero'
        );


    const heroDim =
        hero?.querySelector(
            '.products_hero_dim'
        );


    const contentLayer =
        document.querySelector(
            '.products_content_layer'
        );


    if (!hero || !contentLayer) {
        return;
    }


    if (
        typeof gsap === 'undefined' ||
        typeof ScrollTrigger === 'undefined'
    ) {

        console.warn(
            '[products scroll] GSAP 또는 ScrollTrigger가 로드되지 않았습니다.'
        );

        return;
    }


    gsap.registerPlugin(
        ScrollTrigger
    );


    /*
     * Lenis 가 스크롤을 대신 굴리고 있으므로
     * 스크롤할 때마다 ScrollTrigger 에 알려 줌.
     * 안 그러면 둘이 보는 위치가 미세하게 어긋나
     * 고정 구간이 밀리거나 튄다
     */
    if (
        window.siteLenis &&
        !window.siteLenis._scrollTriggerWired
    ) {

        window.siteLenis.on(
            'scroll',
            ScrollTrigger.update
        );

        window.siteLenis._scrollTriggerWired = true;
    }


    const prefersReducedMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;


    if (prefersReducedMotion) {
        return;
    }


    /* =========================================
       다음 콘텐츠는 원래 위치 그대로

       yPercent / window.innerHeight 사용 X
    ========================================= */

    gsap.set(
        contentLayer,
        {
            clearProps: 'transform'
        }
    );


    const centerBottle =
        hero.querySelector(
            '.hero_bottle_center'
        );


    /* =========================================
       화면 잠금 (Hero 모션이 끝날 때까지)

       들어오면 스크롤을 아예 막아 두고
       Hero 등장 연출이 다 끝나면 잠금을 푼다.

       ScrollTrigger 의 pin 은 "스크롤한 만큼" 진행되므로
       아무리 잡아 둬도 화면이 조금씩 움직인다.
       완전히 멈춰 있어야 하므로 잠금은 스크롤 자체를
       막는 방식으로 따로 둠
    ========================================= */

    /* 마지막에 백세주가 커지는 배율 */
    const BOTTLE_SCALE = 1.2;

    /* 백세주가 커지는 시간(초) */
    const BOTTLE_SCALE_TIME = 0.8;

    let gateReleased = false;

    let gateFallback = 0;


    /*
     * 중앙 백세주는 css 에서 translate(-50%, -50%) 로
     * 가운데를 잡고 있음.
     * gsap 이 transform 을 넘겨받을 때 그 값을 잃지 않도록
     * 같은 값을 gsap 방식으로 먼저 심어 둠
     */
    if (centerBottle) {

        gsap.set(
            centerBottle,

            {
                xPercent: -50,

                yPercent: -50
            }
        );

    }


    /* 잠겨 있는 동안 들어오는 스크롤 입력을 전부 막음 */

    function onGateWheel(event) {
        event.preventDefault();
    }


    function onGateTouchMove(event) {
        event.preventDefault();
    }


    /* 스페이스 · 화살표 · PageDown 으로도 내려가지 않게 */
    function onGateKey(event) {

        const keys = [
            ' ',
            'ArrowDown',
            'ArrowUp',
            'PageDown',
            'PageUp',
            'Home',
            'End'
        ];

        if (keys.indexOf(event.key) === -1) return;

        event.preventDefault();
    }


    function lockGate() {

        /* 새로고침으로 중간에서 시작했을 수 있으니 맨 위로 */
        window.scrollTo(0, 0);

        window.siteLenis?.stop();

        window.addEventListener(
            'wheel',
            onGateWheel,
            { passive: false }
        );

        window.addEventListener(
            'touchmove',
            onGateTouchMove,
            { passive: false }
        );

        window.addEventListener(
            'keydown',
            onGateKey
        );
    }


    function releaseGate() {

        if (gateReleased) return;

        gateReleased = true;

        window.clearTimeout(gateFallback);

        window.removeEventListener(
            'wheel',
            onGateWheel
        );

        window.removeEventListener(
            'touchmove',
            onGateTouchMove
        );

        window.removeEventListener(
            'keydown',
            onGateKey
        );

        window.siteLenis?.start();

        ScrollTrigger.refresh();
    }


    /* Hero 등장 연출의 마지막 장면. 끝나면 잠금을 푼다 */
    function playFinalBeat() {

        if (!centerBottle) {
            releaseGate();
            return;
        }

        gsap.to(
            centerBottle,

            {
                scale: BOTTLE_SCALE,

                duration: BOTTLE_SCALE_TIME,

                ease: 'power2.out',

                onComplete: releaseGate
            }
        );
    }


    lockGate();


    const heroIntro = window.productsHeroIntro;


    if (heroIntro) {

        /*
         * gsap 타임라인은 then 을 갖고 있어서
         * 다 재생되면 여기로 온다
         */
        heroIntro.then(playFinalBeat);

    } else {

        /* 등장 연출이 없으면 바로 마지막 장면만 */
        playFinalBeat();
    }


    /*
     * 안전장치.
     * 어떤 이유로든 연출이 끝나지 않아도 화면이 영영
     * 잠긴 채로 남지 않게 함
     */
    gateFallback =
        window.setTimeout(
            releaseGate,

            ((heroIntro ? heroIntro.duration() : 0) +
                BOTTLE_SCALE_TIME + 2) * 1000
        );


    /* =========================================
       잠금이 풀린 뒤의 스크롤 연출

       Hero 를 고정한 채 다음 콘텐츠가
       아래에서 올라와 덮음
    ========================================= */

    const coverTl =
        gsap.timeline({

            scrollTrigger: {

                trigger: hero,

                start: 'top top',

                /* Hero 고정 시간. 길수록 천천히 진행 */
                end: '+=150%',

                scrub: true,

                /* Hero 고정 */
                pin: true,

                /*
                 * 중요!
                 * pin 공간을 만들지 않음
                 *
                 * → 다음 콘텐츠가 Hero 위로 올라옴
                 */
                pinSpacing: false,

                anticipatePin: 1,

                invalidateOnRefresh: true
            }

        });


    /* =========================================
       덮이는 동안 Hero 만 살짝 어두워짐
    ========================================= */

    if (heroDim) {

        coverTl.to(
            heroDim,

            {
                opacity: 0.3,

                ease: 'none',

                duration: 1
            },

            0
        );

    }


    /* =========================================
       로딩 후 ScrollTrigger 재계산
    ========================================= */

    window.addEventListener(
        'load',

        () => {

            ScrollTrigger.refresh();

        },

        {
            once: true
        }
    );

})();


/* =========================================================
   5. Product Showcase Reveal

   배경만
   ↓
   제목
   ↓
   카테고리
   ↓
   제품 왼쪽부터
   ↓
   VIEW ALL
========================================================= */

(() => {

    const showcase =
        document.querySelector(
            '.product_showcase'
        );


    if (!showcase) return;


    if (
        typeof gsap ===
        'undefined'
    ) {

        console.warn(
            '[product showcase] GSAP이 로드되지 않았습니다.'
        );

        return;
    }


    const title =
        showcase.querySelector(
            '.product_showcase_title'
        );


    const categoryButtons =
        Array.from(
            showcase.querySelectorAll(
                '.category_button'
            )
        );


    const cards =
        Array.from(
            showcase.querySelectorAll(
                '.product_card'
            )
        );


    const viewAll =
        showcase.querySelector(
            '.view_all_wrap'
        );


    const prefersReducedMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;


    if (prefersReducedMotion) {

        gsap.set(
            [
                title,
                ...categoryButtons,
                ...cards,
                viewAll
            ].filter(Boolean),

            {
                opacity: 1,
                y: 0
            }
        );


        return;
    }


    /* =========================================
       초기 상태
       처음엔 배경만 보임
    ========================================= */


    if (title) {

        gsap.set(
            title,

            {
                opacity: 0,

                y: 25
            }
        );

    }


    gsap.set(
        categoryButtons,

        {
            opacity: 0,

            y: 15
        }
    );


    /*
     * 제품은 위치 이동 없이
     * opacity만 fade
     */

    gsap.set(
        cards,

        {
            opacity: 0
        }
    );


    if (viewAll) {

        gsap.set(
            viewAll,

            {
                opacity: 0,

                y: 15
            }
        );

    }


    let hasPlayed = false;


    function playShowcaseAnimation() {

        if (hasPlayed) return;


        hasPlayed = true;


        const revealTl =
            gsap.timeline({

                defaults: {

                    ease:
                        'power2.out'

                }

            });


        /*
         * 넣는 시각은 전부 절대값(초).
         * '-=' 같은 상대값은 앞 tween 이 길어지면 뒤가 통째로
         * 밀려서 전체 길이를 장담할 수 없다.
         *
         * 0.7초 안에 다 나와야 하므로 가장 늦게 끝나는 것이
         * 카드 마지막 장(0.16 + 0.03 x 7 + 0.30 = 0.67초)
         */


        /* =========================================
           1. 제목
        ========================================= */

        if (title) {

            revealTl.to(
                title,

                {
                    opacity: 1,

                    y: 0,

                    duration: 0.32
                },

                0
            );

        }


        /* =========================================
           2. 카테고리
           왼쪽부터
        ========================================= */

        if (
            categoryButtons.length
        ) {

            revealTl.to(
                categoryButtons,

                {
                    opacity: 1,

                    y: 0,

                    duration: 0.28,

                    stagger: 0.04
                },

                0.08
            );

        }


        /* =========================================
           3. 제품
           왼쪽 → 오른쪽
           첫째 줄 → 둘째 줄
        ========================================= */

        if (cards.length) {

            revealTl.to(
                cards,

                {
                    opacity: 1,

                    duration: 0.3,

                    stagger: 0.03
                },

                0.16
            );

        }


        /* =========================================
           4. VIEW ALL
        ========================================= */

        if (viewAll) {

            revealTl.to(
                viewAll,

                {
                    opacity: 1,

                    y: 0,

                    duration: 0.28
                },

                0.38
            );

        }

    }


    /* =========================================
       실제 화면 진입 감지
    ========================================= */

    const observer =
        new IntersectionObserver(

            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        playShowcaseAnimation();


                        observer.unobserve(
                            showcase
                        );

                    }
                );

            },

            {
                /*
                 * Product Showcase가
                 * 약 15% 화면에 보이면 시작
                 */
                threshold: 0.15,

                rootMargin:
                    '0px 0px -5% 0px'
            }

        );


    observer.observe(
        showcase
    );

})();

/* =========================================================
   STARTER KIT MOTION
========================================================= */

(() => {
  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hasGSAP =
    typeof window.gsap !== "undefined";

  if (reduceMotion || !hasGSAP) return;


  const section =
    document.querySelector(".starter_kit");

  if (!section) return;


  const inner =
    section.querySelector(".starter_kit_inner");


  const title =
    section.querySelector(".starter_kit_title");

  const desc =
    section.querySelector(".starter_kit_desc");

  const cta =
    section.querySelector(".starter_kit_cta");

  const character =
    section.querySelector(".starter_kit_character");

  const cards =
    gsap.utils.toArray(
      ".starter_kit_card",
      section
    );

  const best =
    section.querySelector(".starter_kit_best");

  /* =====================================================
     1. 처음 상태
  ===================================================== */

  gsap.set(
    [title, desc, character].filter(Boolean),
    {
      autoAlpha: 0,
      y: 30
    }
  );


  if (cta) {
    gsap.set(cta, {
      autoAlpha: 0,
      y: 24,
      scale: 0.75,
      rotation: -5
    });
  }


  /*
    BEST는 원래 CSS에서 rotate(-12deg)이므로
    최종 위치도 -12도로 맞춰줍니다.
  */
  if (best) {
    gsap.set(best, {
      autoAlpha: 0,
      scale: 1.8,
      rotation: -35
    });
  }



  /* =====================================================
     2. 카드 겹쳐놓기

     첫 번째 카드 = 딸기
     두 번째 = 바나나
     세 번째 = 청포도

     바나나/청포도를 딸기 뒤로 이동
  ===================================================== */

  function stackCards() {

    if (cards.length < 2) return;


    /*
      먼저 카드들을 최종 위치로 초기화한 다음
      실제 좌표를 계산합니다.
    */
    gsap.set(cards, {
      clearProps: "transform"
    });


    const strawberry =
      cards[0];

    const strawberryRect =
      strawberry.getBoundingClientRect();


    cards.slice(1).forEach(
      (card, index) => {

        const cardRect =
          card.getBoundingClientRect();


        const x =
          strawberryRect.left -
          cardRect.left;

        const y =
          strawberryRect.top -
          cardRect.top;


        gsap.set(card, {

          /*
            딸기 카드 바로 뒤로 이동
          */
          x:
            x +
            ((index + 1) * 7),

          y:
            y +
            ((index + 1) * 5),

          scale:
            1 - ((index + 1) * 0.025),

          rotation:
            index === 0
              ? 3
              : 6

        });

      }
    );

  }



  /* =====================================================
     3. 애니메이션
  ===================================================== */

  function playStarterMotion() {

    const tl =
      gsap.timeline({
        defaults: {
          ease: "power3.out"
        }
      });


        /* ---------------------------------------------
     inner 전체가 먼저 오른쪽 → 왼쪽으로 싸악
  --------------------------------------------- */

  if (inner) {

    tl.fromTo(
      inner,
      {
        x: 180,
        autoAlpha: 0
      },
      {
        x: 0,
        autoAlpha: 1,

        duration: 0.4,

        ease: "expo.out"
      }
    );

  }

    /* ---------------------------------------------
       제목
    --------------------------------------------- */

    if (title) {

      tl.to(title, {
        autoAlpha: 1,
        y: 0,

        duration: 0.18
      });

    }



    /* ---------------------------------------------
       설명
    --------------------------------------------- */

    if (desc) {

      tl.to(
        desc,
        {
          autoAlpha: 1,
          y: 0,

          duration: 0.18
        },

        "-=0.10"
      );

    }



    /* ---------------------------------------------
       캐릭터 두둥실
    --------------------------------------------- */

    if (character) {

      tl.to(
        character,
        {
          autoAlpha: 1,

          y: 0,

          duration: 0.22,

          ease: "back.out(1.5)"
        },

        "-=0.10"
      );

    }



    /* ---------------------------------------------
       버튼 통통 등장
    --------------------------------------------- */

    if (cta) {

      tl.to(
        cta,
        {
          autoAlpha: 1,

          y: 0,

          scale: 1.12,

          rotation: 3,

          duration: 0.18,

          ease: "back.out(3)"
        },

        "-=0.14"
      );


      tl.to(
        cta,
        {
          scale: 1,

          rotation: 0,

          duration: 0.07
        },

        "-=0.03"
      );

    }



   /* =================================================
   카드 휘리릭 펼치기

   딸기   : -5deg
   바나나 :  7deg
   청포도 : -14deg
================================================= */

if (cards.length > 1) {

  /* 딸기 카드 */
  tl.to(
    cards[0],
    {
      rotation: -5,

      duration: 0.18,

      ease: "power3.out"
    },

    "-=0.05"
  );


  /* 바나나 카드 */
  tl.to(
    cards[1],
    {
      x: 0,
      y: 8,

      scale: 1,

      rotation: 7,

      duration: 0.28,

      ease: "power4.out"
    },

    "-=0.16"
  );


  /* 청포도 카드 */
  tl.to(
    cards[2],
    {
      x: 0,
      y: 2,

      scale: 1,

      rotation: -14,

      duration: 0.28,

      ease: "power4.out"
    },

    "-=0.22"
  );

}



    /* =================================================
       BEST 도장 쾅!
    ================================================= */

    if (best) {

      tl.to(
        best,
        {
          autoAlpha: 1,

          scale: 0.82,

          rotation: -5,

          duration: 0.13,

          ease: "power4.in"
        },

        "-=0.10"
      );


      tl.to(
        best,
        {
          scale: 1.12,

          rotation: -15,

          duration: 0.08,

          ease: "back.out(4)"
        }
      );


      tl.to(
        best,
        {
          scale: 1,

          rotation: -12,

          duration: 0.06
        }
      );

    }


    /*
      버튼의 inline transform 제거.
      그래야 기존 CSS hover의
      translateY(-2px)가 정상 작동합니다.
    */
    if (cta) {

      tl.set(cta, {
        clearProps: "transform"
      });

    }

  }



  /* =====================================================
     4. 섹션이 약 75% 들어왔을 때 한 번 실행
  ===================================================== */

  const observer =
    new IntersectionObserver(

      (entries, observer) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;


          playStarterMotion();


          observer.unobserve(entry.target);

        });

      },

      {
        threshold: 0.75
      }

    );



  /* =====================================================
     5. 이미지 로딩 후 카드 위치 계산
  ===================================================== */

  function initStarterMotion() {

    stackCards();

    observer.observe(section);

  }


  if (
    document.readyState === "complete"
  ) {

    initStarterMotion();

  } else {

    window.addEventListener(
      "load",
      initStarterMotion,
      {
        once: true
      }
    );

  }

})();
