(() => {
    const sideNav = document.querySelector('.side_nav');

    if (!sideNav) return;

    const sideNavItems = sideNav.querySelectorAll('li');
    const activeIcon = 'asset/icon/submenu_arrow.svg';
    const inactiveIcon = 'asset/icon/submenu_dot.svg';

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
    const siteLogo = document.querySelector('.site_logo');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!siteLogo) return;

    siteLogo.addEventListener('click', () => {
        if (reducedMotionQuery.matches) return;

        siteLogo.classList.remove('is_dot_bouncing');
        void siteLogo.offsetWidth;
        siteLogo.classList.add('is_dot_bouncing');
    });

    siteLogo.addEventListener('animationend', (event) => {
        if (event.animationName === 'logo_dot_bounce') {
            siteLogo.classList.remove('is_dot_bouncing');
        }
    });
})();
