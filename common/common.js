(() => {
    const sideNav = document.querySelector('.side_nav');

    if (!sideNav) return;

    const sideNavItems = sideNav.querySelectorAll('li');
    // 문서 기준 경로. 이 스크립트를 쓰는 페이지는 모두 기능별 폴더 한 단계 안에 있어서 위를 가리킴
    const activeIcon = '../asset/icon/submenu_arrow.svg';
    const inactiveIcon = '../asset/icon/submenu_dot.svg';

    function changeSideNavIcon(icon, iconSource) {
        if (!icon || icon.getAttribute('src') === iconSource) return;

        icon.classList.remove('is_icon_animating');
        void icon.offsetWidth;
        icon.src = iconSource;
        icon.classList.add('is_icon_animating');
    }

    function setCurrent(activeItem) {
        sideNavItems.forEach((item) => {
            const isActive = item === activeItem;
            const itemLink = item.querySelector('a');
            const icon = item.querySelector('img');

            item.classList.toggle('is_current', isActive);
            itemLink?.toggleAttribute('aria-current', isActive);
            changeSideNavIcon(icon, isActive ? activeIcon : inactiveIcon);
        });
    }

    sideNav.addEventListener('click', (event) => {
        const link = event.target.closest('a');

        if (!link || !sideNav.contains(link)) return;

        setCurrent(link.closest('li'));
    });

    // 스크롤 위치를 따라가며 현재 구역을 바꿈. 클릭할 때만 바뀌면 스크롤로 내려가도 처음 항목에 머묾.
    // 화면 위에서 40% 지점을 기준선으로 삼아, 그 선을 지난 구역 중 가장 아래(마지막) 구역을 현재로 봄.
    // 고정(sticky)으로 붙들린 구역은 top 이 0 에 머물지만 뒤따르는 구역이 선을 넘으면 마지막이 바뀌므로 그대로 동작함
    const sections = Array.from(sideNavItems)
        .map((item) => {
            const href = item.querySelector('a')?.getAttribute('href') || '';
            const target = href.startsWith('#') && href.length > 1 ? document.getElementById(href.slice(1)) : null;

            return target ? { item, target } : null;
        })
        .filter(Boolean);

    if (sections.length) {
        let spyFrame = 0;

        const updateCurrent = () => {
            spyFrame = 0;

            const line = window.innerHeight * 0.4;
            let current = sections[0];

            sections.forEach((section) => {
                if (section.target.getBoundingClientRect().top <= line) current = section;
            });

            if (!current.item.classList.contains('is_current')) setCurrent(current.item);
        };

        const requestUpdate = () => {
            if (!spyFrame) spyFrame = window.requestAnimationFrame(updateCurrent);
        };

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        window.addEventListener('load', requestUpdate);
        requestUpdate();
    }
})();

