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


    const cravingPlaceholders = [
        'What about “Makgeolli”?',
        'How about “Draft Makgeolli”?',
        '“Rice Makgeolli” today?',
        'Craving “Strawberry Makgeolli”?',
        'How about “Bekseju”?',
        '“Yedam” today?',
        'What about “Ryeo Premium Soju”?',
        'How about “Charmsoon Soju”?'
    ];


    function updateCravingPlaceholder() {
        if (!searchInput) return;

        const index = Math.floor(
            Math.random() * cravingPlaceholders.length
        );

        searchInput.placeholder = cravingPlaceholders[index];
    }


    updateCravingPlaceholder();

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            updateCravingPlaceholder();
        }
    });


    const emptyMessage =
        document.querySelector('[data-product-empty]');


    const viewAllButton =
        document.querySelector('[data-view-all]');


    const viewDetailsButton =
        document.querySelector('[data-view-details]');


    const tabletCarousel =
        document.querySelector(
            '[data-tablet-product-carousel]'
        );


    const tabletPreviousButton =
        document.querySelector(
            '[data-tablet-product-previous]'
        );


    const tabletNextButton =
        document.querySelector(
            '[data-tablet-product-next]'
        );


    const tabletPagination =
        document.querySelector(
            '[data-tablet-product-pagination]'
        );


    const mobilePagination =
        document.querySelector(
            '[data-mobile-product-pagination]'
        );


    const tabletCarouselQuery =
        window.matchMedia(
            '(min-width: 768px) and (max-width: 1024px)'
        );


    const mobileCarouselQuery =
        window.matchMedia(
            '(max-width: 767px)'
        );


    const TABLET_PRODUCTS_PER_PAGE = 4;


    const MOBILE_PRODUCTS_PER_PAGE = 4;


    let tabletPageIndex = 0;

    let tabletVisibleSignature = '';

    let tabletCarouselFrame = 0;


    let mobilePageIndex = 0;

    let mobileVisibleSignature = '';

    let mobilePageTransitioning = false;

    let mobilePageTransitionVersion = 0;

    let isCategoryMenuOpen = false;

    let categoryViewportWidth = window.innerWidth;

    const showcase =
        document.getElementById('product_showcase');


    const state = {
        category: 'all',
        experience: '',
        keyword: ''
    };


    /* -----------------------------------------------------
       준비중 안내 (작은 반투명 팝업)

       BEKSEJU & YEDAM / SOJU / VIEW ALL 처럼
       아직 보여줄 제품이 없는 버튼에서 부름
    ----------------------------------------------------- */

    const comingSoonToast =
        document.querySelector(
            '[data-coming-soon-toast]'
        );


    const COMING_SOON_MESSAGE =
        'Products coming soon';


    let comingSoonTimer = 0;


    function showComingSoon() {

        if (!comingSoonToast) return;


        window.clearTimeout(
            comingSoonTimer
        );


        /*
          aria-live 는 글자가 바뀔 때 읽어주므로
          이미 떠 있으면 한 번 비웠다가 다시 넣음
        */
        comingSoonToast.textContent = '';

        comingSoonToast.textContent =
            COMING_SOON_MESSAGE;


        comingSoonToast.classList.add(
            'is_visible'
        );


        comingSoonTimer =
            window.setTimeout(
                () => {

                    comingSoonToast
                        .classList
                        .remove('is_visible');

                },
                1800
            );
    }


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
            state.category !== 'all' &&
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

        cancelMobilePageTransition();

        let visibleCount = 0;

        const visibleCards = [];


        cards.forEach((card) => {

            const isVisible =
                matchesCard(card);


            card.hidden = !isVisible;


            if (isVisible) {
                visibleCount += 1;

                visibleCards.push(card);
            }

        });


        if (emptyMessage) {
            emptyMessage.hidden =
                visibleCount > 0;
        }


        if (mobileCarouselQuery.matches) {

            renderMobileCarousel(
                visibleCards
            );

            return;
        }


        resetMobileCarousel();


        renderTabletCarousel(
            visibleCards
        );
    }


    function setTabletCardVisibility(
        card,
        isPageHidden
    ) {

        card.classList.toggle(
            'is_tablet_page_hidden',
            isPageHidden
        );


        if ('inert' in card) {
            card.inert = isPageHidden;
        }


        if (isPageHidden) {
            card.setAttribute(
                'aria-hidden',
                'true'
            );

            return;
        }


        card.removeAttribute('aria-hidden');
    }


    function renderTabletPagination(
        pageCount
    ) {

        if (!tabletPagination) return;


        tabletPagination.replaceChildren();


        for (
            let pageIndex = 0;
            pageIndex < pageCount;
            pageIndex += 1
        ) {

            const button =
                document.createElement('button');


            const isActive =
                pageIndex === tabletPageIndex;


            button.type = 'button';

            button.className =
                'tablet_product_page_dot';

            button.classList.toggle(
                'is_active',
                isActive
            );

            button.dataset.tabletProductPage =
                String(pageIndex);

            button.setAttribute(
                'aria-label',
                `Show product page ${pageIndex + 1}`
            );

            button.setAttribute(
                'aria-current',
                String(isActive)
            );


            tabletPagination.append(button);
        }
    }


    function renderTabletCarousel(
        visibleCards
    ) {

        if (!tabletCarousel) return;


        const isTablet =
            tabletCarouselQuery.matches;


        if (!isTablet) {

            cards.forEach((card) => {
                setTabletCardVisibility(
                    card,
                    false
                );
            });


            tabletCarousel.classList.remove(
                'has_tablet_pages'
            );


            if (tabletPreviousButton) {
                tabletPreviousButton.hidden = true;
            }


            if (tabletNextButton) {
                tabletNextButton.hidden = true;
            }


            if (tabletPagination) {
                tabletPagination.hidden = true;
                tabletPagination.replaceChildren();
            }


            return;
        }


        const visibleSignature =
            visibleCards
                .map(
                    (card) =>
                        card.dataset.product || ''
                )
                .join('|');


        if (
            visibleSignature !==
            tabletVisibleSignature
        ) {
            tabletPageIndex = 0;
            tabletVisibleSignature = visibleSignature;
        }


        const pageCount = Math.max(
            1,
            Math.ceil(
                visibleCards.length /
                TABLET_PRODUCTS_PER_PAGE
            )
        );


        tabletPageIndex = Math.min(
            tabletPageIndex,
            pageCount - 1
        );


        const hasMultiplePages =
            pageCount > 1;


        cards.forEach((card) => {

            const visibleIndex =
                visibleCards.indexOf(card);


            const isPageHidden =
                visibleIndex >= 0 &&
                Math.floor(
                    visibleIndex /
                    TABLET_PRODUCTS_PER_PAGE
                ) !== tabletPageIndex;


            setTabletCardVisibility(
                card,
                isPageHidden
            );
        });


        tabletCarousel.classList.toggle(
            'has_tablet_pages',
            hasMultiplePages
        );


        if (tabletPreviousButton) {
            tabletPreviousButton.hidden =
                !hasMultiplePages;

            tabletPreviousButton.disabled =
                tabletPageIndex === 0;
        }


        if (tabletNextButton) {
            tabletNextButton.hidden =
                !hasMultiplePages;

            tabletNextButton.disabled =
                tabletPageIndex === pageCount - 1;
        }


        if (tabletPagination) {
            tabletPagination.hidden =
                !hasMultiplePages;

            if (hasMultiplePages) {
                renderTabletPagination(pageCount);
            } else {
                tabletPagination.replaceChildren();
            }
        }
    }


    function setMobileCardVisibility(
        card,
        isPageHidden
    ) {

        card.classList.toggle(
            'is_mobile_page_hidden',
            isPageHidden
        );


        if ('inert' in card) {
            card.inert = isPageHidden;
        }


        if (isPageHidden) {
            card.setAttribute(
                'aria-hidden',
                'true'
            );

            return;
        }


        card.removeAttribute('aria-hidden');
    }


    function resetMobileCarousel() {

        cancelMobilePageTransition();

        cards.forEach((card) => {
            setMobileCardVisibility(
                card,
                false
            );
        });


        grid.classList.remove(
            'is_mobile_dragging'
        );


        grid.removeAttribute('tabindex');
        grid.removeAttribute('aria-label');


        mobilePageIndex = 0;
        mobileVisibleSignature = '';


        if (!mobilePagination) return;


        mobilePagination.hidden = true;
        mobilePagination.replaceChildren();
    }


    function renderMobilePagination(
        visibleCards
    ) {

        if (!mobilePagination) return;


        mobilePagination.replaceChildren();


        const pageCount = Math.ceil(
            visibleCards.length /
            MOBILE_PRODUCTS_PER_PAGE
        );


        for (
            let pageIndex = 0;
            pageIndex < pageCount;
            pageIndex += 1
        ) {

            const button =
                document.createElement('button');


            const firstProductIndex =
                pageIndex *
                MOBILE_PRODUCTS_PER_PAGE;


            const isActive =
                pageIndex === mobilePageIndex;


            button.type = 'button';

            button.className =
                'mobile_product_page_dot';

            button.classList.toggle(
                'is_active',
                isActive
            );

            button.dataset.mobileProductPage =
                String(pageIndex);

            const productName =
                visibleCards[firstProductIndex]
                    ?.querySelector('.product_name')
                    ?.textContent
                    ?.trim() ||
                `product ${pageIndex + 1}`;


            button.setAttribute(
                'aria-label',
                `Show product group starting with ${productName}`
            );

            if (isActive) {
                button.setAttribute(
                    'aria-current',
                    'page'
                );
            }


            mobilePagination.append(button);
        }
    }


    function updateMobilePagination() {

        if (!mobilePagination) return;


        mobilePagination
            .querySelectorAll('[data-mobile-product-page]')
            .forEach((button, index) => {

                const isActive =
                    index === mobilePageIndex;


                button.classList.toggle(
                    'is_active',
                    isActive
                );


                if (isActive) {
                    button.setAttribute(
                        'aria-current',
                        'page'
                    );

                    return;
                }


                button.removeAttribute('aria-current');
            });
    }


    function getMobileCardScrollStart(card) {

        return (
            grid.scrollLeft +
            card.getBoundingClientRect().left -
            grid.getBoundingClientRect().left
        );
    }


    function scrollToMobileProduct(
        visibleCards,
        productIndex
    ) {

        const target =
            visibleCards[productIndex];


        if (!target) return;


        const reduceMotion =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;


        grid.scrollTo({
            left: getMobileCardScrollStart(target),
            behavior: reduceMotion
                ? 'auto'
                : 'smooth'
        });
    }


    function syncMobileCarouselPosition() {

        if (!mobileCarouselQuery.matches) return;


        const visibleCards =
            cards.filter((card) => !card.hidden);


        if (!visibleCards.length) return;


        const starts =
            visibleCards.map(
                getMobileCardScrollStart
            );


        const nearestIndex =
            starts.reduce(
                (nearest, start, index) => (
                    Math.abs(
                        start - grid.scrollLeft
                    ) < Math.abs(
                        starts[nearest] - grid.scrollLeft
                    )
                        ? index
                        : nearest
                ),
                0
            );


        if (nearestIndex === mobilePageIndex) return;


        mobilePageIndex = nearestIndex;
        updateMobilePagination();
    }


    function scheduleMobileCarouselSync() {

        if (mobileCarouselFrame) return;


        mobileCarouselFrame =
            window.requestAnimationFrame(() => {
                mobileCarouselFrame = 0;
                syncMobileCarouselPosition();
            });
    }


    function getVisibleMobileCards() {

        return cards.filter(
            (card) => !card.hidden
        );
    }


    function createMobileProductDragScroller(element) {

        let isPointerDown = false;
        let isDragging = false;
        let pointerId = null;
        let startX = 0;
        let startY = 0;
        let startScrollLeft = 0;
        let pendingScrollLeft = null;
        let dragFrame = 0;
        let suppressClick = false;


        const applyPendingScroll = () => {

            if (pendingScrollLeft !== null) {
                element.scrollLeft = pendingScrollLeft;
                pendingScrollLeft = null;
            }


            dragFrame = 0;
        };


        const flushPendingScroll = () => {

            if (dragFrame) {
                window.cancelAnimationFrame(dragFrame);
                dragFrame = 0;
            }


            applyPendingScroll();
        };


        const releasePointer = () => {

            const capturedPointerId = pointerId;


            pointerId = null;
            isPointerDown = false;
            isDragging = false;
            element.classList.remove('is_mobile_dragging');

            if (
                capturedPointerId !== null &&
                element.hasPointerCapture(capturedPointerId)
            ) {
                element.releasePointerCapture(capturedPointerId);
            }
        };


        element.addEventListener('pointerdown', (event) => {

            if (!mobileCarouselQuery.matches) return;


            if (
                event.pointerType === 'mouse' &&
                event.button !== 0
            ) {
                return;
            }


            if (
                element.scrollWidth <=
                element.clientWidth + 1
            ) {
                return;
            }


            isPointerDown = true;
            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            startScrollLeft = element.scrollLeft;


            element.setPointerCapture(event.pointerId);
        });


        element.addEventListener('pointermove', (event) => {

            if (
                !isPointerDown ||
                event.pointerId !== pointerId
            ) {
                return;
            }


            const distanceX =
                event.clientX - startX;


            const distanceY =
                event.clientY - startY;


            if (!isDragging) {

                if (
                    Math.max(
                        Math.abs(distanceX),
                        Math.abs(distanceY)
                    ) < 6
                ) {
                    return;
                }


                if (
                    Math.abs(distanceY) >
                    Math.abs(distanceX)
                ) {
                    releasePointer();
                    return;
                }


                isDragging = true;
                element.classList.add('is_mobile_dragging');
            }


            event.preventDefault();
            pendingScrollLeft =
                startScrollLeft - distanceX;


            if (!dragFrame) {
                dragFrame = window.requestAnimationFrame(
                    applyPendingScroll
                );
            }
        });


        const finishDragging = (event) => {

            if (
                !isPointerDown ||
                event.pointerId !== pointerId
            ) {
                return;
            }


            const didDrag = isDragging;


            flushPendingScroll();
            releasePointer();


            if (!didDrag) return;


            suppressClick = true;


            window.setTimeout(() => {
                suppressClick = false;
            }, 0);
        };


        element.addEventListener('pointerup', finishDragging);
        element.addEventListener('pointercancel', finishDragging);
        element.addEventListener('lostpointercapture', finishDragging);


        element.addEventListener(
            'click',
            (event) => {

                if (!suppressClick) return;


                event.preventDefault();
                event.stopPropagation();
                suppressClick = false;
            },
            true
        );


        element.addEventListener('dragstart', (event) => {

            if (!mobileCarouselQuery.matches) return;


            event.preventDefault();
        });


        element.addEventListener(
            'scroll',
            scheduleMobileCarouselSync,
            { passive: true }
        );


        element.addEventListener('keydown', (event) => {

            if (!mobileCarouselQuery.matches) return;


            const direction =
                event.key === 'ArrowRight'
                    ? 1
                    : event.key === 'ArrowLeft'
                        ? -1
                        : 0;


            if (!direction) return;


            const visibleCards =
                getVisibleMobileCards();


            if (!visibleCards.length) return;


            const starts =
                visibleCards.map(
                    getMobileCardScrollStart
                );


            const currentIndex =
                starts.reduce(
                    (nearest, start, index) => (
                        Math.abs(
                            start - grid.scrollLeft
                        ) < Math.abs(
                            starts[nearest] - grid.scrollLeft
                        )
                            ? index
                            : nearest
                    ),
                    0
                );


            const nextIndex = Math.max(
                0,
                Math.min(
                    visibleCards.length - 1,
                    currentIndex + direction
                )
            );


            if (nextIndex === currentIndex) return;


            event.preventDefault();
            scrollToMobileProduct(
                visibleCards,
                nextIndex
            );
        });
    }


    function cancelMobilePageTransition() {

        mobilePageTransitionVersion += 1;
        mobilePageTransitioning = false;

        grid.classList.remove(
            'is_mobile_page_leaving',
            'is_mobile_page_entering'
        );

        grid.style.removeProperty('--mobile-page-direction');
    }


    function changeMobileProductPage(
        visibleCards,
        nextPageIndex,
        direction,
        scrollToList = false
    ) {

        const pageCount = Math.max(
            1,
            Math.ceil(
                visibleCards.length /
                MOBILE_PRODUCTS_PER_PAGE
            )
        );


        const targetPageIndex = Math.max(
            0,
            Math.min(
                pageCount - 1,
                nextPageIndex
            )
        );


        if (
            mobilePageTransitioning ||
            targetPageIndex === mobilePageIndex
        ) {
            return;
        }


        const reduceMotion =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;


        if (reduceMotion) {
            mobilePageIndex = targetPageIndex;
            renderMobileCarousel(visibleCards);

            if (scrollToList) {
                scrollToMobileProductList(reduceMotion);
            }

            return;
        }


        mobilePageTransitioning = true;

        const transitionVersion =
            ++mobilePageTransitionVersion;


        grid.style.setProperty(
            '--mobile-page-direction',
            String(direction)
        );


        grid.classList.remove(
            'is_mobile_page_entering'
        );


        grid.classList.add(
            'is_mobile_page_leaving'
        );


        window.setTimeout(() => {

            if (
                transitionVersion !== mobilePageTransitionVersion ||
                !mobileCarouselQuery.matches
            ) {
                return;
            }

            mobilePageIndex = targetPageIndex;
            renderMobileCarousel(visibleCards);

            if (scrollToList) {
                scrollToMobileProductList(reduceMotion);
            }


            grid.classList.remove(
                'is_mobile_page_leaving'
            );


            grid.classList.add(
                'is_mobile_page_entering'
            );


            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {

                    if (
                        transitionVersion !== mobilePageTransitionVersion
                    ) {
                        return;
                    }

                    grid.classList.remove(
                        'is_mobile_page_entering'
                    );


                    window.setTimeout(() => {

                        if (
                            transitionVersion === mobilePageTransitionVersion
                        ) {
                            mobilePageTransitioning = false;
                        }
                    }, 220);
                });
            });
        }, 160);
    }


    function scrollToMobileProductList(reduceMotion) {

        if (!mobileCarouselQuery.matches) return;

        /* 마지막 페이지의 카드 수가 줄어든 높이를 Lenis에도 즉시 반영. */
        window.siteLenis?.resize?.();

        const headerHeight =
            document.querySelector('.site_header')
                ?.getBoundingClientRect().height || 0;

        const scrollMargin = parseFloat(
            getComputedStyle(showcase || grid).scrollMarginTop
        ) || 0;

        const targetTop = Math.max(
            0,
            grid.getBoundingClientRect().top + window.scrollY -
            Math.max(scrollMargin, headerHeight + 16)
        );

        grid.focus({ preventScroll: true });

        if (window.siteLenis) {
            window.siteLenis.scrollTo(targetTop, {
                immediate: reduceMotion,
                force: true
            });
        } else {
            window.scrollTo({
                top: targetTop,
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
        }
    }


    function createMobileProductPageSwipe(element) {

        let isPointerDown = false;
        let isDragging = false;
        let pointerId = null;
        let startX = 0;
        let startY = 0;
        let lastDistanceX = 0;
        let suppressClick = false;


        const releasePointer = () => {

            const capturedPointerId = pointerId;


            pointerId = null;
            isPointerDown = false;
            isDragging = false;


            element.classList.remove('is_mobile_dragging');
            element.style.removeProperty('--mobile-drag-offset');


            if (
                capturedPointerId !== null &&
                element.hasPointerCapture(capturedPointerId)
            ) {
                element.releasePointerCapture(capturedPointerId);
            }
        };


        element.addEventListener('pointerdown', (event) => {

            if (
                !mobileCarouselQuery.matches ||
                mobilePageTransitioning
            ) {
                return;
            }


            if (
                event.pointerType === 'mouse' &&
                event.button !== 0
            ) {
                return;
            }


            isPointerDown = true;
            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            lastDistanceX = 0;


            element.setPointerCapture(event.pointerId);
        });


        element.addEventListener('pointermove', (event) => {

            if (
                !isPointerDown ||
                event.pointerId !== pointerId
            ) {
                return;
            }


            const distanceX = event.clientX - startX;
            const distanceY = event.clientY - startY;


            if (!isDragging) {

                if (
                    Math.max(
                        Math.abs(distanceX),
                        Math.abs(distanceY)
                    ) < 6
                ) {
                    return;
                }


                if (
                    Math.abs(distanceY) >
                    Math.abs(distanceX)
                ) {
                    releasePointer();
                    return;
                }


                isDragging = true;
                element.classList.add('is_mobile_dragging');
            }


            lastDistanceX = distanceX;


            element.style.setProperty(
                '--mobile-drag-offset',
                `${Math.max(-28, Math.min(28, distanceX * 0.14))}px`
            );


            event.preventDefault();
        });


        const finishDragging = (event) => {

            if (
                !isPointerDown ||
                event.pointerId !== pointerId
            ) {
                return;
            }


            const didDrag = isDragging;
            const direction =
                lastDistanceX < 0
                    ? 1
                    : -1;


            releasePointer();


            if (!didDrag) return;


            suppressClick = true;


            window.setTimeout(() => {
                suppressClick = false;
            }, 0);


            if (Math.abs(lastDistanceX) < 40) return;


            changeMobileProductPage(
                getVisibleMobileCards(),
                mobilePageIndex + direction,
                direction
            );
        };


        element.addEventListener('pointerup', finishDragging);
        element.addEventListener('pointercancel', finishDragging);
        element.addEventListener('lostpointercapture', finishDragging);


        element.addEventListener(
            'click',
            (event) => {

                if (!suppressClick) return;


                event.preventDefault();
                event.stopPropagation();
                suppressClick = false;
            },
            true
        );


        element.addEventListener('dragstart', (event) => {

            if (!mobileCarouselQuery.matches) return;


            event.preventDefault();
        });


        element.addEventListener('keydown', (event) => {

            if (!mobileCarouselQuery.matches) return;


            const direction =
                event.key === 'ArrowRight'
                    ? 1
                    : event.key === 'ArrowLeft'
                        ? -1
                        : 0;


            if (!direction) return;


            event.preventDefault();


            changeMobileProductPage(
                getVisibleMobileCards(),
                mobilePageIndex + direction,
                direction
            );
        });
    }


    createMobileProductPageSwipe(grid);


    function renderMobileCarousel(
        visibleCards
    ) {

        if (!mobileCarouselQuery.matches) {
            resetMobileCarousel();
            return;
        }


        /* A previous tablet page must not leave cards inert on mobile. */
        cards.forEach((card) => {
            setTabletCardVisibility(
                card,
                false
            );
        });


        const visibleSignature =
            visibleCards
                .map(
                    (card) =>
                        card.dataset.product || ''
                )
                .join('|');


        const hasNewMobileProducts =
            visibleSignature !==
            mobileVisibleSignature;


        if (hasNewMobileProducts) {
            mobilePageIndex = 0;
            mobileVisibleSignature = visibleSignature;
        }


        const pageCount = Math.max(
            1,
            Math.ceil(
                visibleCards.length /
                MOBILE_PRODUCTS_PER_PAGE
            )
        );


        mobilePageIndex = Math.min(
            mobilePageIndex,
            pageCount - 1
        );


        const hasMultiplePages =
            pageCount > 1;


        cards.forEach((card) => {

            const visibleIndex =
                visibleCards.indexOf(card);


            const isPageHidden =
                visibleIndex >= 0 &&
                Math.floor(
                    visibleIndex /
                    MOBILE_PRODUCTS_PER_PAGE
                ) !== mobilePageIndex;


            setMobileCardVisibility(
                card,
                isPageHidden
            );
        });


        grid.tabIndex = 0;


        grid.setAttribute(
            'aria-label',
            'Product carousel. Drag or swipe horizontally to browse products.'
        );


        if (!mobilePagination) return;


        mobilePagination.hidden =
            !hasMultiplePages;


        if (hasMultiplePages) {
            renderMobilePagination(visibleCards);
        } else {
            mobilePagination.replaceChildren();
        }
    }


    function scheduleTabletCarouselRender() {

        if (tabletCarouselFrame) return;


        tabletCarouselFrame =
            window.requestAnimationFrame(
                () => {

                    tabletCarouselFrame = 0;


                    renderProducts();
                }
            );
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


        /* 모바일에서는 선택된 버튼이 카테고리 펼치기 버튼을 겸함. */
        if (
            mobileCarouselQuery.matches &&
            button.classList.contains('is_active')
        ) {
            setCategoryMenuOpen(!isCategoryMenuOpen);
            return;
        }


        /* 준비중 카테고리는 거르지 않고 안내만 띄움 */
        if (
            button.hasAttribute('data-coming-soon')
        ) {
            showComingSoon();
            return;
        }


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


        setCategoryMenuOpen(false, mobileCarouselQuery.matches);


        renderProducts();
    }


    function syncCategoryMenu() {

        if (!categoryList) return;

        const isMobile = mobileCarouselQuery.matches;

        categoryList.classList.toggle(
            'is_open',
            isMobile && isCategoryMenuOpen
        );

        categoryButtons.forEach((button) => {

            if (isMobile && button.classList.contains('is_active')) {
                button.setAttribute(
                    'aria-expanded',
                    String(isCategoryMenuOpen)
                );
            } else {
                button.removeAttribute('aria-expanded');
            }
        });
    }


    function setCategoryMenuOpen(isOpen, returnFocus = false) {

        isCategoryMenuOpen =
            mobileCarouselQuery.matches && isOpen;

        syncCategoryMenu();

        if (returnFocus) {
            categoryButtons.find((button) =>
                button.classList.contains('is_active')
            )?.focus({ preventScroll: true });
        }
    }


    function handleCategoryKeydown(event) {

        if (!mobileCarouselQuery.matches) return;

        const button = event.target.closest('.category_button');

        if (!button) return;

        if (event.key === 'Escape' && isCategoryMenuOpen) {
            event.preventDefault();
            setCategoryMenuOpen(false, true);
            return;
        }

        const index = categoryButtons.indexOf(button);
        let nextIndex = index;

        if (event.key === 'ArrowDown') {
            nextIndex = (index + 1) % categoryButtons.length;
        } else if (event.key === 'ArrowUp') {
            nextIndex =
                (index - 1 + categoryButtons.length) %
                categoryButtons.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = categoryButtons.length - 1;
        } else {
            return;
        }

        event.preventDefault();
        setCategoryMenuOpen(true);
        categoryButtons[nextIndex]?.focus({ preventScroll: true });
    }


    function handleCategoryViewportChange() {

        if (categoryViewportWidth !== window.innerWidth) {
            categoryViewportWidth = window.innerWidth;

            setCategoryMenuOpen(
                false,
                mobileCarouselQuery.matches &&
                categoryList?.contains(document.activeElement)
            );
        } else {
            syncCategoryMenu();
        }
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

        /* 준비중 표시가 붙어 있으면 목록을 바꾸지 않고 안내만 띄움 */
        if (
            viewAllButton?.hasAttribute('data-coming-soon')
        ) {
            showComingSoon();
            return;
        }


        state.category = 'all';
        state.experience = '';
        state.keyword = '';


        categoryButtons.forEach(
            (item) => {

                setPressed(
                    item,
                    item.dataset.category === 'all'
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


        setCategoryMenuOpen(false);


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


        setCategoryMenuOpen(false);


        renderProducts();


        if (!showcase) return;


        const reduceMotion =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;


        /*
            도착 위치를 숫자로 직접 계산.

            제품이 8개 → 3개로 줄면 페이지가 짧아져서
            브라우저가 스크롤 위치를 순간 끌어올리는데,
            Lenis 는 그걸 아직 모른 채 예전 위치로 계산해서
            제품 목록보다 아래(제목이 잘린 곳)에 멈췄었음.

            섹션 위 여백은 공통 CSS 의 scroll-margin-top
            (고정 헤더 높이 + 여유) 을 그대로 따름.
        */
        const scrollMargin =
            parseFloat(
                getComputedStyle(showcase).scrollMarginTop
            ) || 0;

        const targetTop =
            showcase.getBoundingClientRect().top +
            window.scrollY -
            scrollMargin;


        if (window.siteLenis) {

            window.siteLenis.scrollTo(
                targetTop,
                {
                    immediate: reduceMotion,
                    force: true
                }
            );

        } else {

            window.scrollTo({
                top: targetTop,
                behavior: reduceMotion
                    ? 'auto'
                    : 'smooth'
            });

        }
    }


    categoryList?.addEventListener(
        'click',
        handleCategoryClick
    );


    categoryList?.addEventListener(
        'keydown',
        handleCategoryKeydown
    );


    document.addEventListener('click', (event) => {
        if (isCategoryMenuOpen && !categoryList?.contains(event.target)) {
            setCategoryMenuOpen(false);
        }
    });


    document.addEventListener('focusin', (event) => {
        if (isCategoryMenuOpen && !categoryList?.contains(event.target)) {
            setCategoryMenuOpen(false);
        }
    });


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


    tabletPreviousButton?.addEventListener(
        'click',
        () => {

            if (
                !tabletCarouselQuery.matches ||
                tabletPageIndex === 0
            ) {
                return;
            }


            tabletPageIndex -= 1;


            renderTabletCarousel(
                cards.filter(
                    (card) => !card.hidden
                )
            );
        }
    );


    tabletNextButton?.addEventListener(
        'click',
        () => {

            if (!tabletCarouselQuery.matches) {
                return;
            }


            tabletPageIndex += 1;


            renderTabletCarousel(
                cards.filter(
                    (card) => !card.hidden
                )
            );
        }
    );


    tabletPagination?.addEventListener(
        'click',
        (event) => {

            const button =
                event.target.closest(
                    '[data-tablet-product-page]'
                );


            if (
                !button ||
                !tabletCarouselQuery.matches
            ) {
                return;
            }


            tabletPageIndex = Number(
                button.dataset.tabletProductPage
            );


            renderTabletCarousel(
                cards.filter(
                    (card) => !card.hidden
                )
            );
        }
    );


    mobilePagination?.addEventListener(
        'click',
        (event) => {

            const button =
                event.target.closest(
                    '[data-mobile-product-page]'
                );


            if (
                !button ||
                !mobileCarouselQuery.matches
            ) {
                return;
            }


            const targetPageIndex = Number(
                button.dataset.mobileProductPage
            );


            const visibleCards =
                getVisibleMobileCards();


            changeMobileProductPage(
                visibleCards,
                targetPageIndex,
                targetPageIndex > mobilePageIndex
                    ? 1
                    : -1,
                true
            );
        }
    );


    if (
        typeof tabletCarouselQuery.addEventListener ===
        'function'
    ) {
        tabletCarouselQuery.addEventListener(
            'change',
            scheduleTabletCarouselRender
        );
    } else {
        tabletCarouselQuery.addListener(
            scheduleTabletCarouselRender
        );
    }


    if (
        typeof mobileCarouselQuery.addEventListener ===
        'function'
    ) {
        mobileCarouselQuery.addEventListener(
            'change',
            scheduleTabletCarouselRender
        );
    } else {
        mobileCarouselQuery.addListener(
            scheduleTabletCarouselRender
        );
    }


    window.addEventListener(
        'resize',
        scheduleTabletCarouselRender,
        {
            passive: true
        }
    );


    window.addEventListener(
        'resize',
        handleCategoryViewportChange,
        { passive: true }
    );


    syncCategoryMenu();


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


    const isMobileHero =
        window.matchMedia(
            '(max-width: 767px)'
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


    /*
     * 옆 병 4개는 CSS 에서 translate(-50%, -50%) 로 가운데를 맞춤.
     * GSAP 이 이 -50% 를 직접 알아내게 두면 병 높이가 소수점일 때
     * 못 알아보고 지워서, 화면 크기에 따라 병이 반 칸 어긋났음.
     * 그래서 xPercent / yPercent 를 직접 알려 줌
     */
    /* Rice */

    if (!isMobileHero && rice) {

        introTl.fromTo(
            rice,

            {
                xPercent: -50,
                yPercent: -50,
                x: -320,
                y: -80,
                opacity: 0
            },

            {
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 0,
                opacity: 1,

                duration: 1.05
            },

            '-=0.2'
        );

    }


    /* 1000 */

    if (!isMobileHero && prebiotics) {

        introTl.fromTo(
            prebiotics,

            {
                xPercent: -50,
                yPercent: -50,
                x: 300,
                y: -130,
                opacity: 0
            },

            {
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 0,
                opacity: 1,

                duration: 1.05
            },

            '-=0.82'
        );

    }


    /* Draft */

    if (!isMobileHero && draft) {

        introTl.fromTo(
            draft,

            {
                xPercent: -50,
                yPercent: -50,
                x: -270,
                y: 230,
                opacity: 0
            },

            {
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 0,
                opacity: 1,

                duration: 1.05
            },

            '-=0.78'
        );

    }


    /* Strawberry */

    if (!isMobileHero && strawberry) {

        introTl.fromTo(
            strawberry,

            {
                xPercent: -50,
                yPercent: -50,
                x: 270,
                y: 230,
                opacity: 0
            },

            {
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 0,
                opacity: 1,

                duration: 1.05
            },

            '-=0.78'
        );

    }


    /*
     * 백세주
     * CSS translate: -50% -50% 를 GSAP 이 transform 으로 합치면서 같은 문제가 생겨
     * (1536×864 같은 화면에서 병이 반 칸 아래로 내려앉음) 여기도 직접 알려 줌
     *
     * 물보다 백세주가 먼저 올라옴. 물은 병이 자리에 닿는 순간 튐 (아래 Splash)
     */

    if (center && !isMobileHero) {

        introTl.fromTo(
            center,

            {
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 280,
                opacity: 0
            },

            {
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 0,
                opacity: 1,

                duration: 1.15,

                ease:
                    'back.out(1.25)'
            },

            '-=0.3'
        );

    }


    /*
     * Splash (물 튀김)
     *
     * 예전: 사진 한 장이 25% 크기에서 통째로 커지며 튕김 → 스티커처럼 보였음
     * 지금: 사진 크기는 거의 그대로 두고, 병 몸통 쪽(가로 50%, 세로 78%)에서
     *       바깥으로 퍼지듯이 드러남 (CSS 의 --splash_reveal 마스크).
     *       처음엔 살짝 흐렸다가 선명해져서 빠르게 튀는 느낌을 줌.
     *       튕김 없이 처음 빠르고 끝이 느린 곡선(power2.out).
     *       너무 센 곡선(expo.out)은 퍼지는 게 안 보이고 한 번에 '팍' 나타나 보였음
     *
     * 시작 시점: 백세주가 올라오기 시작하고 0.45초 뒤
     *           = 병이 처음 제자리에 닿는 순간 (back.out(1.25) 의 44% 지점)
     *
     * xPercent / yPercent 는 위 백세주와 같은 이유로 직접 알려 줌
     */

    if (!isMobileHero && splash) {

        introTl.fromTo(
            splash,

            {
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 0,
                scale: 0.94,
                opacity: 0,
                filter: 'blur(8px)',
                '--splash_reveal': '0%'
            },

            {
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)',
                /* 125% 면 가장자리까지 다 보임 (부드러운 테두리 18% 포함) */
                '--splash_reveal': '125%',

                duration: 0.65,

                ease: 'power2.out'
            },

            '<0.45'
        );

    }


    /*
     * 이 연출이 언제 끝나는지 아래 4번(화면 잠금)에서 알아야 해서 내보냄.
     * 스크롤 잠금이 풀리는 기준이 곧 이 타임라인의 완료 시점
     */
    window.productsHeroIntro = introTl;

})();



/* =========================================================
   3-1. Hero 옆 병 4개 : 둥실둥실 + 간지럼 (PC 전용)

   메인 페이지 히어로·BEST 섹션의 병 움직임(main.js 의 data-momentum)과
   같은 느낌을 이 페이지 히어로의 옆 병 4개에만 따로 만듦.
   메인 파일은 건드리지 않음 (다른 사람 담당)

   - 평소 : 병마다 주기·시작점이 다른 사인파로 제자리에서 천천히 떠다님
            (메인처럼 커서 위치를 따라 밀리는 움직임은 정신없어서 뺐음)
   - 호버 : 커서가 병을 스치는 속도·방향만큼 튕겼다가
            스프링으로 출렁이며 제자리로 돌아옴 (간지럼)
            가장자리를 스칠수록 많이 돌고, 가운데를 곧장 지나면 덜 돎

   위치·회전은 등장 연출과 같은 GSAP 값(x, y, rotation)을 그대로 이어서 씀.
   (CSS 의 translate(-50%, -50%) rotate(..) 기준이 깨지지 않게)
   마우스가 있는 PC 에서만, 동작 줄이기 설정이면 켜지 않음
========================================================= */

(() => {

    const hero =
        document.querySelector(
            '.products_hero'
        );

    if (!hero || typeof gsap === 'undefined') return;

    const fineHover =
        window.matchMedia(
            '(hover: hover) and (pointer: fine)'
        );

    const reducedMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );

    const mobile =
        window.matchMedia(
            '(max-width: 767px)'
        );

    if (
        !fineHover.matches ||
        reducedMotion.matches ||
        mobile.matches
    ) {
        return;
    }


    /* 튕김 / 스프링 값은 메인 페이지와 같음 */
    const THROW_SCALE = 0.32;
    const SPIN_SCALE = 0.16;
    const MAX_THROW = 1600;
    const MAX_SPIN = 320;
    const STIFFNESS = 130;
    const DAMPING = 15;
    const REST_EPSILON = 0.08;

    /* 튕기는 세기. 메인 BEST 섹션 병 카드와 같은 1 (0 ~ 1) */
    const STRENGTH = 1;

    /* 등장 연출이 끝난 뒤 떠다니는 움직임이 0 → 1 로 스며드는 시간(초) */
    const EASE_IN_TIME = 1.2;

    /*
     * 병마다
     * float  : 위아래로 떠다니는 폭(px)
     * period : 한 번 오르내리는 데 걸리는 시간(초)
     * phase  : 시작점. 서로 어긋나야 같이 움직이지 않음
     */
    const LAYERS = {
        rice: {
            float: 12,
            period: 6.6,
            phase: 0
        },
        draft: {
            float: 16,
            period: 7.4,
            phase: 2.1
        },
        prebiotics: {
            float: 10,
            period: 6,
            phase: 3.7
        },
        strawberry: {
            float: 14,
            period: 8.2,
            phase: 1.2
        }
    };

    const clamp = (value, limit) =>
        Math.min(Math.max(value, -limit), limit);

    const items =
        Object.keys(LAYERS)
            .map((name) => {

                const element =
                    hero.querySelector(
                        '.hero_bottle_' + name
                    );

                if (!element) return null;

                return {
                    element,
                    layer: LAYERS[name],
                    baseRotation: 0,
                    x: 0,
                    y: 0,
                    rotation: 0,
                    velocityX: 0,
                    velocityY: 0,
                    velocityRotation: 0,
                    awake: false,
                    setX: null,
                    setY: null,
                    setRotation: null
                };
            })
            .filter(Boolean);

    if (!items.length) return;


    /* 커서 상태 */
    let pointerX = 0;
    let pointerY = 0;
    let pointerTime = 0;
    let cursorVelocityX = 0;
    let cursorVelocityY = 0;

    let clock = 0;
    let lastTime = 0;
    let frame = 0;
    let started = false;
    let visible = true;
    let easeIn = 0;


    function render(item) {

        const layer = item.layer;

        const wave =
            (clock / layer.period) * Math.PI * 2 +
            layer.phase;

        /* 가로는 세로보다 폭이 좁고 주기도 어긋나야
           같은 자리를 왕복하지 않고 떠다니는 것처럼 보임 */
        const ambientX =
            Math.sin(wave * 0.73) * layer.float * 0.5 * easeIn;

        const ambientY =
            Math.sin(wave) * layer.float * easeIn;

        item.setX(ambientX + item.x);
        item.setY(ambientY + item.y);
        item.setRotation(item.baseRotation + item.rotation);
    }


    function step(time) {

        frame = 0;

        const delta =
            lastTime
                ? Math.min((time - lastTime) / 1000, 0.04)
                : 1 / 60;

        lastTime = time;
        clock += delta;
        easeIn = Math.min(easeIn + delta / EASE_IN_TIME, 1);

        items.forEach((item) => {

            if (item.awake) {

                item.velocityX +=
                    (-STIFFNESS * item.x - DAMPING * item.velocityX) * delta;
                item.velocityY +=
                    (-STIFFNESS * item.y - DAMPING * item.velocityY) * delta;
                item.velocityRotation +=
                    (-STIFFNESS * item.rotation - DAMPING * item.velocityRotation) * delta;

                item.x += item.velocityX * delta;
                item.y += item.velocityY * delta;
                item.rotation += item.velocityRotation * delta;

                const settled =
                    Math.abs(item.x) < REST_EPSILON &&
                    Math.abs(item.velocityX) < REST_EPSILON &&
                    Math.abs(item.y) < REST_EPSILON &&
                    Math.abs(item.velocityY) < REST_EPSILON &&
                    Math.abs(item.rotation) < REST_EPSILON &&
                    Math.abs(item.velocityRotation) < REST_EPSILON;

                if (settled) {
                    item.awake = false;
                    item.x = 0;
                    item.y = 0;
                    item.rotation = 0;
                    item.velocityX = 0;
                    item.velocityY = 0;
                    item.velocityRotation = 0;
                }
            }

            render(item);
        });

        /* 히어로가 화면 밖이면 쉼. 다시 보이면 이어서 */
        if (visible) {
            frame = window.requestAnimationFrame(step);
        } else {
            lastTime = 0;
        }
    }


    function wake() {
        if (!started || frame || !visible) return;
        lastTime = 0;
        frame = window.requestAnimationFrame(step);
    }


    function onPointerMove(event) {

        const elapsed = event.timeStamp - pointerTime;

        if (pointerTime && elapsed > 0) {

            /* 순간 속도는 튀기 쉬워서 부드럽게 다듬음 */
            const instantX =
                ((event.clientX - pointerX) / elapsed) * 1000;
            const instantY =
                ((event.clientY - pointerY) / elapsed) * 1000;

            cursorVelocityX = cursorVelocityX * 0.55 + instantX * 0.45;
            cursorVelocityY = cursorVelocityY * 0.55 + instantY * 0.45;
        }

        pointerX = event.clientX;
        pointerY = event.clientY;
        pointerTime = event.timeStamp;
    }


    function onPointerLeave() {
        pointerTime = 0;
    }


    /* 커서가 병에 들어오는 순간 튕김 */
    function tickle(item, event) {

        const bounds = item.element.getBoundingClientRect();

        const offsetX =
            event.clientX - (bounds.left + bounds.width / 2);
        const offsetY =
            event.clientY - (bounds.top + bounds.height / 2);

        /* 중심에서 벗어난 정도 x 커서 속도 = 회전 방향과 세기 */
        const cross =
            offsetX * cursorVelocityY - offsetY * cursorVelocityX;

        const distance =
            Math.hypot(offsetX, offsetY) || 1;

        item.velocityX =
            clamp(cursorVelocityX * THROW_SCALE * STRENGTH, MAX_THROW * STRENGTH);
        item.velocityY =
            clamp(cursorVelocityY * THROW_SCALE * STRENGTH, MAX_THROW * STRENGTH);
        item.velocityRotation =
            clamp((cross / distance) * SPIN_SCALE * STRENGTH, MAX_SPIN * STRENGTH);

        item.awake = true;
    }


    function start() {

        if (started) return;
        started = true;

        items.forEach((item) => {

            /* 등장 연출이 끝난 자리(기울기 포함)를 기준으로 삼음 */
            item.baseRotation =
                Number(gsap.getProperty(item.element, 'rotation')) || 0;

            item.setX = gsap.quickSetter(item.element, 'x', 'px');
            item.setY = gsap.quickSetter(item.element, 'y', 'px');
            item.setRotation = gsap.quickSetter(item.element, 'rotation', 'deg');

            item.element.addEventListener(
                'pointerenter',
                (event) => {
                    if (event.pointerType && event.pointerType !== 'mouse') return;
                    tickle(item, event);
                }
            );
        });

        /* 병이 커서를 받을 수 있게 (평소 무대는 pointer-events: none) */
        hero.classList.add('is_bottle_playful');

        hero.addEventListener('pointermove', onPointerMove, { passive: true });
        hero.addEventListener('pointerleave', onPointerLeave);

        new IntersectionObserver((entries) => {
            /*
             * 한 번에 여러 개가 올 수 있음 (등장 직후 ScrollTrigger 가 고정 위치를
             * 다시 계산하면서 잠깐 화면 밖으로 잡혔다가 돌아옴). 가장 마지막 값을 씀
             */
            visible = entries[entries.length - 1].isIntersecting;
            wake();
        }).observe(hero);

        wake();
    }


    const heroIntro = window.productsHeroIntro;

    if (!heroIntro || heroIntro.progress() === 1) {
        start();
    } else {
        /*
         * 등장 연출이 끝나는 지점에 시작을 걸어 둠.
         * then() 은 쓰지 않음: gsap 타임라인의 then 은 콜백을 하나만 기억해서
         * 아래 4번(화면 잠금 풀기)의 then 이 이걸 덮어써 버림
         */
        heroIntro.call(start, null, heroIntro.duration());
    }

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


    /* Mobile uses its own pinned scroll sequence below. */
    if (
        window.matchMedia(
            '(max-width: 767px)'
        ).matches
    ) {
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

    /* 스크롤하면 백세주가 커지는 배율 (1.2 에서 조금 더 키움) */
    const BOTTLE_SCALE = 1.25;

    /*
     * 백세주가 커지는 데 쓰는 스크롤 거리 (화면 높이 대비)
     * 0.28 = 화면 높이의 28% ≒ 마우스 휠 두세 번 (예전 0.2 에서 조금 늘림)
     * 이 구간 동안은 다음 콘텐츠가 올라오지 않고 화면이 멈춰 있음
     * 더 천천히 커지게 하려면 숫자를 키우면 됨
     */
    const BOTTLE_ZOOM_SCROLL = 0.28;

    let gateReleased = false;

    let gateFallback = 0;


    /*
     * CSS individual translate owns horizontal centering. GSAP only animates
     * the bottle's vertical entry and scale.
     */


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


    /*
     * 등장 연출이 끝나면 잠금만 푼다.
     * 백세주는 그대로 멈춰 있다가, 아래 스크롤 연출에서
     * 스크롤한 만큼 커진다
     */
    lockGate();


    const heroIntro = window.productsHeroIntro;


    if (heroIntro) {

        /*
         * gsap 타임라인은 then 을 갖고 있어서
         * 다 재생되면 여기로 온다
         */
        heroIntro.then(releaseGate);

    } else {

        /* 등장 연출이 없으면 바로 풀기 */
        releaseGate();
    }


    /*
     * 안전장치.
     * 어떤 이유로든 연출이 끝나지 않아도 화면이 영영
     * 잠긴 채로 남지 않게 함
     */
    gateFallback =
        window.setTimeout(
            releaseGate,

            ((heroIntro ? heroIntro.duration() : 0) + 2) * 1000
        );


    /* =========================================
       잠금이 풀린 뒤의 스크롤 연출

       1) 화면은 멈춘 채 백세주만 스크롤에 맞춰 1 → 1.25배 (병 아래쪽 기준)
       2) 그다음 Hero 를 고정한 채 다음 콘텐츠가
          아래에서 올라와 덮음
    ========================================= */

    /* 1) 구간에 쓰는 스크롤 거리(px) */
    function zoomDistance() {
        return window.innerHeight * BOTTLE_ZOOM_SCROLL;
    }

    /*
     * 백세주가 커지는 동안 다음 콘텐츠가 올라오지 않게
     * 콘텐츠를 그 거리만큼 아래로 띄워 둠.
     * Hero 가 화면을 꽉 채울 때(PC)만 띄움.
     * 태블릿처럼 Hero 가 화면보다 짧으면 콘텐츠가 처음부터 보이고 있어서
     * 띄우면 빈 띠가 생기므로 0
     */
    function zoomGap() {
        return hero.offsetHeight >= window.innerHeight - 1
            ? zoomDistance()
            : 0;
    }

    /* 화면 크기가 바뀌면 ScrollTrigger 가 다시 계산하기 직전에 같이 맞춤 */
    function setZoomGap() {
        contentLayer.style.marginTop =
            zoomGap() + 'px';
    }

    setZoomGap();

    ScrollTrigger.addEventListener(
        'refreshInit',
        setZoomGap
    );


    const coverTl =
        gsap.timeline({

            scrollTrigger: {

                trigger: hero,

                start: 'top top',

                /*
                 * Hero 고정 시간. 길수록 천천히 진행
                 * 백세주 확대 구간 + 기존 덮기 구간(화면 높이의 150%)
                 */
                end: () =>
                    '+=' +
                    (zoomGap() + window.innerHeight * 1.5),

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


    /*
     * 타임라인 길이 = 스크롤 거리 비율
     * 0 ~ BOTTLE_ZOOM_SCROLL : 백세주 확대
     * 그 뒤 1.5             : 덮기 (화면 높이의 150%)
     */

    /* =========================================
       1) 화면은 멈춘 채 백세주만 커짐
          스크롤을 올리면 다시 작아짐

          병 아래쪽을 기준으로 커짐.
          가운데 기준이면 아래로도 커져서 화면 밖으로 더 잘렸음.
          아래 기준이면 위로만 커져서 살짝 떠오르는 것처럼 보임
    ========================================= */

    if (centerBottle) {

        gsap.set(
            centerBottle,
            {
                transformOrigin: '50% 100%'
            }
        );

        coverTl.fromTo(
            centerBottle,

            {
                scale: 1
            },

            {
                scale: BOTTLE_SCALE,

                ease: 'none',

                duration: BOTTLE_ZOOM_SCROLL
            },

            0
        );

    }


    /* =========================================
       2) 덮이는 동안 Hero 만 살짝 어두워짐
    ========================================= */

    if (heroDim) {

        coverTl.to(
            heroDim,

            {
                opacity: 0.3,

                ease: 'none',

                duration: 1.5
            },

            BOTTLE_ZOOM_SCROLL
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
   4-1. Mobile Hero Scroll Motion
========================================================= */

(() => {

    const mobileQuery =
        window.matchMedia(
            '(max-width: 767px)'
        );


    const prefersReducedMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;


    if (
        !mobileQuery.matches ||
        prefersReducedMotion ||
        typeof gsap === 'undefined' ||
        typeof ScrollTrigger === 'undefined'
    ) {
        return;
    }


    const hero =
        document.querySelector(
            '.products_hero'
        );


    if (!hero) return;


    const centerBottle =
        hero.querySelector(
            '.hero_bottle_center'
        );


    const sideBottles =
        [
            '.hero_bottle_rice',
            '.hero_bottle_draft',
            '.hero_bottle_prebiotics',
            '.hero_bottle_strawberry'
        ]
            .map(
                (selector) =>
                    hero.querySelector(selector)
            )
            .filter(Boolean);


    const getSideBottleExit =
        (index) => {

            const heroHeight =
                hero.offsetHeight;


            const viewportWidth =
                window.innerWidth;


            return [
                {
                    x: viewportWidth * -0.42,
                    y: heroHeight * -0.18,
                    scale: 0.5
                },
                {
                    x: viewportWidth * -0.46,
                    y: heroHeight * 0.27,
                    scale: 0.5
                },
                {
                    x: viewportWidth * 0.4,
                    y: heroHeight * -0.18,
                    scale: 0.5
                },
                {
                    x: viewportWidth * 0.46,
                    y: heroHeight * 0.26,
                    scale: 0.5
                }
            ][index];

        };


    if (!centerBottle || !sideBottles.length) {
        return;
    }


    gsap.registerPlugin(
        ScrollTrigger
    );


    const getEntryY =
        () =>
            Math.min(
                hero.offsetHeight * 0.16,
                120
            );


    /*
     * The original mobile CSS owns the final composition. Keep enough of the
     * bottle visible at the start, then let it rise into that static position.
     */
    gsap.set(
        centerBottle,
        {
            autoAlpha: 1,
            xPercent: -50,
            yPercent: -50,
            y: getEntryY,
            scale: 1,
            transformOrigin: '50% 100%'
        }
    );


    const mobileHeroTimeline =
        gsap.timeline({

            scrollTrigger: {

                trigger: hero,

                start: 'top top',

                end: () =>
                    `+=${Math.round(
                        Math.max(
                            window.innerHeight * 1.15,
                            hero.offsetHeight * 0.9
                        )
                    )}`,

                pin: true,

                pinSpacing: true,

                scrub: 0.35,

                anticipatePin: 1,

                invalidateOnRefresh: true
            }

        });


    mobileHeroTimeline
        .to(
            sideBottles,
            {
                x: (index) =>
                    getSideBottleExit(index).x,

                y: (index) =>
                    getSideBottleExit(index).y,

                scale: (index) =>
                    getSideBottleExit(index).scale,

                autoAlpha: 0,

                duration: 0.7,

                ease: 'power2.in',

                stagger: 0.02
            },

            0
        )
        .to(
            centerBottle,
            {
                y: 0,

                scale: 1,

                duration: 0.74,

                ease: 'power2.out'
            },

            0.08
        );


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


  const isTabletLayout =
    window.matchMedia(
      "(min-width: 768px) and (max-width: 1024px)"
    ).matches;


  const isMobileLayout =
    window.matchMedia(
      "(max-width: 767px)"
    ).matches;


  const ctaXPercent =
    isTabletLayout
      ? -50
      : 0;


  if (
    reduceMotion ||
    !hasGSAP
  ) return;


  const section =
    document.querySelector(".starter_kit");

  if (!section) return;


  if (isTabletLayout) {
    section.classList.add(
      "is-tablet-motion-ready"
    );
  }


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

  const starterEntryOffset =
    isMobileLayout
      ? 12
      : 30;

  /* =====================================================
     1. 처음 상태
  ===================================================== */

  gsap.set(
    [title, desc, character].filter(Boolean),
    {
      autoAlpha: 0,
      y: starterEntryOffset
    }
  );


  /*
    섹션 전체(inner)도 등장 직전 상태로 미리 숨겨 둠.
    (PC·태블릿은 아래 3번에서 오른쪽 → 왼쪽으로 싸악 들어옴)

    예전엔 여기서 안 숨겨서, 스크롤로 섹션에 다가가는 동안
    카드가 이미 보이고 있다가 → 등장 순간 확 사라졌다가 → 다시 들어와서
    한 번 깜빡이고 두 번 등장하는 것처럼 보였음.
    아래 3번 fromTo 의 시작값(x 180, 투명)과 꼭 같아야 함
  */
  if (inner && !isMobileLayout) {
    gsap.set(inner, {
      x: 180,
      autoAlpha: 0
    });
  }


  if (cta) {
    gsap.set(cta, {
      autoAlpha: 0,
      xPercent: ctaXPercent,
      y: isMobileLayout ? 12 : 24,
      scale: isMobileLayout ? 1 : 0.75,
      rotation: isMobileLayout ? 0 : -5
    });
  }


  /*
    BEST 도장의 최종 기울기 (CSS 의 .starter_kit_best 와 같아야 함)
    - 태블릿·모바일: rotate(-12deg)
    - PC: 피그마 글자 기울기 -23.9° 에서 딸기 카드(5°)를 뺀 -28.9°
  */
  const bestRestRotation =
    isMobileLayout || isTabletLayout
      ? -12
      : -28.9;


  /*
    BEST 도장은 카드가 다 펼쳐지고 나서 이만큼(초) 쉬었다가 찍힘.
    (예전엔 펼쳐지는 도중에 찍혀서 정신없었음)
  */
  const BEST_AFTER_CARDS = 0.15;

  if (best) {
    gsap.set(best, {
      autoAlpha: 0,
      scale: isMobileLayout ? 0.92 : 1.8,
      rotation: isMobileLayout
        ? bestRestRotation
        : bestRestRotation - 23
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
    gsap.set(isMobileLayout ? cards.slice(1) : cards, {
      clearProps: "transform"
    });


    const strawberry =
      cards[0];


    if (isTabletLayout) {

      cards.slice(1).forEach(
        (card, index) => {

          gsap.set(card, {
            x: strawberry.offsetLeft - card.offsetLeft,

            y: strawberry.offsetTop - card.offsetTop,

            scale: 1 - ((index + 1) * 0.02),

            rotation: 4.76,

            transformOrigin: "center center"
          });

        }
      );


      return;
    }


    if (isMobileLayout) {

      cards.slice(1).forEach(
        (card, index) => {

          const layerOffset =
            index === 0
              ? {
                  x: 14,
                  y: 14,
                  scale: 0.96,
                  rotation: 4
                }
              : {
                  x: -12,
                  y: 28,
                  scale: 0.92,
                  rotation: -7
                };

          gsap.set(card, {
            x:
              strawberry.offsetLeft -
              card.offsetLeft +
              layerOffset.x,

            y:
              strawberry.offsetTop -
              card.offsetTop +
              layerOffset.y,

            scale: layerOffset.scale,

            rotation: layerOffset.rotation,

            transformOrigin: "center center"
          });

        }
      );


      return;
    }

    /*
      PC : 딸기 카드는 CSS 에서 5° 기울어져 있음.
      등장할 때 0° → 5° 로 살짝 기우는 맛을 살리려고 똑바로 세워 둠
    */
    gsap.set(strawberry, {
      rotation: 0
    });

    const strawberryRect =
      strawberry.getBoundingClientRect();


    cards.slice(1).forEach(
      (card, index) => {

        const cardRect =
          card.getBoundingClientRect();


        /*
          카드마다 기울기가 달라서 바깥 상자 크기가 달라짐.
          왼쪽 위 모서리가 아니라 중심끼리 맞춰야 딸기 바로 뒤에 겹침
        */
        const x =
          (strawberryRect.left + strawberryRect.width / 2) -
          (cardRect.left + cardRect.width / 2);

        const y =
          (strawberryRect.top + strawberryRect.height / 2) -
          (cardRect.top + cardRect.height / 2);


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

  if (inner && !isMobileLayout) {

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
          /* CSS의 opacity: 0.15 (투명도 15%)를 유지 */
          autoAlpha: 0.15,

          y: 0,

          duration: 0.22,

          ease: isMobileLayout
            ? "power2.out"
            : "back.out(1.5)"
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

          xPercent: ctaXPercent,

          y: 0,

          scale: isMobileLayout ? 1 : 1.12,

          rotation: isMobileLayout ? 0 : 3,

          duration: isMobileLayout ? 0.22 : 0.18,

          ease: isMobileLayout
            ? "power2.out"
            : "back.out(3)"
        },

        "-=0.14"
      );


      if (!isMobileLayout) {

        tl.to(
          cta,
          {
            xPercent: ctaXPercent,

            scale: 1,

            rotation: 0,

            duration: 0.07
          },

          "-=0.03"
        );

      }

    }

   /* =================================================
   카드 휘리릭 펼치기

   딸기   : -5deg
   바나나 :  7deg
   청포도 : -14deg
================================================= */

if (cards.length > 1) {

  if (isMobileLayout) {

    tl.to(
      cards[1],
      {
        x: 0,
        y: 0,

        scale: 1,

        rotation: 7,

        duration: 0.56,

        ease: "power3.out"
      },

      "-=0.05"
    );


    if (cards[2]) {

      tl.to(
        cards[2],
        {
          x: 0,
          y: 0,

          scale: 1,

          rotation: -14,

          duration: 0.6,

          ease: "power3.out"
        },

        "-=0.30"
      );

    }


    tl.set(
      cards.slice(1),
      {
        clearProps: "transform"
      }
    );

  } else if (isTabletLayout) {

    tl.to(
      cards[1],
      {
        x: 0,
        y: 0,

        scale: 1,

        rotation: -7.09,

        duration: 0.52,

        ease: "power3.out"
      },

      "-=0.05"
    );


    if (cards[2]) {

      tl.to(
        cards[2],
        {
          x: 0,
          y: 0,

          scale: 1,

          rotation: 14.5,

          duration: 0.52,

          ease: "power3.out"
        },

        "-=0.32"
      );

    }


    tl.set(
      cards.slice(1),
      {
        clearProps: "transform"
      }
    );

  } else {

  /* 딸기 카드 (피그마 5°) */
  tl.to(
    cards[0],
    {
      rotation: 5,

      duration: 0.18,

      ease: "power3.out"
    },

    "-=0.05"
  );


  /* 바나나 카드 (피그마 -7°. 자리는 CSS 가 정함) */
  tl.to(
    cards[1],
    {
      x: 0,
      y: 0,

      scale: 1,

      rotation: -7,

      duration: 0.28,

      ease: "power4.out"
    },

    "-=0.16"
  );


  /* 청포도 카드 (피그마 14°. 자리는 CSS 가 정함) */
  tl.to(
    cards[2],
    {
      x: 0,
      y: 0,

      scale: 1,

      rotation: 14,

      duration: 0.28,

      ease: "power4.out"
    },

    "-=0.22"
  );

  }

}



    /* =================================================
       BEST 도장 쾅!
    ================================================= */

    if (best) {

      if (isMobileLayout) {

        tl.to(
          best,
          {
            autoAlpha: 1,

            scale: 1,

            rotation: bestRestRotation,

            duration: 0.22,

            ease: "power2.out"
          },

          /* 카드가 다 펼쳐진 뒤 잠깐 쉬었다가 */
          `+=${BEST_AFTER_CARDS}`
        );

      } else {

        tl.to(
          best,
          {
            autoAlpha: 1,

            scale: 0.82,

            rotation: bestRestRotation + 7,

            duration: 0.13,

            ease: "power4.in"
          },

          /* 카드 3장이 다 펼쳐진 뒤 잠깐 쉬었다가 쾅 */
          `+=${BEST_AFTER_CARDS}`
        );


        tl.to(
          best,
          {
            scale: 1.12,

            rotation: bestRestRotation - 3,

            duration: 0.08,

            ease: "back.out(4)"
          }
        );


        tl.to(
          best,
          {
            scale: 1,

            rotation: bestRestRotation,

            duration: 0.06
          }
        );

      }

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

    /* 카드가 다 펼쳐지고 BEST 도장까지 찍힌 다음부터 잔바람 흔들림 + 호버 */
    tl.call(startCardPlay);

  }



  /* =====================================================
     3-1. 카드 잔바람 흔들림 + 호버 (PC 전용)

     - 평소 : 잔바람에 흔들리듯 아주 살짝만 움직임
              (위아래 2px, 좌우 갸웃 0.5° 안쪽, 카드마다 박자 다름)
     - 호버 : 바람이 잦아들듯 흔들림이 줄고
              카드가 살짝 떠오르며(5px) 마우스 쪽으로 은은하게 기울어짐(최대 4°).
              안쪽 병·캔·물 튀김도 마우스를 따라 1 ~ 3px 씩 다르게 움직여 깊이감.
              마우스가 나가면 다시 부드럽게 잔바람으로

     펼치기 연출이 끝난 자리(x, y, 기울기)를 기준으로 그 위에 더함.
     숫자는 1920 화면 기준 px 이고, 화면이 작아지면 카드 크기에 맞춰 같이 줄어듦.
     마우스가 있는 PC 에서만. 태블릿·모바일은 기존 그대로
  ===================================================== */

  /*
   * 카드마다 잔바람 박자 (초).
   * 서로 안 맞는 두 박자를 섞어서 기계적으로 반복되는 느낌을 없앰
   */
  const CARD_BREEZE = [
    { bob: 6.4, sway: 5.3, flutter: 2.9, phase: 0 },
    { bob: 7.1, sway: 5.9, flutter: 3.3, phase: 2.1 },
    { bob: 6.8, sway: 5.6, flutter: 3.1, phase: 4.3 }
  ];

  /* 평소 위아래로 흔들리는 폭 (px) */
  const CARD_BOB = 2;

  /* 평소 좌우로 갸웃거리는 정도 (도) */
  const CARD_SWAY = 0.5;

  /* 호버 중에 남는 잔바람 비율 (0 = 멈춤, 1 = 그대로) */
  const CARD_HOVER_CALM = 0.3;

  /* 호버 때 떠오르는 높이 (px) */
  const CARD_HOVER_LIFT = 5;

  /* 호버 때 커지는 정도 (1.01 = 1%) */
  const CARD_HOVER_SCALE = 1.01;

  /* 호버 때 마우스 쪽으로 기울어지는 최대 각도 (도) */
  const CARD_TILT = 4;

  /* 호버 때 카드 안쪽이 마우스를 따라 움직이는 거리 (px, 가로 / 세로) */
  const CARD_INNER_MOVE = {
    bottle: [3, 2],
    can: [2, 1.5],
    splash: [-1.5, -1]
  };

  /* 호버 때 병이 살짝 올라오는 높이 (px) */
  const CARD_BOTTLE_RISE = 3;

  /* 호버로 바뀌는 속도 (클수록 빠름. 6 이면 약 0.4초) */
  const CARD_HOVER_FOLLOW = 6;

  /* 잔바람이 0 → 1 로 스며드는 시간 (초) */
  const CARD_EASE_IN = 1;

  function startCardPlay() {

    const canHover =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches;

    if (
      !canHover ||
      isTabletLayout ||
      isMobileLayout ||
      cards.length === 0
    ) return;

    const list =
      section.querySelector(".starter_kit_list") ||
      cards[0].parentElement;

    const items =
      cards.map((card, index) => {

        const item = {
          card,
          breeze: CARD_BREEZE[index % CARD_BREEZE.length],
          baseX: Number(gsap.getProperty(card, "x")) || 0,
          baseY: Number(gsap.getProperty(card, "y")) || 0,
          baseRotation: Number(gsap.getProperty(card, "rotation")) || 0,

          /* 앞뒤 순서 (CSS z-index). 겹친 곳에서는 앞 카드만 호버 */
          layer: Number(getComputedStyle(card).zIndex) || 0,

          /* 호버 정도 0 ~ 1, 카드 안 마우스 위치 -1 ~ 1 */
          hover: 0,
          targetHover: 0,
          mouseX: 0,
          mouseY: 0,
          targetMouseX: 0,
          targetMouseY: 0,

          setY: gsap.quickSetter(card, "y", "px"),
          setRotation: gsap.quickSetter(card, "rotation", "deg"),
          /* quickSetter 는 scale 한 번에 못 받아서 가로·세로 따로 */
          setScaleX: gsap.quickSetter(card, "scaleX"),
          setScaleY: gsap.quickSetter(card, "scaleY"),
          setTiltX: gsap.quickSetter(card, "rotationX", "deg"),
          setTiltY: gsap.quickSetter(card, "rotationY", "deg")
        };

        /* 앞뒤 기울기가 입체로 보이게 원근 */
        gsap.set(card, {
          transformPerspective: 900
        });

        return item;
      });

    /*
     * 어느 카드 위에 마우스가 있는지 계산.
     * 카드 자체에 mouseenter 를 걸면 카드가 떠오르거나 기울 때
     * 가장자리에서 마우스가 빠졌다 들어왔다 하며 떨리므로,
     * 움직이기 전의 제자리(기울어진 사각형)를 기준으로 판단
     */
    let pointerX = 0;
    let pointerY = 0;
    let pointerInside = false;

    function updateHover() {

      let hovered = null;
      let hoveredX = 0;
      let hoveredY = 0;

      if (pointerInside) {

        const listRect = list.getBoundingClientRect();

        items.forEach((item) => {

          const card = item.card;
          const halfW = card.offsetWidth / 2;
          const halfH = card.offsetHeight / 2;

          const centerX =
            listRect.left + card.offsetLeft + halfW + item.baseX;
          const centerY =
            listRect.top + card.offsetTop + halfH + item.baseY;

          /* 카드 기울기만큼 되돌려서 카드 기준 좌표로 */
          const angle = -item.baseRotation * Math.PI / 180;
          const dx = pointerX - centerX;
          const dy = pointerY - centerY;
          const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
          const localY = dx * Math.sin(angle) + dy * Math.cos(angle);

          if (
            Math.abs(localX) <= halfW &&
            Math.abs(localY) <= halfH &&
            (!hovered || item.layer > hovered.layer)
          ) {
            hovered = item;
            hoveredX = localX / halfW;
            hoveredY = localY / halfH;
          }
        });
      }

      items.forEach((item) => {

        const isHovered = item === hovered;

        item.targetHover = isHovered ? 1 : 0;

        if (isHovered) {
          item.targetMouseX = hoveredX;
          item.targetMouseY = hoveredY;
        } else {
          item.targetMouseX = 0;
          item.targetMouseY = 0;
        }

        item.card.classList.toggle("is_card_hover", isHovered);
      });

      wake();
    }

    section.addEventListener("pointermove", (event) => {

      if (event.pointerType && event.pointerType !== "mouse") return;

      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerInside = true;

      updateHover();
    });

    section.addEventListener("pointerleave", () => {
      pointerInside = false;
      updateHover();
    });

    /* 마우스는 가만히 있고 화면만 스크롤될 때도 다시 계산 */
    window.addEventListener("scroll", () => {
      if (pointerInside) updateHover();
    }, { passive: true });

    /*
     * CSS 의 transform 전환(300ms)이 걸려 있으면
     * 매 프레임 바꾸는 값이 한 박자씩 밀려서 굼떠 보임
     */
    section.classList.add("is_card_playing");

    let clock = 0;
    let lastTime = 0;
    let frame = 0;
    let visible = true;
    let easeIn = 0;

    function step(time) {

      frame = 0;

      const delta =
        lastTime
          ? Math.min((time - lastTime) / 1000, 0.04)
          : 1 / 60;

      lastTime = time;
      clock += delta;
      easeIn = Math.min(easeIn + delta / CARD_EASE_IN, 1);

      const follow =
        1 - Math.exp(-CARD_HOVER_FOLLOW * delta);

      items.forEach((item) => {

        const card = item.card;
        const breeze = item.breeze;

        /* 1920 화면에서 카드 폭 300 → 1, 화면이 작으면 그만큼 작아짐 */
        const unit = card.offsetWidth / 300 || 1;

        item.hover += (item.targetHover - item.hover) * follow;
        item.mouseX += (item.targetMouseX - item.mouseX) * follow;
        item.mouseY += (item.targetMouseY - item.mouseY) * follow;

        const hover = item.hover;

        /* 호버하면 잔바람이 잦아듦 */
        const calm =
          easeIn * (1 - (1 - CARD_HOVER_CALM) * hover);

        const t = clock * Math.PI * 2;

        const bob =
          Math.sin(t / breeze.bob + breeze.phase);

        const sway =
          Math.sin(t / breeze.sway + breeze.phase) * 0.7 +
          Math.sin(t / breeze.flutter + breeze.phase * 1.7) * 0.3;

        item.setY(
          item.baseY +
          bob * CARD_BOB * unit * calm -
          CARD_HOVER_LIFT * unit * hover
        );

        item.setRotation(
          item.baseRotation +
          sway * CARD_SWAY * calm
        );

        const scale =
          1 + (CARD_HOVER_SCALE - 1) * hover;

        item.setScaleX(scale);
        item.setScaleY(scale);

        /* 마우스가 있는 쪽이 살짝 눌리듯 기울어짐 */
        item.setTiltY(item.mouseX * CARD_TILT);
        item.setTiltX(-item.mouseY * CARD_TILT);

        /* 안쪽 병·캔·물 튀김 (CSS 의 translate 가 이 값을 씀) */
        const style = card.style;
        const mx = item.mouseX;
        const my = item.mouseY;

        style.setProperty(
          "--card_bottle_x",
          (mx * CARD_INNER_MOVE.bottle[0]).toFixed(2)
        );
        style.setProperty(
          "--card_bottle_y",
          (my * CARD_INNER_MOVE.bottle[1] - CARD_BOTTLE_RISE * hover).toFixed(2)
        );
        style.setProperty(
          "--card_can_x",
          (mx * CARD_INNER_MOVE.can[0]).toFixed(2)
        );
        style.setProperty(
          "--card_can_y",
          (my * CARD_INNER_MOVE.can[1]).toFixed(2)
        );
        style.setProperty(
          "--card_splash_x",
          (mx * CARD_INNER_MOVE.splash[0]).toFixed(2)
        );
        style.setProperty(
          "--card_splash_y",
          (my * CARD_INNER_MOVE.splash[1]).toFixed(2)
        );
      });

      if (visible) {
        frame = window.requestAnimationFrame(step);
      } else {
        lastTime = 0;
      }
    }

    function wake() {
      if (visible && !frame) {
        lastTime = 0;
        frame = window.requestAnimationFrame(step);
      }
    }

    /* 화면 밖이면 쉼 */
    new IntersectionObserver((entries) => {

      visible = entries[entries.length - 1].isIntersecting;

      wake();
    }).observe(section);

    frame = window.requestAnimationFrame(step);
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
        threshold: isMobileLayout
          ? 0.15
          : isTabletLayout
            ? 0.3
            : 0.75
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



/* =========================================================
   TOP 묶음(캐릭터 + TOP 버튼) 스크롤 따라오기 (PC 전용)

   화면 오른쪽 아래 캐릭터와 TOP 버튼이 한 덩어리로
   스크롤할 때 아주 살짝 뒤처졌다가 통- 하고 제자리로 돌아옴.

   - 스크롤 속도만큼 반대쪽으로 밀림 (최대 위 8px / 아래 6px)
   - 기울기 없이 위아래로만
   - 스크롤이 멈추면 용수철처럼 한 번 살짝 넘쳤다가 0.5초 안에 제자리

   마우스가 있는 PC 에서만. 태블릿·모바일, 동작 줄이기 설정이면 그대로.
   위치는 CSS 의 --top_stack_lag 로 넘김
========================================================= */

(() => {

  const stack =
    document.querySelector(".products_top_stack");

  if (!stack) return;


  const canPlay =
    window.matchMedia(
      "(min-width: 1025px) and (hover: hover) and (pointer: fine)"
    ).matches &&
    !window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  if (!canPlay) return;


  /* 위로 밀리는 최대 거리 / 아래로 밀리는 최대 거리 (px) */
  const LAG_UP = 8;
  const LAG_DOWN = 6;

  /* 이 정도 스크롤 속도(px/초)에서 최대 거리의 약 76% 만큼 밀림 */
  const LAG_SPEED = 1800;

  /* 용수철 세기 / 출렁임을 잡는 힘 (작을수록 더 통통 튐) */
  const SPRING = 220;
  const DAMPING = 10;

  /*
   * 관성. 스크롤이 갑자기 빨라지거나 멈출 때 한 번 더 툭 밀어 줌.
   * 그래서 스크롤을 멈추면 제자리를 살짝 지나쳤다가 통- 하고 돌아옴
   */
  const INERTIA = 0.12;


  let lastScroll = window.scrollY;
  let lastTime = 0;
  let speed = 0;
  let offset = 0;
  let offsetVelocity = 0;
  let frame = 0;


  function step(time) {

    frame = 0;

    const delta =
      lastTime
        ? Math.min((time - lastTime) / 1000, 0.05)
        : 1 / 60;

    lastTime = time;


    /* 스크롤 속도 (px/초). 튀는 값은 부드럽게 */
    const scroll = window.scrollY;
    const rawSpeed = (scroll - lastScroll) / delta;

    lastScroll = scroll;

    const prevSpeed = speed;

    speed += (rawSpeed - speed) * Math.min(delta * 12, 1);


    /* 아래로 스크롤하면 위로, 위로 스크롤하면 아래로 살짝 밀림 */
    const pull =
      Math.tanh(speed / LAG_SPEED);

    const target =
      pull > 0
        ? -pull * LAG_UP
        : -pull * LAG_DOWN;


    /* 용수철 */
    const force =
      (target - offset) * SPRING -
      offsetVelocity * DAMPING;

    offsetVelocity += force * delta;

    /* 빨라지면 위로, 멈추면 아래로 툭 */
    offsetVelocity -= (speed - prevSpeed) * INERTIA;

    offset += offsetVelocity * delta;


    /*
     * 화면에 보이는 값은 최대 거리 안으로 부드럽게 눌러 담음.
     * (딱 잘라 막으면 끝에서 멈칫해 보여서 tanh 로 점점 덜 밀리게)
     */
    const limit =
      offset < 0
        ? LAG_UP
        : LAG_DOWN;

    const shown =
      Math.tanh(offset / limit) * limit;


    stack.style.setProperty(
      "--top_stack_lag",
      `${shown.toFixed(2)}px`
    );


    /* 다 멈췄으면 쉼 (다음 스크롤 때 다시 깨움) */
    const resting =
      Math.abs(speed) < 1 &&
      Math.abs(offset) < 0.02 &&
      Math.abs(offsetVelocity) < 0.02;

    if (resting) {

      speed = 0;
      offset = 0;
      offsetVelocity = 0;
      lastTime = 0;

      stack.style.setProperty("--top_stack_lag", "0px");

      return;
    }

    frame = window.requestAnimationFrame(step);
  }


  window.addEventListener(
    "scroll",
    () => {

      if (frame) return;

      lastTime = 0;
      frame = window.requestAnimationFrame(step);
    },
    {
      passive: true
    }
  );

})();



/* =========================================================
   내 술 취향 결과 창

   TOP 위 캐릭터를 누르면 화면 위에 창이 뜨고(페이지 이동 없음),
   그 안에 테스트 페이지(test/test.html)를 그대로 보여 줌.

   - 테스트 결과를 기억하고 있으면 그 결과 화면 (?result=result_x)
   - 없으면 테스트 첫 화면 → 창 안에서 바로 해 볼 수 있고,
     결과가 나오면 기억해 뒀다가 다음에 열 때 바로 보여 줌
   - 결과는 localStorage 의 'kooksoondang_test_result' 에 저장
     (테스트 페이지에서도 같은 이름으로 저장해 주면 처음부터 결과가 뜸)

   창 안의 MAIN 같은 링크는 창 안에서 이동하지 않고
   창을 닫은 뒤 바깥 페이지가 이동함. VIEW MORE 는 지금 페이지가
   제품 페이지이므로 창만 닫고 제품 목록으로 스크롤.
   테스트 페이지 파일(test 폴더)은 건드리지 않음.
========================================================= */

(() => {

  const opener =
    document.querySelector("[data-type-result-open]");

  const modal =
    document.querySelector("[data-type-result-modal]");

  if (!opener || !modal) return;


  const panel = modal.querySelector(".type_result_panel");
  const backdrop = modal.querySelector(".type_result_backdrop");
  const frame = modal.querySelector("[data-type-result-frame]");
  const closeButton = modal.querySelector(".type_result_close");

  if (!panel || !frame) return;


  const STORAGE_KEY = "kooksoondang_test_result";
  const TEST_URL = "../test/test.html";

  /* PC 에서 테스트 화면을 이 크기로 그린 뒤 창에 맞게 줄임 */
  const CANVAS_WIDTH = 1440;
  const CANVAS_HEIGHT = 810;

  const desktopQuery =
    window.matchMedia("(min-width: 1025px)");

  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canAnimate =
    typeof window.gsap !== "undefined" && !reduceMotion;


  let isOpen = false;
  let lastFocus = null;
  let resultObserver = null;
  let inertItems = [];


  /* ---------- 결과 기억 ---------- */

  function isResultId(value) {
    return /^result_[a-f]$/.test(value || "");
  }

  function readSavedResult() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      return isResultId(saved) ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function saveResult(id) {
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch (error) {
      /* 저장이 막힌 브라우저면 그냥 넘어감 */
    }
  }


  /* ---------- 창 크기 (PC 는 1440 × 810 을 통째로 줄임) ---------- */

  function fitPanel() {

    if (!desktopQuery.matches) {
      panel.style.removeProperty("--type_result_w");
      panel.style.removeProperty("--type_result_h");
      panel.style.removeProperty("--type_result_scale");
      return;
    }

    const scale = Math.min(
      (window.innerWidth * 0.9) / CANVAS_WIDTH,
      (window.innerHeight * 0.88) / CANVAS_HEIGHT,
      1
    );

    panel.style.setProperty("--type_result_w", `${CANVAS_WIDTH * scale}px`);
    panel.style.setProperty("--type_result_h", `${CANVAS_HEIGHT * scale}px`);
    panel.style.setProperty("--type_result_scale", scale.toFixed(4));
  }


  /* ---------- 창 밖으로 나가는 이동 ---------- */

  function goTo(url) {

    if (window.sitePageTransition) {
      window.sitePageTransition.leaveTo(url);
    } else {
      window.location.assign(url);
    }
  }

  function isProductsPage(url) {
    return /\/products\/products\.html$/.test(url.pathname);
  }

  function scrollToProducts() {

    const showcase =
      document.getElementById("product_showcase");

    if (!showcase) return;

    const margin =
      parseFloat(getComputedStyle(showcase).scrollMarginTop) || 0;

    const top =
      showcase.getBoundingClientRect().top + window.scrollY - margin;

    if (window.siteLenis) {
      window.siteLenis.scrollTo(top, {
        immediate: reduceMotion,
        force: true
      });
    } else {
      window.scrollTo({
        top,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }
  }


  /* ---------- 창 안(테스트 페이지)과 이어 주기 ---------- */

  function handleFrameClick(event) {

    const target = event.target;

    if (!target || typeof target.closest !== "function") return;


    /* 문제 화면의 SKIP : 창 안에서는 그냥 창을 닫음 */
    if (target.closest("#btn_skip")) {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
      return;
    }


    const link = target.closest("a[href]");

    if (!link) return;

    /* 새 탭으로 여는 링크는 그대로 둠 */
    if (link.target && link.target !== "_self") return;

    event.preventDefault();
    event.stopPropagation();

    const url = new URL(
      link.getAttribute("href"),
      frame.contentWindow.location.href
    );

    if (isProductsPage(url)) {
      closeModal(scrollToProducts);
    } else {
      closeModal(() => goTo(url.href));
    }
  }

  function rememberShownResult() {

    let doc = null;

    try {
      doc = frame.contentDocument;
    } catch (error) {
      return;
    }

    const shown =
      doc && doc.querySelector(".screen_result.is_on");

    if (shown && isResultId(shown.id)) {
      saveResult(shown.id);
    }
  }

  function connectFrame() {

    let frameWindow = null;
    let doc = null;

    /* 주소가 다른 곳에서 열었거나(file:// 등) 막히면 이어 주기는 건너뜀 */
    try {
      frameWindow = frame.contentWindow;
      doc = frame.contentDocument;
    } catch (error) {
      return;
    }

    if (!frameWindow || !doc) return;


    const path = frameWindow.location.pathname;

    /* 창 안이 테스트 페이지가 아닌 곳으로 넘어갔으면 → 창을 닫고 바깥에서 이동 */
    if (!/\/test\/test\.html$/.test(path)) {

      const url = new URL(frameWindow.location.href);

      if (isProductsPage(url)) {
        closeModal(scrollToProducts);
      } else {
        closeModal(() => goTo(url.href));
      }

      return;
    }


    frameWindow.addEventListener("click", handleFrameClick, true);
    frameWindow.addEventListener("keydown", handleKeydown);


    /* 창 안에서 테스트를 끝내면 결과를 기억 */
    const test = doc.getElementById("test");

    if (resultObserver) resultObserver.disconnect();

    if (test) {
      resultObserver = new MutationObserver(rememberShownResult);
      resultObserver.observe(test, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      });
    }

    rememberShownResult();
  }

  frame.addEventListener("load", () => {

    if (!isOpen) return;

    let href = "";

    try {
      href = frame.contentWindow.location.href;
    } catch (error) {
      href = "";
    }

    if (href === "about:blank") return;

    connectFrame();
    frame.classList.add("is_loaded");
  });


  /* ---------- 뒤쪽 페이지 잠그기 ---------- */

  function lockPage() {

    document.documentElement.classList.add("is_type_result_open");
    window.siteLenis?.stop();

    /* 창 말고 나머지는 클릭·탭 이동이 안 되게 */
    inertItems = [...document.body.children].filter((element) =>
      element !== modal &&
      element.tagName !== "SCRIPT" &&
      !element.inert
    );

    inertItems.forEach((element) => {
      element.inert = true;
    });
  }

  function unlockPage() {

    inertItems.forEach((element) => {
      element.inert = false;
    });

    inertItems = [];

    document.documentElement.classList.remove("is_type_result_open");
    window.siteLenis?.start();
  }


  /* ---------- 열기 / 닫기 ---------- */

  function openModal() {

    if (isOpen) return;

    isOpen = true;
    lastFocus = document.activeElement;

    fitPanel();

    const saved = readSavedResult();

    frame.classList.remove("is_loaded");
    frame.src = saved
      ? `${TEST_URL}?result=${saved}`
      : TEST_URL;

    modal.hidden = false;
    opener.setAttribute("aria-expanded", "true");

    lockPage();


    if (canAnimate) {

      /* 캐릭터 자리에서 창이 톡 커져 나오는 느낌 */
      const from = opener.getBoundingClientRect();
      const box = panel.getBoundingClientRect();

      const originX = from.left + from.width / 2 - box.left;
      const originY = from.top + from.height / 2 - box.top;

      gsap.killTweensOf([panel, backdrop]);

      gsap.fromTo(
        backdrop,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power1.out" }
      );

      gsap.fromTo(
        panel,
        {
          autoAlpha: 0,
          scale: 0.12,
          transformOrigin: `${originX}px ${originY}px`
        },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.5,
          ease: "power3.out"
        }
      );
    }

    closeButton?.focus({ preventScroll: true });
  }

  function closeModal(afterClose) {

    if (!isOpen) return;

    isOpen = false;

    if (resultObserver) {
      resultObserver.disconnect();
      resultObserver = null;
    }

    opener.setAttribute("aria-expanded", "false");


    const finish = () => {

      modal.hidden = true;

      /* 안에서 돌던 애니메이션까지 멈추도록 비움. 다음에 열 때 새로 읽음 */
      frame.classList.remove("is_loaded");
      frame.src = "about:blank";

      if (canAnimate) {
        gsap.set([panel, backdrop], { clearProps: "all" });
      }

      unlockPage();

      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus({ preventScroll: true });
      }

      if (typeof afterClose === "function") afterClose();
    };


    if (!canAnimate) {
      finish();
      return;
    }

    gsap.killTweensOf([panel, backdrop]);

    gsap.to(panel, {
      autoAlpha: 0,
      scale: 0.12,
      duration: 0.28,
      ease: "power2.in"
    });

    gsap.to(backdrop, {
      autoAlpha: 0,
      duration: 0.28,
      ease: "power1.in",
      onComplete: finish
    });
  }


  /* ---------- 이벤트 ---------- */

  function handleKeydown(event) {
    if (isOpen && event.key === "Escape") {
      event.preventDefault();
      closeModal();
    }
  }

  opener.addEventListener("click", openModal);

  modal.querySelectorAll("[data-type-result-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal());
  });

  document.addEventListener("keydown", handleKeydown);

  window.addEventListener("resize", () => {
    if (isOpen) fitPanel();
  });

})();
