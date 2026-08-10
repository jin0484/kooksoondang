/* 인트로 영상이 끝나면 19세 인증 화면을 띄우고, 답에 따라 갈 곳을 정함.
   YES -> 테스트 페이지, NO -> 돌아가세요 화면 */
(() => {
    const intro = document.querySelector('.intro');
    const video = document.querySelector('.intro_video');
    const skip = document.querySelector('.intro_skip');
    const gate = document.querySelector('.age_gate');

    if (!intro || !gate) return;

    const views = gate.querySelectorAll('.age_gate_view');
    // YES 를 눌렀을 때 갈 곳. 마크업에 적어 두고 여기서 읽음
    const passTarget = gate.dataset.pass;

    function showView(name) {
        views.forEach((view) => {
            view.hidden = view.dataset.view !== name;
        });

        // 화면이 바뀌면 그 화면의 첫 버튼으로 초점을 옮겨 키보드로도 이어서 쓸 수 있게 함
        const current = gate.querySelector(`.age_gate_view[data-view="${name}"]`);
        current?.querySelector('button')?.focus({ preventScroll: true });
    }

    // 영상 자리를 비우고 인증 화면을 드러냄. 영상이 뒤에서 계속 돌지 않도록 멈춰 둠
    let isGateOpen = false;

    function openGate() {
        if (isGateOpen) return;

        isGateOpen = true;
        video?.pause();
        intro.hidden = true;
        gate.hidden = false;
        showView('ask');
    }

    if (video) {
        video.addEventListener('ended', openGate);
        // 자동 재생이 막히거나 파일을 못 읽으면 마지막 화면에 갇히므로 그때도 넘겨 줌
        video.addEventListener('error', openGate);
    } else {
        openGate();
    }

    // Skip 은 영상만 건너뜀. 인증은 거쳐야 하므로 인증 화면으로 보냄
    skip?.addEventListener('click', openGate);

    gate.addEventListener('click', (event) => {
        const button = event.target instanceof Element
            ? event.target.closest('[data-answer]')
            : null;

        if (!button) return;

        const answer = button.dataset.answer;

        if (answer === 'yes') {
            if (!passTarget) return;

            // 화면을 덮으며 넘기는 일은 공통 전환(common/page_transition.js)에 맡김.
            // 전환 스크립트가 아직 안 읽혔거나 막혔더라도 갇히지 않도록 그냥 이동하는 길도 남겨 둠
            if (window.sitePageTransition) window.sitePageTransition.leaveTo(passTarget);
            else window.location.assign(passTarget);

            return;
        }

        if (answer === 'no') showView('deny');
        if (answer === 'back') showView('ask');
    });
})();