/* 태블릿 헤더의 햄버거 서랍. 여닫는 모습은 css 가 맡고 여기서는 상태 클래스와 aria 만 바꿈 */
(() => {
    const toggle = document.querySelector('[data-nav-toggle]');
    const drawer = document.querySelector('[data-nav-drawer]');

    if (!toggle || !drawer) return;

    const isOpen = () => drawer.classList.contains('is_nav_open');
    const root = document.documentElement;
    const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar']);
    let lockY = 0;

    // 서랍이 열린 동안 뒤 페이지 스크롤을 막되 세로 스크롤바 자리는 남겨 둠.
    // lenis.stop() 만 쓰면 html 이 overflow: clip 이 되어 스크롤바가 사라지고, 화면 폭이 그만큼 넓어져 페이지가 꿀렁임.
    // 그래서 휠·터치·키보드는 여기서 직접 막고, 스크롤바 드래그처럼 막을 수 없는 경로는 위치를 되돌려 붙잡음(common.css 의 .is_nav_scroll_lock)
    const blockEvent = (event) => {
        if (event.target instanceof Element && event.target.closest('[data-nav-drawer]') && event.type === 'keydown') return;

        event.preventDefault();
    };

    const blockKey = (event) => {
        if (scrollKeys.has(event.key)) event.preventDefault();
    };

    const holdPosition = () => {
        if (Math.abs(window.scrollY - lockY) <= 1) return;

        window.scrollTo(0, lockY);
        window.siteLenis?.scrollTo?.(lockY, { immediate: true, force: true });
    };

    function setScrollLock(locked) {
        if (locked === root.classList.contains('is_nav_scroll_lock')) return;

        root.classList.toggle('is_nav_scroll_lock', locked);

        if (locked) {
            lockY = window.scrollY;
            window.addEventListener('wheel', blockEvent, { passive: false });
            window.addEventListener('touchmove', blockEvent, { passive: false });
            window.addEventListener('keydown', blockKey);
            window.addEventListener('scroll', holdPosition, { passive: true });
            return;
        }

        window.removeEventListener('wheel', blockEvent);
        window.removeEventListener('touchmove', blockEvent);
        window.removeEventListener('keydown', blockKey);
        window.removeEventListener('scroll', holdPosition);
        // 닫을 때도 열기 직전 위치로 정확히 되돌려, 열고 닫는 사이 어떤 이유로든 생긴 몇 px 어긋남을 없앰
        holdPosition();
    }

    function setOpen(open) {
        drawer.classList.toggle('is_nav_open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        // 서랍이 열려 있는 동안에는 뒤 페이지가 따라 움직이지 않게 스크롤을 잠금
        // 순서가 중요함. 열 때는 잠금 클래스를 먼저 붙인 뒤 lenis.stop(), 닫을 때는 lenis.start() 를 먼저 한 뒤 클래스를 뗌.
        // 거꾸로 하면 그 사이 잠깐 lenis 의 overflow: clip 만 남아 스크롤바가 사라지고, 폭이 15px 바뀌면서
        // 브라우저의 스크롤 앵커링이 스크롤 위치를 15px 옮겨 놓음(닫고 나면 원래 자리에서 15px 어긋남)
        const keepStopped = !open && root.classList.contains('is_scroll_trap'); // 메인의 스크롤 잠금이 걸려 있으면 lenis 를 멋대로 다시 켜지 않음

        if (open) setScrollLock(true);
        if (!keepStopped) window.siteLenis?.[open ? 'stop' : 'start']?.();
        if (!open) setScrollLock(false);
    }

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    // 스크림을 누르거나 메뉴 항목을 고르면 닫힘
    drawer.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;
        if (event.target.closest('[data-nav-close]') || event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !isOpen()) return;

        setOpen(false);
        toggle.focus();
    });

    // 데스크톱 폭으로 돌아가면 서랍은 의미가 없으므로 정리해 둠
    window.matchMedia('(min-width: 64.0625rem)').addEventListener?.('change', (event) => {
        if (event.matches && isOpen()) setOpen(false);
    });
})();

(() => {
    const search = document.querySelector('[data-site-search]');
    const toggle = search?.querySelector('[data-site-search-toggle]');
    const input = search?.querySelector('[data-site-search-input]');

    if (!search || !toggle || !input) return;

    const isOpen = () => search.classList.contains('is_search_open');

    function setOpen(open) {
        search.classList.toggle('is_search_open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close search' : 'Open search');
        // 닫혀 있을 때는 폭이 0 이라 탭으로 닿지 않게 막아 둠
        if (open) input.removeAttribute('tabindex');
        else input.setAttribute('tabindex', '-1');

        // 햄버거 서랍이 열린 채로 검색이 열리면 두 패널이 겹치므로 서랍을 먼저 닫음
        if (open && document.querySelector('[data-nav-drawer].is_nav_open')) {
            document.querySelector('[data-nav-toggle]')?.click();
        }

        if (open) input.focus();
        else input.blur();
    }

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    document.addEventListener('click', (event) => {
        if (!isOpen() || search.contains(event.target)) return;
        // 위에서 서랍을 닫으려고 보낸 클릭이 검색을 도로 닫지 않게 함
        if (event.target instanceof Element && event.target.closest('[data-nav-toggle]')) return;

        setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !isOpen()) return;

        setOpen(false);
        toggle.focus();
    });
})();

(() => {
    const header = document.querySelector('.site_header');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!header || reducedMotionQuery.matches) return;

    const search = header.querySelector('[data-site-search]');
    const minimumScrollDelta = 8;
    let lastScrollY = Math.max(0, window.scrollY);
    let scrollFrame = 0;

    const setHeaderHidden = (hidden) => header.classList.toggle('is_header_hidden', hidden);
    const isSearchOpen = () => search?.classList.contains('is_search_open');

    function updateHeaderVisibility() {
        scrollFrame = 0;

        const currentScrollY = Math.max(0, window.scrollY);
        const delta = currentScrollY - lastScrollY;
        const revealZone = header.offsetHeight + 8;

        if (currentScrollY <= revealZone || isSearchOpen()) {
            setHeaderHidden(false);
            lastScrollY = currentScrollY;
            return;
        }

        if (Math.abs(delta) < minimumScrollDelta) return;

        setHeaderHidden(delta > 0);
        lastScrollY = currentScrollY;
    }

    function requestHeaderVisibilityUpdate() {
        if (scrollFrame) return;

        scrollFrame = window.requestAnimationFrame(updateHeaderVisibility);
    }

    window.addEventListener('scroll', requestHeaderVisibilityUpdate, { passive: true });
    window.addEventListener('load', updateHeaderVisibility);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) lastScrollY = Math.max(0, window.scrollY);
    });

    if (search && 'MutationObserver' in window) {
        new MutationObserver(() => {
            if (isSearchOpen()) setHeaderHidden(false);
        }).observe(search, { attributes: true, attributeFilter: ['class'] });
    }
})();

