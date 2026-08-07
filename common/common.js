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

    sideNav.addEventListener('click', (event) => {
        const link = event.target.closest('a');

        if (!link || !sideNav.contains(link)) return;

        const activeItem = link.closest('li');

        sideNavItems.forEach((item) => {
            const isActive = item === activeItem;
            const itemLink = item.querySelector('a');
            const icon = item.querySelector('img');

            item.classList.toggle('is_current', isActive);
            itemLink?.toggleAttribute('aria-current', isActive);
            changeSideNavIcon(icon, isActive ? activeIcon : inactiveIcon);
        });
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

        if (open) input.focus();
        else input.blur();
    }

    toggle.addEventListener('click', () => setOpen(!isOpen()));

    document.addEventListener('click', (event) => {
        if (!isOpen() || search.contains(event.target)) return;

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
