/* =========================================================
   Features 스티키 스크롤

   .pd_features(긴 영역) 안에서 .pd_features_sticky 가 화면에 고정되어 있는 동안,
   스크롤 진행도에 따라 .pd_bowl 의 --e1 --e2 --e3 (0 → 1)을 바꿈.
     --e1 : 뒤쪽 카드   (Deep Flavor)
     --e2 : 가운데 카드 (Alive with Natural Yeast)
     --e3 : 그릇        (Gently Sweet)
   각 조각은 CSS(.pd_card)가 이 값으로 위에서 내려와 포개짐.
========================================================= */

(() => {
    const section = document.querySelector('.pd_features');
    const bowl = section && section.querySelector('.pd_bowl');
    if (!bowl) return;

    // 한 조각이 내려오는 스크롤 구간 (전체 0~1 기준). 마지막 구간은 다 쌓인 채로 머무름
    const STEPS = [
        [0.04, 0.30],
        [0.32, 0.58],
        [0.60, 0.86],
    ];

    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    // 끝에서 살짝 튕기듯 자리 잡는 easeOutBack 대신, 가벼운 easeOutCubic
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    let ticking = false;

    const update = () => {
        ticking = false;

        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        const progress = total > 0 ? clamp(-rect.top / total, 0, 1) : 1;

        STEPS.forEach(([from, to], i) => {
            const t = clamp((progress - from) / (to - from), 0, 1);
            bowl.style.setProperty('--e' + (i + 1), ease(t).toFixed(4));
        });
    };

    const request = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
})();
