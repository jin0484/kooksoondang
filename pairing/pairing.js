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
            { title: 'Pajeon', description: 'Korean Scallion Pancake', tag: 'Savory', image: 'Pajeon.jpg' },
            { title: 'Bossam', description: 'Boiled Pork Wraps', tag: 'Rich & Savory', image: 'Bossam.png' },
            { title: 'Bulgogi', description: 'Korean Barbecue Beef', tag: 'Sweet & Savory', image: 'Bulgogi.png' },
            { title: 'Dakgalbi', description: 'Spicy Stir-fried Chicken', tag: 'Spicy', image: 'Dakgalbi.jpg' },
            { title: 'Dotori-muk Muchim', description: 'Acorn Jelly Salad', tag: 'Fresh', image: 'Dotori-muk Muchim.png' },
            { title: 'Dubu Kimchi', description: 'Tofu with Stir-fried Kimchi', tag: 'Spicy', image: 'DubuKimchi.jpg' },
            { title: 'Jeyuk Bokkeum', description: 'Spicy Stir-fried Pork', tag: 'Rich & Spicy', image: 'Jeyuk Bokkeum.png' },
            { title: 'Kimchi Jjigae', description: 'Kimchi Stew', tag: 'Rich & Savory', image: 'Kimchi Jjigae.png' }
        ],
        global: [
            { title: 'Thai Green Curry', description: 'Creamy Coconut Curry', tag: 'Fresh & Spicy', image: 'Thai Green Curry.png' },
            { title: 'Strawberry Cheesecake', description: 'Creamy Berry Dessert', tag: 'Sweet', image: 'Strawberry Cheesecake.png' },
            { title: 'Spicy Beef Tacos', description: 'Mexican Beef Tacos', tag: 'Spicy', image: 'Spicy Beef Tacos.png' },
            { title: 'Margherita Pizza', description: 'Classic Tomato & Cheese Pizza', tag: 'Savory', image: 'Margherita Pizza.png' },
            { title: 'Japanese Gyoza', description: 'Pan-fried Dumplings', tag: 'Savory', image: 'Japanese Gyoza.png' },
            { title: 'Jamón with Melon', description: 'Spanish Ham and Melon', tag: 'Sweet & Savory', image: 'Jamón with Melon.png' },
            { title: 'Fish and Chips', description: 'Crispy Fried Fish', tag: 'Rich', image: 'Fish and Chips.jpg' },
            { title: 'Buffalo Wings', description: 'Hot Chicken Wings', tag: 'Spicy', image: 'Buffalo Wings.png' }
        ]
    };

    foodData.popular = [
        foodData.korean[0],
        foodData.korean[1],
        foodData.korean[2],
        foodData.korean[3],
        foodData.korean[4]
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
            feature: 'A refreshing sparkling twist',
            difficulty: 'Beginner',
            time: '10 min',
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
            steps: ['Remove the strawberry stems and cut the berries into small pieces.', 'Gently mash the strawberries with the strawberry syrup.', 'Fill a glass with ice, then add the strawberry mixture.', 'Pour in the Makgeolli and stir gently until evenly blended.'],
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
            steps: ['Mix the honey with warm water until completely dissolved.', 'Gently swirl the Makgeolli bottle to blend the sediment.', 'Fill a glass with ice, then pour in the Makgeolli.', 'Add the honey mixture and stir gently until well combined.'],
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
            steps: ['Sift the matcha powder into a small bowl to remove any lumps.', 'Add warm water and whisk until smooth and lightly foamy.', 'Pour the chilled Makgeolli and simple syrup into a glass.', 'Slowly pour the matcha over the top to create a layered finish.'],
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
            steps: ['Fill a highball glass to the brim with large ice cubes.', 'Pour in the Baekseju and gently swirl to chill the drink.', 'Add the honey syrup and stir once until evenly combined.', 'Slowly pour in the sparkling water to preserve the carbonation.'],
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

    const assetUrl = (path) => encodeURI(`./pairing_asset/${path}`);
    const escapeHtml = (value) => String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    const questionnaire = document.querySelector('#pairing_questionnaire');
    const resultButton = document.querySelector('#pairing_result_button');
    const foodTrack = document.querySelector('#pairing_food_track');
    const foodTabs = document.querySelectorAll('.pairing_food_tab');
    const recipePickerList = document.querySelector('#pairing_recipe_picker_list');
    const recipeViewport = document.querySelector('#pairing_recipe_viewport');
    const resultModal = document.querySelector('#pairing_result_modal');
    const resultModalContent = document.querySelector('#pairing_result_modal_content');
    const modalCloseButton = document.querySelector('#pairing_modal_close');

    if (!questionnaire || !resultButton || !foodTrack || !recipePickerList || !recipeViewport || !resultModal || !resultModalContent || !modalCloseButton) {
        return;
    }

    function getQuestionPanelId(question) {
        return `pairing_question_panel_${question.id}`;
    }

    function getQuestionContentId(question) {
        return `pairing_question_content_${question.id}`;
    }

    function getQuestionPanelMarkup(question, questionIndex) {
        const isOpen = questionIndex === state.activeQuestionIndex;
        const selectedAnswer = state.answers[question.id];
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
                </div>
            </section>`;
    }

    function renderQuestionnaire() {
        const needsInitialRender = questions.some((question) => !questionnaire.querySelector(`#${getQuestionPanelId(question)}`));

        if (needsInitialRender) {
            questionnaire.innerHTML = questions.map((question, index) => getQuestionPanelMarkup(question, index)).join('');
        }

        questions.forEach((question, questionIndex) => {
            const panel = questionnaire.querySelector(`#${getQuestionPanelId(question)}`);
            if (!panel) return;

            const isOpen = questionIndex === state.activeQuestionIndex;
            const selectedAnswer = state.answers[question.id];
            const tab = panel.querySelector('[data-question-open]');
            const content = panel.querySelector('.pairing_question_content');

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
        });
    }

    function focusActiveQuestionOption() {
        const activeQuestion = questions[state.activeQuestionIndex];
        if (!activeQuestion) return;

        const focusOption = () => questionnaire
            .querySelector(`#${getQuestionPanelId(activeQuestion)} [data-question-answer]`)
            ?.focus();

        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(focusOption);
        } else {
            setTimeout(focusOption, 0);
        }
    }

    function updateResultButton() {
        const canShowResult = questions.every((question) => Boolean(state.answers[question.id]));
        resultButton.disabled = !canShowResult;
        resultButton.setAttribute('aria-disabled', String(!canShowResult));
    }

    function handleQuestionnaireClick(event) {
        const answerButton = event.target.closest('[data-question-answer]');
        const questionTab = event.target.closest('[data-question-open]');

        if (answerButton) {
            const questionId = answerButton.dataset.questionAnswer;
            const answerValue = answerButton.dataset.answerValue;
            const answeredQuestionIndex = questions.findIndex((question) => question.id === questionId);
            state.answers[questionId] = answerValue;

            const nextUnansweredIndex = questions.findIndex((question) => !state.answers[question.id]);
            const nextQuestionIndex = nextUnansweredIndex === -1 ? answeredQuestionIndex : nextUnansweredIndex;
            const shouldMoveFocus = nextQuestionIndex !== state.activeQuestionIndex;
            state.activeQuestionIndex = nextQuestionIndex;

            renderQuestionnaire();
            updateResultButton();
            if (shouldMoveFocus) focusActiveQuestionOption();
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
        foodTrack.innerHTML = foods.map((food) => `
            <article class="pairing_food_card">
                <img class="pairing_food_card_image" src="${assetUrl(`img/food/${food.image}`)}" alt="${escapeHtml(food.title)}" loading="lazy">
                <h3>${escapeHtml(food.title)}</h3>
                <p>${escapeHtml(food.description)}</p>
                <span class="pairing_food_tag">${escapeHtml(food.tag)}</span>
            </article>`).join('');
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
        foodTrack.scrollLeft = 0;
    }

    function scrollFoodCards(direction) {
        const card = foodTrack.querySelector('.pairing_food_card');
        const distance = card ? card.getBoundingClientRect().width + 20 : 300;
        foodTrack.scrollBy({ left: distance * direction, behavior: 'smooth' });
    }

    function createMouseDragScroller(element) {
        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;

        element.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            isDragging = true;
            startX = event.clientX;
            startScrollLeft = element.scrollLeft;
            element.classList.add('is_dragging');
            element.setPointerCapture(event.pointerId);
        });

        element.addEventListener('pointermove', (event) => {
            if (!isDragging) return;
            element.scrollLeft = startScrollLeft - (event.clientX - startX);
        });

        const finishDragging = (event) => {
            if (!isDragging) return;
            isDragging = false;
            element.classList.remove('is_dragging');
            if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
        };

        element.addEventListener('pointerup', finishDragging);
        element.addEventListener('pointercancel', finishDragging);
    }

    function renderRecipePickers() {
        recipePickerList.innerHTML = recipes.map((recipe, index) => {
            const isActive = index === state.recipeIndex;
            return `
                <button class="pairing_recipe_picker${isActive ? ' is_active' : ''}" type="button" data-recipe-index="${index}" aria-pressed="${isActive}" aria-label="Show ${escapeHtml(recipe.title)} recipe">
                    <img src="${assetUrl(`img/drink/${recipe.image}`)}" alt="" aria-hidden="true">
                    <span class="pairing_sr_only">${escapeHtml(recipe.title)}</span>
                </button>`;
        }).join('');
    }

    function renderRecipe() {
        const recipe = recipes[state.recipeIndex];
        const ingredientMarkup = recipe.ingredients.map((ingredient) => `<li>${escapeHtml(ingredient)}</li>`).join('');
        const stepMarkup = recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');
        const iconSet = recipe.icons || recipeIconSet;
        const tipLines = Array.isArray(recipe.tipLines)
            ? recipe.tipLines
            : Array.isArray(recipe.tip)
                ? recipe.tip
                : [recipe.tip];
        const tipMarkup = tipLines.map((line) => `<span>${escapeHtml(line)}</span>`).join('');

        recipeViewport.innerHTML = `
            <article class="pairing_recipe_card pairing_recipe_card--${escapeHtml(recipe.id)}" aria-labelledby="pairing_recipe_title">
                <div class="pairing_recipe_content">
                    <div class="pairing_recipe_inner">
                        <div class="pairing_recipe_intro">
                            <h3 class="pairing_recipe_title" id="pairing_recipe_title">${escapeHtml(recipe.title)}</h3>
                            <div class="pairing_recipe_meta" aria-label="Recipe details">
                                <span class="pairing_recipe_meta_item is_feature"><img src="${assetUrl(iconSet.bookmark)}" alt="" aria-hidden="true"><span>${escapeHtml(recipe.feature)}</span></span>
                                <span class="pairing_recipe_meta_item"><img src="${assetUrl(iconSet.level)}" alt="" aria-hidden="true"><span>${escapeHtml(recipe.difficulty)}</span></span>
                                <span class="pairing_recipe_meta_item"><img src="${assetUrl(iconSet.clock)}" alt="" aria-hidden="true"><span>${escapeHtml(recipe.time)}</span></span>
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

    function setRecipe(index) {
        state.recipeIndex = (index + recipes.length) % recipes.length;
        renderRecipePickers();
        renderRecipe();

        const selectedPicker = recipePickerList.querySelector('.is_active');
        selectedPicker?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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

    function openResultModal() {
        if (resultButton.disabled) return;

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
        if (typeof resultModal.close === 'function' && resultModal.open) {
            resultModal.close();
        } else {
            resultModal.removeAttribute('open');
        }
        document.body.classList.remove('is_pairing_modal_open');
        if (shouldRestoreFocus) resultButton.focus();
    }

    questionnaire.addEventListener('click', handleQuestionnaireClick);
    resultButton.addEventListener('click', openResultModal);
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
    resultModal.addEventListener('close', () => document.body.classList.remove('is_pairing_modal_open'));
    resultModal.addEventListener('click', (event) => {
        if (event.target === resultModal) closeResultModal();
    });

    foodTabs.forEach((tab) => {
        tab.addEventListener('click', () => setFoodCategory(tab.dataset.foodCategory));
    });
    document.querySelector('.pairing_food_previous')?.addEventListener('click', () => scrollFoodCards(-1));
    document.querySelector('.pairing_food_next')?.addEventListener('click', () => scrollFoodCards(1));
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
    updateResultButton();
    renderFoodCards();
    renderRecipePickers();
    renderRecipe();
})();
