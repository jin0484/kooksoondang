/* 스토리형 테스트 진행 담당.
   화면 이동 규칙은 전부 HTML 의 data-next / data-set 에 적어 뒀고,
   여기서는 그걸 읽어서 화면을 갈아 끼우고 마지막에 결과만 계산함. */

(function () {
    'use strict';

    var test = document.getElementById('test');
    if (!test) return;

    var btnBack = document.getElementById('btn_back');
    var progress = document.getElementById('progress');
    var progressNow = document.getElementById('progress_now');

    var START = 'intro';

    /* 지금까지 고른 답. rank(신분) / mate(동행) / drink(술) / food(안주) */
    var answers = {};
    /* 뒤로가기용. 지나온 화면 id 를 쌓아 둠 */
    var trail = [];
    var current = null;

    /* ------------------------------------------------------------------
       결과 판정
       경우의 수 표 그대로임.

       양반 : 술이 위스키/와인이면 무조건 C
              그 외에는 혼자 A / 함께 B  (안주 선택은 결과에 영향 없음)
       평민 : 안주를 고르면 무조건 E
              술만 고르면 함께 D / 혼자 F  (술 종류는 결과에 영향 없음)
    ------------------------------------------------------------------ */
    function resultId() {
        if (answers.rank === 'yangban') {
            if (answers.drink === 'wine') return 'result_c';
            return answers.mate === 'alone' ? 'result_a' : 'result_b';
        }

        if (answers.food === 'yes') return 'result_e';
        return answers.mate === 'together' ? 'result_d' : 'result_f';
    }

    /* data-next 에 적힌 값을 실제 화면 id 로 바꿔 줌.
       "result" 는 위 판정으로, "q4" 는 신분에 따라 갈림 (술 전환 컷이 신분 공용이라서) */
    function resolve(next) {
        if (next === 'result') return resultId();
        if (next === 'q4') return 'q4_' + answers.rank;
        return next;
    }

    /* ------------------------------------------------------------------
       인트로 연출 (main 히어로와 같은 순서)
       제목이 물결로 차오름 -> 잔이 획순대로 그려짐. (설명 문구는 연출 없이 처음부터 보임)
       인트로 화면이 켜질 때마다(첫 진입 / 다시하기) 처음부터 다시 재생함
    ------------------------------------------------------------------ */
    var intro = (function () {
        var title = document.querySelector('.intro_title');
        var cup = document.querySelector('.intro_cup');
        var walker = document.querySelector('.intro_walker');
        /* 할머니가 다 걸어온 뒤 획이 그려지는 말풍선. 지연은 css 가 잡음 */
        var bubble = document.querySelector('.intro_bubble');

        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var supportsClip = typeof CSS === 'object'
            && typeof CSS.supports === 'function'
            && (CSS.supports('background-clip', 'text') || CSS.supports('-webkit-background-clip', 'text'));

        /* 할머니가 서는 높이를 TEST START 버튼 아랫줄에 맞춤.
           인트로 글 묶음이 화면 세로 가운데에 놓여 그 줄 위치가 창 크기마다 달라지므로,
           화면 바닥에서 버튼 줄까지의 거리를 재서 --walker-bottom 으로 넘겨 줌.
           걸어오는 연출을 쓰지 않는 경우에도 서는 자리는 같아야 해서 모션 여부와 상관없이 돌림 */
        function syncWalkerLine() {
            var screen = document.getElementById(START);
            var actions = document.querySelector('.intro_actions');
            if (!walker || !screen || !actions) return;

            var gap = screen.getBoundingClientRect().bottom - actions.getBoundingClientRect().bottom;
            screen.style.setProperty('--walker-bottom', Math.round(gap) + 'px');
        }

        window.addEventListener('resize', syncWalkerLine);

        /* 모션을 끈 사용자에겐 등장 연출 없이 자리만 맞춰 두고 끝냄 */
        if (reduced) return { play: syncWalkerLine };

        var pourDone = 0;

        /* 채우기가 끝나면 클래스를 떼어 평범하게 칠해진 글자로 되돌림 */
        function endPour() {
            window.clearTimeout(pourDone);
            if (title) title.classList.remove('is_pour_ready', 'is_pour_running');
        }

        function play() {
            endPour();

            if (cup) cup.classList.remove('is_draw_running');
            if (bubble) bubble.classList.remove('is_draw_running');

            syncWalkerLine();

            /* 할머니는 css 애니메이션이라 한 번 끝나면 그대로 서 있음.
               다시하기로 인트로에 돌아왔을 때 또 걸어 들어오도록 애니메이션을 끊었다 다시 붙임
               (offsetWidth 를 읽어 브라우저가 "없는 상태"를 한 번 계산하게 만듦) */
            if (walker) {
                walker.style.animation = 'none';
                void walker.offsetWidth;
                walker.style.animation = '';
            }

            if (title && supportsClip) title.classList.add('is_pour_ready');

            /* 대기 상태가 한 프레임 그려진 뒤라야 처음부터 재생됨 */
            window.requestAnimationFrame(function () {
                if (title && supportsClip) title.classList.add('is_pour_running');
                if (cup) cup.classList.add('is_draw_running');
                if (bubble) bubble.classList.add('is_draw_running');
            });

            /* 애니메이션이 끝내 재생되지 않아도 글자가 투명한 채로 남지 않도록 */
            if (title && supportsClip) pourDone = window.setTimeout(endPour, 3000);
        }

        if (title) {
            title.addEventListener('animationend', function (e) {
                if (e.animationName === 'intro_title_pour') endPour();
            });
        }

        return { play: play };
    })();

    /* ------------------------------------------------------------------
       그림 넘기기 (flipbook)
       data-frames 에 적힌 그림 목록을 data-frame-ms 간격으로 돌려 끼워
       두 장짜리 손그림이 움직이는 것처럼 보이게 함.
       켜진 화면 안의 그림만 돌리고, 화면을 나가면 멈추고 첫 장으로 되돌림
    ------------------------------------------------------------------ */
    var flipbook = (function () {
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var timers = [];

        function frames(img) {
            return (img.getAttribute('data-frames') || '').split(',').map(function (src) {
                return src.trim();
            }).filter(Boolean);
        }

        /* 첫 전환에서 그림이 깜빡이지 않게 미리 받아 둠 */
        [].forEach.call(document.querySelectorAll('[data-frames]'), function (img) {
            frames(img).forEach(function (src) {
                var preload = new Image();
                preload.src = src;
            });
        });

        function stop() {
            timers.forEach(window.clearInterval);
            timers = [];

            [].forEach.call(document.querySelectorAll('[data-frames]'), function (img) {
                var list = frames(img);
                if (list.length) img.src = list[0];
            });
        }

        function start(screen) {
            if (reduced) return;

            [].forEach.call(screen.querySelectorAll('[data-frames]'), function (img) {
                var list = frames(img);
                if (list.length < 2) return;

                var step = Number(img.getAttribute('data-frame-ms')) || 450;
                var index = 0;

                var timer = window.setInterval(function () {
                    index = (index + 1) % list.length;
                    img.src = list[index];
                }, step);

                timers.push(timer);

                /* 자리를 옮기는 연출(css 애니메이션)이 붙어 있으면 그게 끝날 때 걸음도 멈추고
                   선 자세(첫 장)로 돌아감. 할머니가 가운데 도착해서 멈추는 게 이 경우 */
                img.addEventListener('animationend', function onArrive() {
                    img.removeEventListener('animationend', onArrive);
                    window.clearInterval(timer);
                    img.src = list[0];
                });
            });
        }

        return { start: start, stop: stop };
    })();

    /* ------------------------------------------------------------------
       쓸고 지나가는 화면 전환
       덮개가 한쪽 끝에서 들어와 화면을 다 덮은 순간에 화면을 갈아 끼우고,
       방향을 되돌리지 않고 그대로 반대쪽으로 빠져나가며 새 화면을 드러냄.
       움직임은 css 가 맡고 여기서는 단계(클래스)와 시점만 잡아 줌
    ------------------------------------------------------------------ */
    var wipe = (function () {
        var el = document.getElementById('wipe');
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var busy = false;

        /* css 의 --wipe-cover / --wipe-reveal 을 그대로 읽어 씀. 두 곳에 같은 값을 적지 않으려고 */
        function ms(name) {
            var raw = window.getComputedStyle(test).getPropertyValue(name).trim();
            return parseFloat(raw) * (raw.indexOf('ms') > -1 ? 1 : 1000) || 600;
        }

        function reset() {
            el.classList.remove('is_cover', 'is_reveal');
            test.classList.remove('is_wiping', 'is_wipe_cover', 'is_wipe_reveal');
            test.removeAttribute('data-wipe-dir');
            busy = false;
        }

        /* dir 은 'ltr'(왼→오) 또는 'rtl'(오→왼). swap 은 다 덮인 순간에 부를 화면 교체 */
        function run(dir, swap) {
            if (!el || reduced) {
                swap();
                return;
            }

            /* 도는 중에 또 눌러도 덮개가 다시 그려지지 않게 한 번만 받음 */
            if (busy) return;
            busy = true;

            var cover = ms('--wipe-cover');
            var reveal = ms('--wipe-reveal');

            el.setAttribute('data-dir', dir);
            test.setAttribute('data-wipe-dir', dir);
            test.classList.add('is_wiping', 'is_wipe_cover');
            el.classList.add('is_cover');

            window.setTimeout(function () {
                swap();

                /* 덮개 뒤에서 갈아 끼운 화면은 이미 제자리에 있으므로,
                   덮개가 걷힌 뒤 다시 페이드인하지 않도록 표시해 둠.
                   (안 하면 종이 바탕이 비쳐 한 번 번쩍임) */
                var shown = test.querySelector('.screen.is_on');
                if (shown) shown.classList.add('is_wiped_in');

                test.classList.remove('is_wipe_cover');
                test.classList.add('is_wipe_reveal');
                el.classList.remove('is_cover');
                el.classList.add('is_reveal');

                window.setTimeout(reset, reveal);
            }, cover);
        }

        return { run: run };
    })();

    /* ------------------------------------------------------------------
       화면 전환
    ------------------------------------------------------------------ */
    function show(id) {
        var target = document.getElementById(id);
        if (!target) return;

        var on = test.querySelector('.screen.is_on');
        if (on) on.classList.remove('is_on');

        /* 쓸기 표시는 그 전환에만 쓰는 것이라 화면을 갈아 끼울 때마다 지움.
           (다음 전환이 보통 전환이면 다시 평범하게 겹쳐 넘어가야 함) */
        [].forEach.call(test.querySelectorAll('.is_wiped_in'), function (screen) {
            screen.classList.remove('is_wiped_in');
        });

        flipbook.stop();

        target.classList.add('is_on');
        current = id;

        flipbook.start(target);

        /* 애니메이션을 다시 태우려면 클래스가 한 번 빠졌다 붙어야 해서 순서상 여기서 초기화 */
        window.scrollTo(0, 0);
        updateHud(target);

        if (id === START) intro.play();
    }

    /* 진행 표시와 뒤로가기 버튼은 문제 화면에서만 보여 줌 */
    function updateHud(screen) {
        var step = screen.getAttribute('data-step');

        if (step) {
            progressNow.textContent = step;
            progress.hidden = false;
        } else {
            progress.hidden = true;
        }

        btnBack.hidden = trail.length === 0;
    }

    function go(next) {
        var id = resolve(next);
        if (!document.getElementById(id)) return;

        trail.push(current);
        show(id);
    }

    function back() {
        var prev = trail.pop();
        if (!prev) return;
        show(prev);
    }

    function restart() {
        answers = {};
        trail = [];
        show(START);
    }

    /* ------------------------------------------------------------------
       클릭 처리
       선택지 버튼, 전환 컷(섹션 전체), 시작/다시하기 버튼이 모두 data-next 를 갖고 있음
    ------------------------------------------------------------------ */
    test.addEventListener('click', function (e) {
        if (e.target.closest('#btn_back')) {
            back();
            return;
        }

        var trigger = e.target.closest('[data-next]');
        if (!trigger || !test.contains(trigger)) return;

        var next = trigger.getAttribute('data-next');

        if (next === START) {
            restart();
            return;
        }

        /* data-set="key:value" 형태로 적힌 답을 기록 */
        var set = trigger.getAttribute('data-set');
        if (set) {
            var pair = set.split(':');
            answers[pair[0]] = pair[1];
        }

        /* data-wipe 가 붙은 선택지는 그 방향으로 화면을 쓸며 넘어감 */
        var dir = trigger.getAttribute('data-wipe');

        if (dir) {
            wipe.run(dir, function () {
                go(next);
            });
            return;
        }

        go(next);
    });

    /* 전환 컷은 키보드로도 넘어갈 수 있게 */
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;

        var screen = test.querySelector('.screen_cut.is_on');
        if (!screen) return;

        e.preventDefault();
        go(screen.getAttribute('data-next'));
    });

    show(START);
})();
