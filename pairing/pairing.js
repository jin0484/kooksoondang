(() => {
    'use strict';

    const questions = [
        {
            id: 'flavor',
            label: 'Q1',
            prompt: 'What flavor do you prefer?',
            color: '#f29556',
            tint: 'rgba(242, 149, 86, 0.30)',
            options: [
                { id: 'spicy', label: 'Spicy', icon: 'icon/Spicy.png' },
                { id: 'sweet', label: 'Sweet', icon: 'icon/Sweet.png' },
                { id: 'fresh', label: 'Fresh', icon: 'icon/Fresh.png' },
                { id: 'nutty', label: 'Nutty', icon: 'icon/Nutty.png' },
                { id: 'savory', label: 'Savory', icon: 'icon/Savory.png' }
            ]
        },
        {
            id: 'style',
            label: 'Q2',
            prompt: 'What drink style do you prefer?',
            color: '#fdda37',
            tint: 'rgba(253, 218, 55, 0.27)',
            options: [
                { id: 'smooth', label: 'Smooth', icon: 'icon/question/q2_smooth.png' },
                { id: 'clean', label: 'Clean', icon: 'icon/question/q2_clean.png' },
                { id: 'sparkling', label: 'Sparkling', icon: 'icon/question/q2_sparkling.png' },
                { id: 'rich', label: 'Rich', icon: 'icon/question/q2_rich.png' },
                { id: 'light', label: 'Light', icon: 'icon/question/q2_light.png' }
            ]
        },
        {
            id: 'occasion',
            label: 'Q3',
            prompt: "What's the occasion?",
            color: '#d4e20f',
            tint: 'rgba(212, 226, 15, 0.24)',
            options: [
                { id: 'party', label: 'Party', icon: 'icon/question/q3_party.png' },
                { id: 'dinner', label: 'Dinner', icon: 'icon/question/q3_dinner.png' },
                { id: 'camping', label: 'Camping', icon: 'icon/question/q3_camping.png' },
                { id: 'date', label: 'Date', icon: 'icon/question/q3_date.png' },
                { id: 'home', label: 'Relaxing at Home', icon: 'icon/question/q3_home.png' }
            ]
        },
        {
            id: 'explore',
            label: 'Q4',
            prompt: 'What would you like to explore?',
            color: '#0a663f',
            tint: 'rgba(10, 102, 63, 0.16)',
            options: [
                { id: 'traditional', label: 'Traditional Makgeolli', icon: 'icon/question/q4_traditional.png' },
                { id: 'fruit', label: 'Fruit Makgeolli', icon: 'icon/question/q4_fruit.png' },
                { id: 'premium', label: 'Premium Korean Liquor', icon: 'icon/question/q4_premium.png' },
                { id: 'surprise', label: 'Surprise Me', icon: 'icon/question/q4_surprise.png' },
                { id: 'best', label: 'Best Seller', icon: 'icon/question/q4_best.png' }
            ]
        }
    ];

    const foodData = {
        korean: [
            { title: 'Pajeon', description: '(Korean Scallion Pancake)', tag: 'Savory · Nutty', image: 'figma/korean_pajeon.png', imagePosition: '50% 50%' },
            { title: 'Bossam', description: '(Boiled Pork Wraps)', tag: 'Rich · Savory', image: 'figma/korean_bossam.png', imagePosition: '50% 50%' },
            { title: 'Bulgogi', description: '(Korean Barbecue Beef)', tag: 'Sweet · Savory', image: 'figma/korean_bulgogi.png', imagePosition: '50% 50%' },
            { title: 'Dakgalbi', description: '(Spicy Stir-Fried Chicken)', tag: 'Spicy · Sweet', image: 'figma/korean_dakgalbi.png', imagePosition: '50% 50%' },
            { title: 'Kimchi Jjigae', description: '(Kimchi Stew)', tag: 'Spicy · Rich', image: 'figma/korean_kimchi_jjigae.png', imagePosition: '50% 50%' },
            { title: 'Dotori-muk Muchim', description: '(Acorn Jelly Salad)', tag: 'Nutty · Refreshing', image: 'figma/korean_dotori_muk_muchim.png', imagePosition: '50% 50%' },
            { title: 'Jeyuk Bokkeum', description: '(Spicy Stir-Fried Pork)', tag: 'Spicy · Savory', image: 'figma/korean_jeyuk_bokkeum.png', imagePosition: '50% 50%' },
            { title: 'Dubu Kimchi', description: '(Tofu with Stir-Fried Kimchi)', tag: 'Spicy · Tangy', image: 'figma/korean_dubu_kimchi.png', imagePosition: '50% 50%' }
        ],
        global: [
            { title: 'Margherita Pizza', description: '(Italian)', tag: 'Savory · Tangy', image: 'Margherita Pizza.png', imagePosition: '50% 50%' },
            { title: 'Buffalo Wings', description: '(American)', tag: 'Spicy · Savory', image: 'figma/world_buffalo_wings.png', imagePosition: '50% 45%' },
            { title: 'Fish and Chips', description: '(British)', tag: 'Crispy · Savory', image: 'figma/world_fish_and_chips.png', imagePosition: '50% 50%' },
            { title: 'Spicy Beef Tacos', description: '(Mexican)', tag: 'Spicy · Fresh', image: 'figma/world_spicy_beef_tacos.png', imagePosition: '50% 50%' },
            { title: 'Thai Green Curry', description: '(Thai)', tag: 'Spicy · Creamy', image: 'Thai Green Curry.png', imagePosition: '50% 50%' },
            { title: 'Japanese Gyoza', description: '(Japanese)', tag: 'Savory · Nutty', image: 'figma/world_japanese_gyoza.png', imagePosition: '50% 50%' },
            { title: 'Strawberry Cheesecake', description: '(Western Dessert)', tag: 'Sweet · Creamy', image: 'figma/world_strawberry_cheesecake.png', imagePosition: '50% 22%' },
            { title: 'Jamón with Melon', description: '(Spanish)', tag: 'Sweet · Salty', image: 'figma/world_jamon_with_melon.png', imagePosition: '50% 50%' }
        ]
    };

    foodData.popular = [
        { title: 'Pajeon', description: '(Korean Scallion Pancake)', tag: 'Savory · Nutty', image: 'figma/popular_pajeon.png', imagePosition: '50% 50%' },
        { title: 'Bossam', description: '(Boiled Pork Wraps)', tag: 'Rich · Savory', image: 'figma/popular_bossam.png', imagePosition: '50% 50%' },
        { title: 'Dakgalbi', description: '(Spicy Stir-Fried Chicken)', tag: 'Spicy · Fresh', image: 'figma/popular_dakgalbi.png', imagePosition: '50% 50%' },
        { title: 'Margherita Pizza', description: '(Italian)', tag: 'Savory · Tangy', image: 'Margherita Pizza.png', imagePosition: '50% 50%' },
        { title: 'Jamón with Melon', description: '(Spanish)', tag: 'Sweet · Salty', image: 'figma/popular_jamon_with_melon.png', imagePosition: '50% 50%' }
    ];

    const recipeIconSet = {
        bookmark: 'icon/recipe/strawberry_bookmark.svg',
        level: 'icon/recipe/strawberry_level.svg',
        clock: 'icon/recipe/strawberry_clock.svg',
        divider: 'icon/recipe/strawberry_divider.svg'
    };

    const recipes = [
        {
            id: 'makgeolli-highball',
            title: 'Makgeolli Highball',
            feature: 'Refreshing & Light',
            difficulty: 'Beginner',
            time: '2 min',
            image: 'Makgeolli Highball.png',
            icons: recipeIconSet,
            ingredients: ['Makgeolli 120 ml', 'Sparkling water 100 ml', 'Lemon juice 10 ml', 'Ice cubes', 'Lemon slice'],
            steps: ['Fill a highball glass with ice.', 'Pour in makgeolli and lemon juice.', 'Top with sparkling water.', 'Stir gently and garnish with lemon.'],
            tip: 'Adjust the sparkle to your taste with extra soda water.'
        },
        {
            id: 'strawberry-makgeolli',
            title: 'Strawberry Makgeolli',
            feature: 'Sweet & Fruity',
            difficulty: 'Beginner',
            time: '3 min',
            image: 'figma/strawberry_makgeolli.png',
            icons: recipeIconSet,
            ingredients: ['120 ml (4 oz) Makgeolli', '3–4 Fresh Strawberries', '15 ml (0.5 oz) Strawberry Syrup', 'Ice Cubes'],
            steps: ['Hull and chop the strawberries.', 'Mash with strawberry syrup.', 'Add ice, then the berry mix.', 'Pour in makgeolli; stir gently.'],
            tip: ['Save a strawberry slice for garnish.', 'For a smoother texture, blend the fruit before adding it to the glass.']
        },
        {
            id: 'honey-makgeolli',
            title: 'Honey Makgeolli',
            feature: 'Smooth & Sweet',
            difficulty: 'Beginner',
            time: '2 min',
            image: 'figma/honey_makgeolli.png',
            icons: {
                bookmark: 'icon/recipe/honey_bookmark.svg',
                level: 'icon/recipe/honey_level.svg',
                clock: 'icon/recipe/honey_clock.svg',
                divider: 'icon/recipe/honey_divider.svg'
            },
            ingredients: ['150 ml (5 oz) Makgeolli', '15 ml (0.5 oz) Honey', '15 ml (0.5 oz) Warm Water', 'Ice Cubes'],
            steps: ['Dissolve honey in warm water.', 'Gently swirl the makgeolli bottle.', 'Add ice and pour in makgeolli.', 'Stir in the honey mixture.'],
            tip: ['Garnish with a small piece of honeycomb.', 'Adjust the amount of honey to match your preferred sweetness.']
        },
        {
            id: 'matcha-makgeolli',
            title: 'Matcha Makgeolli',
            feature: 'Earthy & Smooth',
            difficulty: 'Intermediate',
            time: '4 min',
            image: 'figma/matcha_makgeolli.png',
            icons: {
                bookmark: 'icon/recipe/matcha_bookmark.svg',
                level: 'icon/recipe/matcha_level.svg',
                clock: 'icon/recipe/matcha_clock.svg',
                divider: 'icon/recipe/matcha_divider.svg'
            },
            ingredients: ['120 ml (4 oz) Makgeolli', '2 g (1 tsp) Matcha Powder', '30 ml (1 oz) Warm Water', '10 ml (0.3 oz) Simple Syrup'],
            steps: ['Sift matcha into a small bowl.', 'Whisk with warm water until foamy.', 'Add makgeolli and syrup to a glass.', 'Top slowly with matcha.'],
            tip: ['Pour the matcha slowly over the back of a spoon.', 'This helps create a clean and visible green layer.']
        },
        {
            id: 'baekseju-highball',
            title: 'Baekseju Highball',
            feature: 'Crisp & Herbal',
            difficulty: 'Beginner',
            time: '2 min',
            image: 'figma/baekseju_highball.png',
            icons: {
                bookmark: 'icon/recipe/baekseju_bookmark.svg',
                level: 'icon/recipe/baekseju_level.svg',
                clock: 'icon/recipe/baekseju_clock.svg',
                divider: 'icon/recipe/baekseju_divider.svg'
            },
            ingredients: ['60 ml (2 oz) Baekseju', '120 ml (4 oz) Sparkling Water', '10 ml (0.3 oz) Honey Syrup', 'Large Ice Cubes'],
            steps: ['Fill a highball glass with ice.', 'Pour in Baekseju and swirl to chill.', 'Add honey syrup; stir once.', 'Top slowly with sparkling water.'],
            tipLines: ['Stir only once after adding the sparkling water.', 'Garnish with a thin slice of ginger for a fresh herbal aroma.'],
            tip: 'A rosemary sprig brings out Baekseju’s delicate herbal aroma.'
        }
    ];

    const products = {
        draft: {
            name: 'Draft Makgeolli',
            image: 'draft_makgeolli.png',
            description: 'Its light carbonation and smooth texture help balance spicy flavors, creating a refreshing and well-rounded pairing.',
            accent: '#1e9164',
            profile: { Sweetness: 40, Acidity: 40, Body: 80, Fizziness: 40 },
            similar: ['prebiotics'],
            tip: 'Try the clear layer before mixing for a light and crisp flavor.'
        },
        bekseju: {
            name: 'Baekseju',
            image: 'bekseju.png',
            description: 'A smooth, gently sweet Korean rice wine with a delicate herbal finish.',
            accent: '#f29556',
            profile: { Sweetness: 45, Acidity: 30, Body: 60, Fizziness: 10 },
            similar: ['yedamcheong', 'chestnut'],
            tip: 'Serve lightly chilled to let the layered grain and herb notes open up.'
        },
        strawberry: {
            name: 'Strawberry Makgeolli',
            image: 'strawberry.png',
            description: 'A bright, creamy makgeolli with a sweet strawberry finish.',
            accent: '#f29556',
            profile: { Sweetness: 80, Acidity: 45, Body: 55, Fizziness: 25 },
            similar: ['peach', 'banana'],
            tip: 'Pour slowly after a gentle shake and enjoy well chilled.'
        },
        whitegrape: {
            name: 'White Grape Makgeolli',
            image: 'whitegrape.png',
            description: 'Crisp grape aroma and a clean finish for a light, fruity pairing.',
            accent: '#d4e20f',
            profile: { Sweetness: 68, Acidity: 55, Body: 38, Fizziness: 35 },
            similar: ['strawberry', 'peach'],
            tip: 'Pair with fresh fruit or a bright salad for the most refreshing match.'
        },
        chestnut: {
            name: 'Chestnut Makgeolli',
            image: 'chestnut.png',
            description: 'Round, nutty, and mellow with the comforting taste of roasted chestnut.',
            accent: '#8d7e77',
            profile: { Sweetness: 55, Acidity: 25, Body: 72, Fizziness: 15 },
            similar: ['bekseju', 'banana'],
            tip: 'Try it with savory pancakes, roasted dishes, or a relaxed meal at home.'
        },
        banana: {
            name: 'Banana Makgeolli',
            image: 'banana.png',
            description: 'A playful, creamy banana makgeolli that suits festive moments.',
            accent: '#fdda37',
            profile: { Sweetness: 74, Acidity: 30, Body: 62, Fizziness: 30 },
            similar: ['strawberry', 'prebiotics'],
            tip: 'Keep it cold and serve in a small glass to preserve its soft texture.'
        },
        prebiotics: {
            name: 'Prebiotics Makgeolli',
            image: 'Prebiotics.png',
            description: 'A lively, modern makgeolli with a light and refreshing character.',
            accent: '#0a663f',
            profile: { Sweetness: 48, Acidity: 52, Body: 40, Fizziness: 62 },
            similar: ['whitegrape', 'banana'],
            tip: 'Its brighter fizz makes it especially good alongside spicy foods.'
        },
        peach: {
            name: 'Peach Makgeolli',
            image: 'peach.png',
            description: 'Soft peach fragrance and an easy, juicy finish.',
            accent: '#f29556',
            profile: { Sweetness: 76, Acidity: 42, Body: 45, Fizziness: 22 },
            similar: ['strawberry', 'whitegrape'],
            tip: 'Serve with desserts or fruit-forward bites while the aroma is fresh.'
        },
        yedamcheong: {
            name: 'Ye-Dam Cheongju',
            image: 'yedamcheong.png',
            description: 'A refined clear rice wine with a balanced, elegant finish.',
            accent: '#5d504a',
            profile: { Sweetness: 35, Acidity: 32, Body: 58, Fizziness: 5 },
            similar: ['bekseju', 'chestnut'],
            tip: 'Enjoy in a stemmed glass with dishes that let its clean finish shine.'
        }
    };

    const recommendationWeights = {
        flavor: {
            spicy: { draft: 4, prebiotics: 2, bekseju: 1 },
            sweet: { strawberry: 4, peach: 2, banana: 1 },
            fresh: { whitegrape: 4, prebiotics: 2 },
            nutty: { chestnut: 4, bekseju: 2 },
            savory: { bekseju: 4, yedamcheong: 2 }
        },
        style: {
            smooth: { draft: 3, bekseju: 2, chestnut: 1 },
            clean: { yedamcheong: 3, draft: 2, whitegrape: 1 },
            sparkling: { prebiotics: 3, whitegrape: 2, banana: 1 },
            light: { whitegrape: 3, yedamcheong: 2 },
            rich: { chestnut: 3, banana: 2, bekseju: 1 }
        },
        occasion: {
            dinner: { draft: 3, bekseju: 2, yedamcheong: 1 },
            party: { banana: 3, prebiotics: 2 },
            date: { strawberry: 3, peach: 2 },
            camping: { chestnut: 3, bekseju: 2 },
            home: { chestnut: 3, strawberry: 1 }
        },
        explore: {
            traditional: { draft: 3, bekseju: 2, yedamcheong: 1 },
            fruit: { whitegrape: 4, strawberry: 2, peach: 2 },
            premium: { yedamcheong: 4, bekseju: 1 },
            surprise: { peach: 3, prebiotics: 2, banana: 1 },
            best: { prebiotics: 3, strawberry: 2, banana: 1 }
        }
    };

    const state = {
        activeQuestionIndex: 0,
        answers: {},
        foodCategory: 'korean',
        recipeIndex: 0
    };
    let recipeTransitionTimer = null;
    let recipeTransitionId = 0;
    let resultModalOpener = null;
    let shouldRestoreResultFocus = true;
    let foodCarouselResizeFrame = 0;

    const assetUrl = (path) => encodeURI(`./pairing_asset/${path}`);
    const escapeHtml = (value) => String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    const questionnaire = document.querySelector('#pairing_questionnaire');
    const foodTrack = document.querySelector('#pairing_food_track');
    const foodCarousel = foodTrack?.closest('.pairing_food_carousel');
    const foodPreviousButton = document.querySelector('.pairing_food_previous');
    const foodNextButton = document.querySelector('.pairing_food_next');
    const foodTabs = document.querySelectorAll('.pairing_food_tab');
    const recipePickerList = document.querySelector('#pairing_recipe_picker_list');
    const recipeViewport = document.querySelector('#pairing_recipe_viewport');
    const resultModal = document.querySelector('#pairing_result_modal');
    const resultModalContent = document.querySelector('#pairing_result_modal_content');
    const modalCloseButton = document.querySelector('#pairing_modal_close');

    if (!questionnaire || !foodTrack || !recipePickerList || !recipeViewport || !resultModal || !resultModalContent || !modalCloseButton) {
        return;
    }

    function getQuestionPanelId(question) {
        return `pairing_question_panel_${question.id}`;
    }

    function getQuestionContentId(question) {
        return `pairing_question_content_${question.id}`;
    }

    function areAllQuestionsAnswered() {
        return questions.every((question) => Boolean(state.answers[question.id]));
    }

    function getQuestionPanelMarkup(question, questionIndex) {
        const isOpen = questionIndex === state.activeQuestionIndex;
        const selectedAnswer = state.answers[question.id];
        const isFirstQuestion = questionIndex === 0;
        const isLastQuestion = questionIndex === questions.length - 1;
        const canShowResult = areAllQuestionsAnswered();
        const canContinue = isLastQuestion ? canShowResult : Boolean(selectedAnswer);
        const panelId = getQuestionPanelId(question);
        const contentId = getQuestionContentId(question);
        const headingId = `pairing_question_heading_${question.id}`;
        const questionStyle = `--pairing-question-color: ${question.color}; --pairing-question-tint: ${question.tint};`;
        const optionMarkup = question.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            return `
                <button class="pairing_question_option${isSelected ? ' is_selected' : ''}" type="button" role="radio" aria-checked="${isSelected}" data-question-answer="${question.id}" data-answer-value="${option.id}">
                    <img class="pairing_question_icon" src="${assetUrl(option.icon)}" alt="" aria-hidden="true">
                    <span class="pairing_question_option_text">${escapeHtml(option.label)}</span>
                </button>`;
        }).join('');

        return `
            <section class="pairing_question_panel ${isOpen ? 'is_open' : 'is_collapsed'}" id="${panelId}" data-question-id="${question.id}" style="${questionStyle}">
                <button class="pairing_question_tab" type="button" data-question-open="${questionIndex}" aria-expanded="${isOpen}" aria-controls="${contentId}" aria-hidden="${isOpen}" tabindex="${isOpen ? '-1' : '0'}">
                    <span class="pairing_question_number">${question.label}</span>
                    <span class="pairing_question_prompt">${escapeHtml(question.prompt)}</span>
                </button>
                <div class="pairing_question_content" id="${contentId}" role="region" aria-labelledby="${headingId}" aria-hidden="${!isOpen}"${isOpen ? '' : ' inert'}>
                    <h3 class="pairing_question_heading" id="${headingId}">
                        <span class="pairing_question_number">${question.label}</span>
                        <span class="pairing_question_prompt">${escapeHtml(question.prompt)}</span>
                    </h3>
                    <div class="pairing_question_options" role="radiogroup" aria-label="${escapeHtml(question.prompt)}">
                        ${optionMarkup}
                    </div>
                    <div class="pairing_question_navigation" aria-label="Question navigation">
                        <button class="pairing_question_nav_button pairing_question_previous" type="button" data-question-previous="${questionIndex}"${isFirstQuestion ? ' disabled aria-disabled="true"' : ''}>Previous</button>
                        <button class="pairing_question_nav_button pairing_question_next" type="button" data-question-next="${questionIndex}"${canContinue ? '' : ' disabled aria-disabled="true"'}>${isLastQuestion ? 'View Result' : 'Next'}</button>
                    </div>
                </div>
            </section>`;
    }

    function renderQuestionnaire() {
        const needsInitialRender = questions.some((question) => !questionnaire.querySelector(`#${getQuestionPanelId(question)}`));

        if (needsInitialRender) {
            questionnaire.innerHTML = questions.map((question, index) => getQuestionPanelMarkup(question, index)).join('');
        }

        const canShowResult = areAllQuestionsAnswered();
        questions.forEach((question, questionIndex) => {
            const panel = questionnaire.querySelector(`#${getQuestionPanelId(question)}`);
            if (!panel) return;

            const isOpen = questionIndex === state.activeQuestionIndex;
            const selectedAnswer = state.answers[question.id];
            const tab = panel.querySelector('[data-question-open]');
            const content = panel.querySelector('.pairing_question_content');
            const previousButton = panel.querySelector('[data-question-previous]');
            const nextButton = panel.querySelector('[data-question-next]');
            const isFirstQuestion = questionIndex === 0;
            const isLastQuestion = questionIndex === questions.length - 1;
            const canContinue = isLastQuestion ? canShowResult : Boolean(selectedAnswer);

            panel.classList.toggle('is_open', isOpen);
            panel.classList.toggle('is_collapsed', !isOpen);

            if (tab) {
                tab.setAttribute('aria-expanded', String(isOpen));
                tab.setAttribute('aria-hidden', String(isOpen));
                tab.tabIndex = isOpen ? -1 : 0;
            }

            if (content) {
                content.setAttribute('aria-hidden', String(!isOpen));
                if (isOpen) {
                    content.removeAttribute('inert');
                } else {
                    content.setAttribute('inert', '');
                }
            }

            panel.querySelectorAll('[data-question-answer]').forEach((option) => {
                const isSelected = option.dataset.answerValue === selectedAnswer;
                option.classList.toggle('is_selected', isSelected);
                option.setAttribute('aria-checked', String(isSelected));
            });

            if (previousButton) {
                previousButton.disabled = isFirstQuestion;
                previousButton.setAttribute('aria-disabled', String(isFirstQuestion));
            }

            if (nextButton) {
                nextButton.disabled = !canContinue;
                nextButton.setAttribute('aria-disabled', String(!canContinue));
                nextButton.textContent = isLastQuestion ? 'View Result' : 'Next';
            }
        });

    }

    function focusActiveQuestionOption() {
        const activeQuestion = questions[state.activeQuestionIndex];
        if (!activeQuestion) return;

        const focusOption = () => {
            const option = questionnaire
                .querySelector(`#${getQuestionPanelId(activeQuestion)} [data-question-answer].is_selected, #${getQuestionPanelId(activeQuestion)} [data-question-answer]`);
            if (!option) return;

            try {
                option.focus({ preventScroll: true });
            } catch {
                option.focus();
            }
        };

        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(focusOption);
        } else {
            setTimeout(focusOption, 0);
        }
    }

    function handleQuestionnaireClick(event) {
        const answerButton = event.target.closest('[data-question-answer]');
        const questionTab = event.target.closest('[data-question-open]');
        const previousButton = event.target.closest('[data-question-previous]');
        const nextButton = event.target.closest('[data-question-next]');

        if (answerButton) {
            const questionId = answerButton.dataset.questionAnswer;
            const answerValue = answerButton.dataset.answerValue;
            state.answers[questionId] = answerValue;
            renderQuestionnaire();
            return;
        }

        if (previousButton) {
            const currentQuestionIndex = Number(previousButton.dataset.questionPrevious);
            if (!Number.isInteger(currentQuestionIndex) || currentQuestionIndex <= 0) return;

            state.activeQuestionIndex = currentQuestionIndex - 1;
            renderQuestionnaire();
            focusActiveQuestionOption();
            return;
        }

        if (nextButton) {
            const currentQuestionIndex = Number(nextButton.dataset.questionNext);
            const currentQuestion = questions[currentQuestionIndex];
            if (!currentQuestion || nextButton.disabled) return;

            if (currentQuestionIndex === questions.length - 1) {
                openResultModal(nextButton);
                return;
            }

            if (!state.answers[currentQuestion.id]) return;
            state.activeQuestionIndex = currentQuestionIndex + 1;
            renderQuestionnaire();
            focusActiveQuestionOption();
            return;
        }

        if (questionTab) {
            const nextQuestionIndex = Number(questionTab.dataset.questionOpen);
            if (!Number.isInteger(nextQuestionIndex) || !questions[nextQuestionIndex]) return;

            const shouldMoveFocus = nextQuestionIndex !== state.activeQuestionIndex;
            state.activeQuestionIndex = nextQuestionIndex;
            renderQuestionnaire();
            if (shouldMoveFocus) focusActiveQuestionOption();
        }
    }

    function renderFoodCards() {
        const foods = foodData[state.foodCategory] || foodData.korean;
        foodTrack.innerHTML = foods.map((food) => {
            const imageStyles = food.imagePosition
                ? `--pairing-food-image-position: ${escapeHtml(food.imagePosition)};`
                : '';

            return `
            <article class="pairing_food_card">
                <img class="pairing_food_card_image" src="${assetUrl(`img/food/${food.image}`)}" alt="${escapeHtml(food.title)}" loading="lazy"${imageStyles ? ` style="${imageStyles}"` : ''}>
                <h3>${escapeHtml(food.title)}</h3>
                <p>${escapeHtml(food.description)}</p>
                <span class="pairing_food_tag">${escapeHtml(food.tag)}</span>
            </article>`;
        }).join('');
        updateFoodCarouselControls();
    }

    function setFoodCategory(category) {
        if (!foodData[category]) return;

        state.foodCategory = category;
        foodTabs.forEach((tab) => {
            const isActive = tab.dataset.foodCategory === category;
            tab.classList.toggle('is_active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });
        renderFoodCards();
        foodTrack.scrollTo({ left: 0, behavior: 'auto' });
    }

    function getFoodCardScrollStart(card) {
        const trackRect = foodTrack.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        return foodTrack.scrollLeft + cardRect.left - trackRect.left;
    }

    function updateFoodCarouselControls() {
        if (!foodCarousel || !foodPreviousButton || !foodNextButton) return;

        // Compare against the whole carousel, so the arrow columns themselves
        // do not stop a row of cards that already fits from becoming static.
        const hasOverflow = foodTrack.scrollWidth > foodCarousel.clientWidth + 1;
        const areAllCardsVisible = !hasOverflow;
        foodCarousel.classList.toggle('is_all_visible', areAllCardsVisible);
        foodPreviousButton.hidden = areAllCardsVisible;
        foodNextButton.hidden = areAllCardsVisible;
        foodTrack.tabIndex = areAllCardsVisible ? -1 : 0;

        if (areAllCardsVisible && foodTrack.scrollLeft !== 0) {
            foodTrack.scrollTo({ left: 0, behavior: 'auto' });
        }
    }

    function scheduleFoodCarouselControlUpdate() {
        if (foodCarouselResizeFrame) return;

        foodCarouselResizeFrame = window.requestAnimationFrame(() => {
            foodCarouselResizeFrame = 0;
            updateFoodCarouselControls();
        });
    }

    function scrollFoodCards(direction) {
        const cards = [...foodTrack.querySelectorAll('.pairing_food_card')];
        if (!cards.length) return;

        const starts = cards.map(getFoodCardScrollStart);
        const currentIndex = starts.reduce((nearestIndex, start, index) => (
            Math.abs(start - foodTrack.scrollLeft) < Math.abs(starts[nearestIndex] - foodTrack.scrollLeft)
                ? index
                : nearestIndex
        ), 0);
        const nextIndex = Math.max(0, Math.min(cards.length - 1, currentIndex + direction));

        foodTrack.scrollTo({ left: starts[nextIndex], behavior: 'smooth' });
    }

    function createMouseDragScroller(element) {
        let isPointerDown = false;
        let isDragging = false;
        let pointerId = null;
        let startX = 0;
        let startScrollLeft = 0;
        let pendingScrollLeft = null;
        let animationFrameId = 0;

        const applyPendingScroll = () => {
            if (pendingScrollLeft !== null) {
                element.scrollLeft = pendingScrollLeft;
                pendingScrollLeft = null;
            }
            animationFrameId = 0;
        };

        const flushPendingScroll = () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = 0;
            }
            applyPendingScroll();
        };

        element.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;

            isPointerDown = true;
            pointerId = event.pointerId;
            startX = event.clientX;
            startScrollLeft = element.scrollLeft;
            element.setPointerCapture(event.pointerId);
        });

        element.addEventListener('pointermove', (event) => {
            if (!isPointerDown || event.pointerId !== pointerId) return;

            const distance = event.clientX - startX;
            if (!isDragging && Math.abs(distance) < 4) return;

            if (!isDragging) {
                isDragging = true;
                element.classList.add('is_dragging');
            }

            event.preventDefault();
            pendingScrollLeft = startScrollLeft - distance;
            if (!animationFrameId) animationFrameId = requestAnimationFrame(applyPendingScroll);
        });

        const finishDragging = (event) => {
            if (!isPointerDown || event.pointerId !== pointerId) return;

            flushPendingScroll();
            isPointerDown = false;
            isDragging = false;
            element.classList.remove('is_dragging');
            if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
            pointerId = null;
        };

        element.addEventListener('pointerup', finishDragging);
        element.addEventListener('pointercancel', finishDragging);
        element.addEventListener('lostpointercapture', finishDragging);
    }

    function renderRecipePickers() {
        const pickerButtons = recipePickerList.querySelectorAll('[data-recipe-index]');

        if (pickerButtons.length !== recipes.length) {
            recipePickerList.innerHTML = recipes.map((recipe, index) => `
                <button class="pairing_recipe_picker" type="button" data-recipe-index="${index}" aria-pressed="false" aria-label="Show ${escapeHtml(recipe.title)} recipe">
                    <img src="${assetUrl(`img/drink/${recipe.image}`)}" alt="" aria-hidden="true">
                    <span class="pairing_sr_only">${escapeHtml(recipe.title)}</span>
                </button>`).join('');
        }

        recipePickerList.querySelectorAll('[data-recipe-index]').forEach((picker) => {
            const isActive = Number(picker.dataset.recipeIndex) === state.recipeIndex;
            picker.classList.toggle('is_active', isActive);
            picker.setAttribute('aria-pressed', String(isActive));
        });
    }

    function getRecipeRenderData(recipe) {
        const ingredientMarkup = recipe.ingredients.map((ingredient) => `<li>${escapeHtml(ingredient)}</li>`).join('');
        const stepMarkup = recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');
        const iconSet = recipe.icons || recipeIconSet;
        const tipLines = Array.isArray(recipe.tipLines)
            ? recipe.tipLines
            : Array.isArray(recipe.tip)
                ? recipe.tip
                : [recipe.tip];
        const tipMarkup = tipLines.map((line) => `<span>${escapeHtml(line)}</span>`).join('');

        return {
            ingredientMarkup,
            stepMarkup,
            iconSet,
            tipMarkup,
            metaMarkup: `
                <span class="pairing_recipe_meta_item is_feature"><img src="${assetUrl(iconSet.bookmark)}" alt="" aria-hidden="true"><span>${escapeHtml(recipe.feature)}</span></span>
                <span class="pairing_recipe_meta_item"><img src="${assetUrl(iconSet.level)}" alt="" aria-hidden="true"><span>${escapeHtml(recipe.difficulty)}</span></span>
                <span class="pairing_recipe_meta_item"><img src="${assetUrl(iconSet.clock)}" alt="" aria-hidden="true"><span>${escapeHtml(recipe.time)}</span></span>`
        };
    }

    function getRecipeMarkup(recipe) {
        const { ingredientMarkup, stepMarkup, iconSet, tipMarkup, metaMarkup } = getRecipeRenderData(recipe);

        return `
            <article class="pairing_recipe_card pairing_recipe_card--${escapeHtml(recipe.id)}" aria-labelledby="pairing_recipe_title">
                <div class="pairing_recipe_content">
                    <div class="pairing_recipe_inner">
                        <div class="pairing_recipe_intro">
                            <h3 class="pairing_recipe_title" id="pairing_recipe_title">${escapeHtml(recipe.title)}</h3>
                            <div class="pairing_recipe_meta" aria-label="Recipe details">
                                ${metaMarkup}
                            </div>
                        </div>
                        <div class="pairing_recipe_details">
                            <div class="pairing_recipe_columns">
                                <section class="pairing_recipe_ingredient_section" aria-labelledby="pairing_ingredients_title">
                                    <h4 id="pairing_ingredients_title">Ingredients</h4>
                                    <ul class="pairing_recipe_ingredient_list">${ingredientMarkup}</ul>
                                </section>
                                <img class="pairing_recipe_divider" src="${assetUrl(iconSet.divider)}" alt="" aria-hidden="true">
                                <section class="pairing_recipe_step_section" aria-labelledby="pairing_steps_title">
                                    <h4 id="pairing_steps_title">How to Make</h4>
                                    <ol class="pairing_recipe_step_list">${stepMarkup}</ol>
                                </section>
                            </div>
                            <div class="pairing_recipe_tip" role="note">
                                <p class="pairing_recipe_tip_title">Tip!</p>
                                <p class="pairing_recipe_tip_copy">${tipMarkup}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pairing_recipe_media">
                    <img class="pairing_recipe_image" src="${assetUrl(`img/drink/${recipe.image}`)}" alt="${escapeHtml(recipe.title)}">
                </div>
            </article>`;
    }

    function updateRecipeCard(recipeCard, recipe) {
        const { ingredientMarkup, stepMarkup, iconSet, tipMarkup, metaMarkup } = getRecipeRenderData(recipe);
        const recipeClass = `pairing_recipe_card--${recipe.id}`;
        const currentRecipeClass = Array.from(recipeCard.classList)
            .find((className) => className.startsWith('pairing_recipe_card--'));

        if (currentRecipeClass && currentRecipeClass !== recipeClass) {
            recipeCard.classList.replace(currentRecipeClass, recipeClass);
        } else if (!currentRecipeClass) {
            recipeCard.classList.add(recipeClass);
        }

        const title = recipeCard.querySelector('.pairing_recipe_title');
        const meta = recipeCard.querySelector('.pairing_recipe_meta');
        const ingredients = recipeCard.querySelector('.pairing_recipe_ingredient_list');
        const divider = recipeCard.querySelector('.pairing_recipe_divider');
        const steps = recipeCard.querySelector('.pairing_recipe_step_list');
        const tipCopy = recipeCard.querySelector('.pairing_recipe_tip_copy');
        const recipeImage = recipeCard.querySelector('.pairing_recipe_image');

        if (title) title.textContent = recipe.title;
        if (meta) meta.innerHTML = metaMarkup;
        if (ingredients) ingredients.innerHTML = ingredientMarkup;
        if (divider) divider.setAttribute('src', assetUrl(iconSet.divider));
        if (steps) steps.innerHTML = stepMarkup;
        if (tipCopy) tipCopy.innerHTML = tipMarkup;
        if (recipeImage) {
            recipeImage.setAttribute('src', assetUrl(`img/drink/${recipe.image}`));
            recipeImage.setAttribute('alt', recipe.title);
        }
    }

    function renderRecipe({ reveal = false, transitionId = null } = {}) {
        const recipe = recipes[state.recipeIndex];
        const recipeCard = recipeViewport.querySelector('.pairing_recipe_card');

        if (!recipeCard) {
            recipeViewport.innerHTML = getRecipeMarkup(recipe);
            return;
        }

        updateRecipeCard(recipeCard, recipe);

        if (!reveal) return;

        const finishTransition = () => {
            if (transitionId === recipeTransitionId) {
                recipeCard.classList.remove('is_changing');
            }
        };

        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(finishTransition);
        } else {
            setTimeout(finishTransition, 0);
        }
    }

    function prefersReducedMotion() {
        return typeof window !== 'undefined'
            && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function scheduleRecipeRender() {
        const recipeCard = recipeViewport.querySelector('.pairing_recipe_card');

        if (!recipeCard || prefersReducedMotion()) {
            if (recipeTransitionTimer !== null) window.clearTimeout(recipeTransitionTimer);
            recipeTransitionTimer = null;
            renderRecipe();
            return;
        }

        const transitionId = ++recipeTransitionId;
        recipeCard.classList.add('is_changing');

        if (recipeTransitionTimer !== null) window.clearTimeout(recipeTransitionTimer);
        recipeTransitionTimer = window.setTimeout(() => {
            recipeTransitionTimer = null;
            renderRecipe({ reveal: true, transitionId });
        }, 110);
    }

    function setRecipe(index) {
        const nextRecipeIndex = (index + recipes.length) % recipes.length;
        if (nextRecipeIndex === state.recipeIndex) return;

        state.recipeIndex = nextRecipeIndex;
        renderRecipePickers();
        scheduleRecipeRender();

        const selectedPicker = recipePickerList.querySelector('.is_active');
        selectedPicker?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
    }

    function addSwipeNavigation(element, callback) {
        let pointerStartX = null;

        element.addEventListener('pointerdown', (event) => {
            pointerStartX = event.clientX;
        });

        element.addEventListener('pointerup', (event) => {
            if (pointerStartX === null) return;
            const horizontalDistance = event.clientX - pointerStartX;
            pointerStartX = null;
            if (Math.abs(horizontalDistance) < 48) return;
            callback(horizontalDistance < 0 ? 1 : -1);
        });

        element.addEventListener('pointercancel', () => {
            pointerStartX = null;
        });
    }

    function getRecommendedProduct() {
        const scores = Object.fromEntries(Object.keys(products).map((productId) => [productId, 0]));

        Object.entries(state.answers).forEach(([questionId, answerId]) => {
            const answerWeights = recommendationWeights[questionId]?.[answerId] || {};
            Object.entries(answerWeights).forEach(([productId, weight]) => {
                scores[productId] += weight;
            });
        });

        const recommendedProductId = Object.entries(scores)
            .sort(([firstProductId, firstScore], [secondProductId, secondScore]) => {
                if (secondScore !== firstScore) return secondScore - firstScore;
                return firstProductId.localeCompare(secondProductId);
            })[0][0];

        return products[recommendedProductId];
    }

    function renderResult() {
        const product = getRecommendedProduct();
        const profileMarkup = Object.entries(product.profile).map(([name, value]) => {
            const filledTasteIcons = Math.max(1, Math.min(5, Math.round(value / 20)));
            const tasteIcons = Array.from({ length: 5 }, (_, index) => `
                <img src="${assetUrl(`icon/${index < filledTasteIcons ? 'taste_on.svg' : 'taste_off.svg'}`)}" alt="" aria-hidden="true">`).join('');
            return `
                <div class="pairing_modal_taste_item">
                    <dt>${escapeHtml(name)}</dt>
                    <dd>${tasteIcons}</dd>
                </div>`;
        }).join('');

        resultModalContent.innerHTML = `
            <header class="pairing_modal_result_header">
                <p>Try the clear top layer first before mixing!</p>
                <h2 id="pairing_result_modal_title">YOUR PERFECT MATCH</h2>
            </header>
            <div class="pairing_modal_result_layout">
                <section class="pairing_modal_recommendation_card" aria-labelledby="pairing_recommended_title">
                    <div class="pairing_modal_recommendation_inner">
                        <div class="pairing_modal_product_overview">
                            <img class="pairing_modal_recommended_image" src="${assetUrl(`img/result/${product.image}`)}" alt="${escapeHtml(product.name)} bottle">
                            <div class="pairing_modal_product_copy">
                                <p class="pairing_modal_recommended_label">RECOMMENDED</p>
                                <h3 id="pairing_recommended_title"><span>Kooksoondang</span><span>${escapeHtml(product.name)}</span></h3>
                                <p class="pairing_modal_product_description">${escapeHtml(product.description)}</p>
                                <dl class="pairing_modal_taste_profile" aria-label="Taste profile">${profileMarkup}</dl>
                            </div>
                        </div>
                        <aside class="pairing_modal_similar_panel" aria-labelledby="pairing_similar_title">
                            <h3 id="pairing_similar_title">Similar Products</h3>
                            <div class="pairing_modal_similar_products" aria-hidden="true">
                                <img class="pairing_modal_similar_bottle" src="${assetUrl('img/result/prebiotics_bottle.png')}" alt="">
                                <img class="pairing_modal_similar_can" src="${assetUrl('img/result/prebiotics_can.png')}" alt="">
                            </div>
                            <p>Kooksoondang<br>Prebiotics Makgeolli</p>
                            <a class="pairing_modal_view_more" href="../products/products.html">View More</a>
                        </aside>
                    </div>
                </section>
                <aside class="pairing_modal_tip_card" aria-labelledby="pairing_tip_title">
                    <div class="pairing_modal_tip_illustration" aria-hidden="true">
                        <img class="pairing_modal_tip_illustration_back" src="${assetUrl('img/result/tip_illustration_back.png')}" alt="">
                        <img class="pairing_modal_tip_illustration_front" src="${assetUrl('img/result/tip_illustration_front.png')}" alt="">
                    </div>
                    <h3 id="pairing_tip_title">tip!</h3>
                    <div class="pairing_modal_tip_list">
                        <section>
                            <h4>Taste the Clear Top First</h4>
                            <p>Try the clear layer before mixing for a light and crisp flavor.</p>
                        </section>
                        <section>
                            <h4>Mix Before Drinking</h4>
                            <p>Release the gas gently, then swirl to blend the rice sediment for a richer taste.</p>
                        </section>
                    </div>
                </aside>
            </div>
            <div class="pairing_modal_result_actions">
                <a class="pairing_modal_food_cta" href="#food_pairing" data-result-food>
                    <span>Explore Food Pairings</span>
                    <img src="${assetUrl('icon/result_arrow.svg')}" alt="" aria-hidden="true">
                </a>
                <button class="pairing_modal_continue" type="button" data-result-continue>or continue exploring</button>
            </div>`;
    }

    function restoreResultModalFocus() {
        const opener = resultModalOpener;
        resultModalOpener = null;

        if (!shouldRestoreResultFocus || !opener?.isConnected) return;

        try {
            opener.focus({ preventScroll: true });
        } catch {
            opener.focus();
        }
    }

    function handleResultModalClose() {
        document.body.classList.remove('is_pairing_modal_open');
        restoreResultModalFocus();
        shouldRestoreResultFocus = true;
    }

    function openResultModal(opener) {
        if (!areAllQuestionsAnswered()) return;

        resultModalOpener = opener || questionnaire.querySelector(`[data-question-next="${questions.length - 1}"]`);
        shouldRestoreResultFocus = true;
        renderResult();
        document.body.classList.add('is_pairing_modal_open');
        if (typeof resultModal.showModal === 'function') {
            resultModal.showModal();
        } else {
            resultModal.setAttribute('open', '');
        }
        resultModalContent.querySelector('[data-result-continue]')?.focus();
    }

    function closeResultModal(shouldRestoreFocus = true) {
        shouldRestoreResultFocus = shouldRestoreFocus;
        if (typeof resultModal.close === 'function' && resultModal.open) {
            resultModal.close();
            return;
        } else {
            resultModal.removeAttribute('open');
        }
        handleResultModalClose();
    }

    questionnaire.addEventListener('click', handleQuestionnaireClick);
    modalCloseButton.addEventListener('click', closeResultModal);
    resultModalContent.addEventListener('click', (event) => {
        const continueButton = event.target.closest('[data-result-continue]');
        const foodLink = event.target.closest('[data-result-food]');

        if (continueButton) {
            closeResultModal();
            return;
        }

        if (foodLink) {
            event.preventDefault();
            closeResultModal(false);
            document.querySelector('#food_pairing')?.scrollIntoView({ behavior: 'smooth' });
        }
    });
    resultModal.addEventListener('close', handleResultModalClose);
    resultModal.addEventListener('click', (event) => {
        if (event.target === resultModal) closeResultModal();
    });

    foodTabs.forEach((tab) => {
        tab.addEventListener('click', () => setFoodCategory(tab.dataset.foodCategory));
    });
    foodPreviousButton?.addEventListener('click', () => scrollFoodCards(-1));
    foodNextButton?.addEventListener('click', () => scrollFoodCards(1));
    foodTrack.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            scrollFoodCards(-1);
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            scrollFoodCards(1);
        }
    });
    createMouseDragScroller(foodTrack);
    window.addEventListener('resize', scheduleFoodCarouselControlUpdate, { passive: true });

    recipePickerList.addEventListener('click', (event) => {
        const picker = event.target.closest('[data-recipe-index]');
        if (!picker) return;
        setRecipe(Number(picker.dataset.recipeIndex));
    });
    document.querySelector('#pairing_recipe_previous')?.addEventListener('click', () => setRecipe(state.recipeIndex - 1));
    document.querySelector('#pairing_recipe_next')?.addEventListener('click', () => setRecipe(state.recipeIndex + 1));
    recipeViewport.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setRecipe(state.recipeIndex - 1);
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            setRecipe(state.recipeIndex + 1);
        }
    });
    addSwipeNavigation(recipeViewport, (direction) => setRecipe(state.recipeIndex + direction));

    document.addEventListener('error', (event) => {
        const image = event.target;
        if (!(image instanceof HTMLImageElement) || !image.closest('.pairing_main, .pairing_result_modal')) return;
        image.classList.add('has_error');
        image.alt = 'Image unavailable. Please refresh the page.';
    }, true);

    renderQuestionnaire();
    renderFoodCards();
    renderRecipePickers();
    renderRecipe();
})();