/* 푸터 패밀리 사이트: 버튼을 누르면 목록이 위로 열림.
   여닫는 모습은 css 가 맡고 여기서는 상태 클래스와 aria 만 바꿈 */
(() => {
    const root = document.querySelector('[data-family-site]');
    const toggle = root?.querySelector('[data-family-site-toggle]');

    if (!root || !toggle) return;

    function setOpen(isOpen) {
        root.classList.toggle('is_family_open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
    }

    toggle.addEventListener('click', () => {
        setOpen(!root.classList.contains('is_family_open'));
    });

    // 바깥을 누르면 닫힘. 목록 안(버튼 포함)을 누른 경우는 위 토글이 처리함
    document.addEventListener('click', (event) => {
        if (event.target instanceof Element && root.contains(event.target)) return;

        setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !root.classList.contains('is_family_open')) return;

        setOpen(false);
        toggle.focus();
    });
})();

(() => {
    // CDN 이 막히면 그냥 기본 스크롤로 동작하도록 존재 여부를 확인
    if (typeof Lenis === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // autoRaf: 라이브러리가 자체 rAF 루프를 돌림
    // anchors: #id 링크를 부드럽게 이동시킴 (scroll-behavior: smooth 를 대체)
    window.siteLenis = new Lenis({
        autoRaf: true,
        anchors: true,
        lerp: 0.1,
        wheelMultiplier: 1
    });
})();


/* ---------- shared TOP button ---------- */
/* products / aboutbrand / pairing 이 함께 씀.
   조금 내려가면 나타나고, 누르면 맨 위로 돌아감.
   Lenis 가 있으면 그쪽에 맡겨야 부드러운 스크롤과 따로 놀지 않음 */
(() => {
    const topButton = document.querySelector('[data-top-button]');
    if (!topButton) return;

    // 이만큼 내려가야 버튼이 나타남(px)
    const revealPoint = 400;
    let scrollFrame = 0;

    // 푸터 파도 위까지만 내려오게 함. 푸터 윗선에서 이만큼(화면 폭의 5.75%, 2000px 에서 약 115px) 위가 한계선.
    // 파도 이미지는 폭에 비례해 커지므로 한계선도 폭에 비례시킴
    const footer = document.querySelector('.site_footer');
    const footerClearance = 0.0575;

    function updateLift() {
        if (!footer) return;

        const root = document.documentElement;
        const currentLift = parseFloat(topButton.style.getPropertyValue('--top-button-lift')) || 0;
        const buttonHeight = topButton.offsetHeight;
        // 올림이 없을 때 버튼 아랫변의 화면상 y 좌표
        const restingBottom = window.innerHeight - (parseFloat(window.getComputedStyle(topButton).bottom) - currentLift);
        const limit = footer.getBoundingClientRect().top - window.innerWidth * footerClearance;
        const lift = Math.max(0, restingBottom - limit);

        // 아래 변이 한계선에 닿기까지만 올림. 버튼이 화면 위로 밀려 나갈 만큼 올릴 필요는 없음
        topButton.style.setProperty('--top-button-lift', `${Math.min(lift, window.innerHeight - buttonHeight)}px`);
        void root;
    }

    function updateTopButton() {
        scrollFrame = 0;
        topButton.classList.toggle('is_visible', window.scrollY > revealPoint);
        updateLift();
    }

    // 스크롤마다 계산하지 않고 한 프레임에 한 번만
    function handleScroll() {
        if (scrollFrame) return;
        scrollFrame = window.requestAnimationFrame(updateTopButton);
    }

    function handleTopClick() {
        if (window.siteLenis) {
            window.siteLenis.scrollTo(0);
            return;
        }

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    topButton.addEventListener('click', handleTopClick);

    updateTopButton();
})();
