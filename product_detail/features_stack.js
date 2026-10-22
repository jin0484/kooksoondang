/* =========================================================
   Features 스티키 스크롤

   .pd_features(긴 영역) 안에서 .pd_features_sticky 가 화면에 고정되어 있는 동안,
   스크롤 위치가 문턱을 넘을 때마다 조각이 하나씩 부드럽게 올라옴.
     --e1 : 뒤쪽 카드   (Deep Flavor)
     --e2 : 가운데 카드 (Alive with Natural Yeast)
     --e3 : 그릇        (Gently Sweet)
   스크롤 양에 비례해 끌려 올라오는 방식이 아니라, 문턱을 넘으면 정해진 시간 동안 스스로 올라옴
   (빠르게 휠을 돌려도 한 장씩 천천히 올라오고, 되돌리면 한 장씩 내려감).
   각 조각의 움직임은 CSS(.pd_card)가 --e 값으로 그림.
========================================================= */

(() => {
    const section = document.querySelector('.pd_features');
    const bowl = section && section.querySelector('.pd_bowl');
    if (!bowl) return;

    // 스크롤 진행도(0~1)가 이 값을 넘으면 해당 조각이 올라옴
    const THRESHOLDS = [0.12, 0.45, 0.78];

    // 값이 목표에 다가가는 속도(ms). 작을수록 빠르게 도착. 약 4배 시간이면 거의 도착
    const TAU = 260;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

    const current = THRESHOLDS.map(() => 0);
    const target = THRESHOLDS.map(() => 0);

    let raf = 0;
    let last = 0;

    const apply = () => {
        current.forEach((v, i) => bowl.style.setProperty('--e' + (i + 1), v.toFixed(4)));
    };

    const frame = (now) => {
        // rAF 시각이 performance.now() 보다 약간 앞서 음수가 될 수 있어 0 이상으로 맞춤
        const dt = clamp(now - last, 0, 100);
        last = now;

        const k = 1 - Math.exp(-dt / TAU);
        let moving = false;

        for (let i = 0; i < current.length; i++) {
            const diff = target[i] - current[i];

            if (Math.abs(diff) < 0.0005) {
                current[i] = target[i];
            } else {
                current[i] += diff * k;
                moving = true;
            }
        }

        apply();
        raf = moving ? requestAnimationFrame(frame) : 0;
    };

    const kick = () => {
        if (raf) return;
        last = performance.now();
        raf = requestAnimationFrame(frame);
    };

    const read = () => {
        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        const progress = total > 0 ? clamp(-rect.top / total, 0, 1) : 1;

        THRESHOLDS.forEach((th, i) => { target[i] = progress >= th ? 1 : 0; });

        if (reduceMotion) {
            target.forEach((t, i) => { current[i] = t; });
            apply();
            return;
        }

        kick();
    };

    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);

    // 처음 열었을 때 이미 중간쯤이면 바로 그 상태로 시작(애니메이션 없이)
    read();
    target.forEach((t, i) => { current[i] = t; });
    apply();
})();
