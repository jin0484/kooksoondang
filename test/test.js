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
       화면 전환
    ------------------------------------------------------------------ */
    function show(id) {
        var target = document.getElementById(id);
        if (!target) return;

        var on = test.querySelector('.screen.is_on');
        if (on) on.classList.remove('is_on');

        target.classList.add('is_on');
        current = id;

        /* 애니메이션을 다시 태우려면 클래스가 한 번 빠졌다 붙어야 해서 순서상 여기서 초기화 */
        window.scrollTo(0, 0);
        updateHud(target);
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
