/* 사이트 안에서 다른 페이지로 갈 때 화면을 배경색으로 덮은 뒤에 이동시킴.
   덮개를 걷어 내며 여는 쪽(페이드 인)은 page_transition.css 가 css 만으로 처리하므로
   여기서는 나가는 쪽만 맡는다. 다른 페이지로 넘겨야 할 때는 window.sitePageTransition.leaveTo 를 쓸 수 있음 */
(() => {
    const root = document.documentElement;
    // css 의 page_transition_out 과 같은 값. 다 덮인 뒤에 이동해야 화면이 툭 끊기지 않음
    const leaveDuration = 420;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let isLeaving = false;

    function leaveTo(url, { replace = false } = {}) {
        // 이동이 시작된 뒤에 또 눌러도 덮개가 다시 그려지지 않도록 한 번만 받음
        if (isLeaving) return;

        isLeaving = true;

        const go = () => (replace ? window.location.replace(url) : window.location.assign(url));

        if (reducedMotionQuery.matches) {
            go();
            return;
        }

        root.classList.add('is_page_leaving');
        window.setTimeout(go, leaveDuration);
    }

    window.sitePageTransition = { leaveTo };

    /* 덮개를 걷어 내는 일은 css 가 맡지만, 애니메이션이 아예 걸리지 않는 환경이라면
       화면이 배경색으로 가린 채 멈추므로 그때는 덮개를 바로 떼어 냄.
       (탭이 뒤에 있어 시작이 미뤄진 경우는 애니메이션이 있으므로 여기서 건드리지 않고
        화면이 보이는 순간 제대로 걷힘) */
    const hasEnterAnimation = () =>
        typeof document.getAnimations === 'function' &&
        document.getAnimations().some((animation) => animation.animationName === 'page_transition_in');

    if (!hasEnterAnimation()) root.classList.add('is_page_entered');

    // 뒤로 가기로 되돌아오면 브라우저가 화면을 그대로 되살려서 덮개가 덮인 채 남으므로 떼어 냄
    window.addEventListener('pageshow', () => {
        isLeaving = false;
        root.classList.remove('is_page_leaving');
    });

    document.addEventListener('click', (event) => {
        // 링크가 스스로 처리한 클릭(모달 열기 등)은 건드리지 않음
        if (event.defaultPrevented) return;
        // 새 탭·새 창·다운로드로 여는 경우는 브라우저에 맡김
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

        const link = event.target instanceof Element ? event.target.closest('a[href]') : null;

        if (!link || link.hasAttribute('download')) return;
        if (link.target && link.target !== '_self') return;

        const href = link.getAttribute('href');

        // 같은 페이지 안에서 움직이는 링크(#으로 시작)와 메일·전화 등 다른 방식은 그대로 둠
        if (!href || href.startsWith('#')) return;
        if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^https?:/i.test(href)) return;

        let url;

        try {
            url = new URL(link.href, window.location.href);
        } catch {
            return;
        }

        // 바깥 사이트로 나가는 링크는 전환할 화면이 없으므로 그대로 둠
        if (url.origin !== window.location.origin) return;
        // 주소는 같고 #만 다른 링크는 문서 안에서 스크롤만 하므로 전환하지 않음
        if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

        event.preventDefault();
        leaveTo(url.href);
    });
})();
