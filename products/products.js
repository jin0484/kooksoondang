/*
 * Products 페이지 인터랙션
 * - 카테고리 선택 (MAKGEOLLI / BEKSEJU / YEDAMCHEONG / SOJU)
 * - Experience / Taste 태그 선택 (#Vegan #Beginner #Intermediate #Advanced)
 * - 검색어 입력
 * - VIEW ALL / VIEW DETAILS
 * - TOP 버튼
 *
 * 각 제품의 data-experience 값은 시안에서 실제로 확인되는 정보만으로 정했다.
 *   vegan        : 카드에 #VEGAN 이 적힌 제품 (Draft / Rice / 100 Billion Prebiotics)
 *   beginner     : Beginner's Starter Kit 에 제시된 제품 (Strawberry / Banana / White Grape)
 *   intermediate / advanced : 남은 제품을 Taste Keyword 기준으로 나눔
 * 시안에 필터 기준이 명시되어 있지 않아 임의의 제품이나 등급을 새로 만들지는 않았다.
 */

(() => {
    const grid = document.querySelector('[data-product-grid]');

    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.product_card'));
    const categoryList = document.querySelector('[data-product-category]');
    const categoryButtons = categoryList ? Array.from(categoryList.querySelectorAll('.category_button')) : [];
    const tagList = document.querySelector('[data-experience-tags]');
    const tagButtons = tagList ? Array.from(tagList.querySelectorAll('.experience_tag')) : [];
    const searchForm = document.querySelector('[data-craving-search]');
    const searchInput = document.querySelector('[data-craving-input]');
    const emptyMessage = document.querySelector('[data-product-empty]');
    const viewAllButton = document.querySelector('[data-view-all]');
    const viewDetailsButton = document.querySelector('[data-view-details]');
    const showcase = document.getElementById('product_showcase');

    const state = {
        category: 'makgeolli',
        experience: '',
        keyword: ''
    };

    function matchesCard(card) {
        const category = card.dataset.category || '';
        const experience = (card.dataset.experience || '').split(/\s+/);
        const name = (card.querySelector('.product_name')?.textContent || '').toLowerCase();
        const taste = (card.querySelector('.product_taste')?.textContent || '').toLowerCase();

        if (state.category && category !== state.category) return false;
        if (state.experience && !experience.includes(state.experience)) return false;
        if (state.keyword && !name.includes(state.keyword) && !taste.includes(state.keyword)) return false;

        return true;
    }

    function renderProducts() {
        let visibleCount = 0;

        cards.forEach((card) => {
            const isVisible = matchesCard(card);

            card.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
        });

        if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
    }

    function setPressed(button, isPressed) {
        button.classList.toggle('is_active', isPressed);
        button.setAttribute('aria-pressed', String(isPressed));
    }

    function handleCategoryClick(event) {
        const button = event.target.closest('.category_button');

        if (!button) return;

        state.category = button.dataset.category || '';
        categoryButtons.forEach((item) => setPressed(item, item === button));
        renderProducts();
    }

    function handleTagClick(event) {
        const button = event.target.closest('.experience_tag');

        if (!button) return;

        // 같은 태그를 다시 누르면 해제
        const nextExperience = state.experience === button.dataset.experience ? '' : button.dataset.experience;

        state.experience = nextExperience || '';
        tagButtons.forEach((item) => setPressed(item, item.dataset.experience === state.experience));
        renderProducts();
    }

    function handleSearchSubmit(event) {
        event.preventDefault();
        state.keyword = (searchInput?.value || '').trim().toLowerCase();
        renderProducts();
    }

    function handleSearchInput() {
        // 입력을 지우면 곧바로 전체가 다시 보이도록
        if (searchInput.value !== '') return;

        state.keyword = '';
        renderProducts();
    }

    // 시안에 VIEW ALL 의 이동 목적지가 없어서 새 페이지를 만들지 않고
    // 적용된 조건을 모두 풀어 전체 제품을 보여주는 동작으로 구현했다.
    function handleViewAllClick() {
        state.category = '';
        state.experience = '';
        state.keyword = '';

        categoryButtons.forEach((item) => setPressed(item, false));
        tagButtons.forEach((item) => setPressed(item, false));
        if (searchInput) searchInput.value = '';

        renderProducts();
    }

    // VIEW DETAILS 역시 목적지가 확인되지 않아, Starter Kit 에 제시된
    // 입문자용 제품을 제품 영역에서 바로 확인하도록 연결했다.
    function handleViewDetailsClick() {
        state.category = 'makgeolli';
        state.experience = 'beginner';
        state.keyword = '';

        categoryButtons.forEach((item) => setPressed(item, item.dataset.category === 'makgeolli'));
        tagButtons.forEach((item) => setPressed(item, item.dataset.experience === 'beginner'));
        if (searchInput) searchInput.value = '';

        renderProducts();

        if (!showcase) return;

        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

        if (window.siteLenis) window.siteLenis.scrollTo(showcase);
        else showcase.scrollIntoView({ behavior, block: 'start' });
    }

    categoryList?.addEventListener('click', handleCategoryClick);
    tagList?.addEventListener('click', handleTagClick);
    searchForm?.addEventListener('submit', handleSearchSubmit);
    searchInput?.addEventListener('input', handleSearchInput);
    viewAllButton?.addEventListener('click', handleViewAllClick);
    viewDetailsButton?.addEventListener('click', handleViewDetailsClick);

    renderProducts();
})();

(() => {
    const topButton = document.querySelector('[data-top-button]');

    if (!topButton) return;

    const revealPoint = 400;
    let scrollFrame = 0;

    function updateTopButton() {
        scrollFrame = 0;
        topButton.classList.toggle('is_visible', window.scrollY > revealPoint);
    }

    function handleScroll() {
        if (scrollFrame) return;

        scrollFrame = window.requestAnimationFrame(updateTopButton);
    }

    function handleTopClick() {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

        if (window.siteLenis) window.siteLenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    topButton.addEventListener('click', handleTopClick);
    updateTopButton();
})();
