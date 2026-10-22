/* =========================================================
   배너 조각 낙하 (Matter.js 물리엔진)

   .pd_banner_item 11개가 위에서 하나씩 떨어져 서로 부딪히고 쌓임.
   - 좌표는 시안(1920 x 880) 단위로 계산하고, 화면에는 판 크기 비율로 줄여 그림
   - 충돌 모양은 각 SVG 윤곽선의 볼록 껍질(hull)
   - 다 가라앉으면 엔진을 멈춤. 인터랙션을 붙일 때는 window.pdBanner 를 쓰면 됨
       pdBanner.engine / pdBanner.items / pdBanner.wake()
========================================================= */

(() => {
    const stage = document.querySelector('.pd_banner_stage');
    if (!stage) return;

    const banner = stage.closest('.pd_banner');
    const showStatic = () => banner.classList.add('is_static');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !window.Matter) {
        showStatic();
        return;
    }

    // 어떤 이유로 시작이 늦어져도 조각이 영영 안 보이는 일이 없게 함
    const safety = setTimeout(showStatic, 4000);

    const { Engine, Runner, Bodies, Body, Composite, Vertices, Events, Mouse, MouseConstraint } = Matter;

    const W = 1920;
    const H = 880;

    // 떨어뜨리는 순서: 바닥에 깔리는 큰 것 먼저, 위에 얹힐 병은 나중
    const ORDER = [
        'can_big', 'blob', 'bowl', 'big_bottle', 'ring',
        'bottle_small', 'bottle_left', 'bottle_mid', 'can_small', 'bottle_lying', 'bottle_right',
    ];

    const imgs = [...stage.querySelectorAll('.pd_banner_item')];
    const byName = (img) => ORDER.findIndex((n) => img.classList.contains('pd_bn_' + n));

    // SVG 파일에서 윤곽선(path)을 읽어 점으로 바꾼 뒤 볼록 껍질을 만듦
    const sampler = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sampler.setAttribute('width', 0);
    sampler.setAttribute('height', 0);
    sampler.style.position = 'absolute';
    document.body.appendChild(sampler);

    const hullFromPath = (d) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        sampler.appendChild(path);

        const total = path.getTotalLength();
        const step = Math.max(6, total / 160);
        const points = [];

        for (let l = 0; l <= total; l += step) {
            const p = path.getPointAtLength(l);
            points.push({ x: p.x, y: p.y });
        }

        sampler.removeChild(path);

        const hull = Vertices.hull(points);
        const c = Vertices.centre(hull);

        // 눈에 보이는 윤곽선 그대로(조금 크게) 잡아 조각끼리 겹쳐 보이지 않게 함
        return { hull: hull.map((v) => ({ x: c.x + (v.x - c.x) * 1.01, y: c.y + (v.y - c.y) * 1.01 })), center: c };
    };

    const load = async (img) => {
        const text = await (await fetch(img.currentSrc || img.src)).text();
        const d = /<path[^>]*\sd="([^"]+)"/.exec(text)[1];
        const { hull, center } = hullFromPath(d);

        const box = {
            x: parseFloat(img.style.getPropertyValue('--x')) / 100 * W,
            y: parseFloat(img.style.getPropertyValue('--y')) / 100 * H,
            w: parseFloat(img.style.getPropertyValue('--w')) / 100 * W,
            h: +img.getAttribute('height') / +img.getAttribute('width') * (parseFloat(img.style.getPropertyValue('--w')) / 100 * W),
        };

        // 회전 중심을 윤곽선의 무게중심에 맞춤
        img.style.transformOrigin = `${(center.x - box.x) / box.w * 100}% ${(center.y - box.y) / box.h * 100}%`;

        return { img, hull, center, box, body: null };
    };

    Promise.all(imgs.sort((a, b) => byName(a) - byName(b)).map(load)).then((items) => {
        clearTimeout(safety);

        const engine = Engine.create({ enableSleeping: true });
        engine.gravity.y = 1.5;
        // 겹침 없이 쌓이도록 충돌 계산을 촘촘히 함
        engine.positionIterations = 14;
        engine.velocityIterations = 10;

        // 바닥과 양쪽 벽. 벽은 화면(배너)에 실제로 보이는 가장자리에 맞춰 조각이 화면 밖으로 나가지 않게 함
        const wall = (x, y, w, h) => Bodies.rectangle(x, y, w, h, { isStatic: true, friction: 0.8 });
        const floor = wall(W / 2, H + 40, W * 5, 160);
        const wallL = wall(-200, H / 2, 400, H * 6);
        const wallR = wall(W + 200, H / 2, 400, H * 6);
        Composite.add(engine.world, [floor, wallL, wallR]);

        let scale = stage.clientWidth / W;
        let visL = 0;
        let visR = W;

        // 판(stage)이 화면보다 넓어 양옆이 잘리는 경우(좁은 화면)를 위해 보이는 범위를 시안 단위로 계산
        const fitBounds = () => {
            scale = stage.clientWidth / W;
            const sr = stage.getBoundingClientRect();
            const br = banner.getBoundingClientRect();
            visL = Math.max(0, (br.left - sr.left) / scale);
            visR = Math.min(W, visL + banner.clientWidth / scale);
            Body.setPosition(wallL, { x: visL - 200, y: H / 2 });
            Body.setPosition(wallR, { x: visR + 200, y: H / 2 });
            Body.setPosition(floor, { x: (visL + visR) / 2, y: H + 40 });

            // 화면이 줄어 벽 밖에 남은 조각은 안으로 당겨 둠
            for (const it of items) {
                if (!it.body) continue;
                const half = it.box.w / 2;
                const x = Math.min(Math.max(it.body.position.x, visL + half), visR - half);
                if (x !== it.body.position.x) {
                    Body.setPosition(it.body, { x, y: it.body.position.y });
                    Matter.Sleeping.set(it.body, false);
                    start();
                }
            }
        };

        fitBounds();
        window.addEventListener('resize', fitBounds);

        const render = () => {
            for (const it of items) {
                if (!it.body) continue;
                const p = it.body.position;
                it.img.style.transform =
                    `translate(${(p.x - it.center.x) * scale}px, ${(p.y - it.center.y) * scale}px) rotate(${it.body.angle}rad)`;
            }
        };

        // 처음에는 모두 화면 위쪽 바깥에 숨겨 둠
        items.forEach((it) => {
            it.img.style.transform = `translateY(${-H * 1.5 * scale}px)`;
        });
        banner.classList.add('is_physics');

        // 하나씩 떨어뜨림
        items.forEach((it, i) => {
            setTimeout(() => {
                const size = Math.max(it.box.w, it.box.h);
                const jitter = (Math.random() - 0.5) * 36;
                const body = Bodies.fromVertices(Math.min(Math.max(it.center.x + jitter, visL + it.box.w / 2), Math.max(visR - it.box.w / 2, visL)), -size * 0.6 - 40, [it.hull], {
                    friction: 0.7,
                    frictionStatic: 0.9,
                    restitution: 0.18,
                    frictionAir: 0.008,
                    density: 0.001,
                    sleepThreshold: 50,
                });

                // 너무 굴러다니지 않게: 처음 기울기와 회전은 작게, 관성은 크게(잘 안 돌게)
                Body.setInertia(body, body.inertia * 3);
                Body.setAngle(body, (Math.random() - 0.5) * 0.3);
                Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03);
                Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: 4 });

                it.body = body;
                Composite.add(engine.world, body);
            }, 350 + i * 330);
        });

        const runner = Runner.create();
        // Matter 의 Runner.stop 은 runner.enabled 를 바꾸지 않아서 돌고 있는지는 따로 기억함
        let running = false;
        const start = () => {
            if (running) return;
            running = true;
            Runner.run(runner, engine);
        };

        // 너무 빠르게 떨어져 얇은 조각을 뚫고 지나가는 일을 막기 위해 속도 상한을 둠
        const MAX_SPEED = 16;

        Events.on(engine, 'beforeUpdate', () => {
            for (const it of items) {
                if (!it.body) continue;
                const v = it.body.velocity;
                const s = Math.hypot(v.x, v.y);
                if (s > MAX_SPEED) Body.setVelocity(it.body, { x: v.x / s * MAX_SPEED, y: v.y / s * MAX_SPEED });
            }
        });

        Events.on(engine, 'afterUpdate', () => {
            render();

            const allIn = items.every((it) => it.body);
            // 끄는 중에는 멈추지 않음(손을 가만히 들고 있어도 엔진이 잠들어 드래그가 끊기지 않게)
            if (allIn && !drag.constraint.bodyB && items.every((it) => it.body.isSleeping)) { Runner.stop(runner); running = false; }
        });

        start();

        // 마우스로 조각 끌기. 화면 px 을 시안 단위로 바꿔 주고, 손가락 스크롤은 막지 않도록 터치는 뺌
        const mouse = Mouse.create(stage);
        const syncMouse = () => Mouse.setScale(mouse, { x: 1 / scale, y: 1 / scale });
        syncMouse();
        window.addEventListener('resize', syncMouse);

        ['touchstart', 'touchmove', 'touchend'].forEach((type) => {
            stage.removeEventListener(type, mouse['mouse' + (type === 'touchstart' ? 'down' : type === 'touchmove' ? 'move' : 'up')]);
        });
        stage.removeEventListener('wheel', mouse.mousewheel);
        stage.removeEventListener('mousewheel', mouse.mousewheel);
        stage.removeEventListener('DOMMouseScroll', mouse.mousewheel);

        const drag = MouseConstraint.create(engine, {
            mouse,
            constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } },
        });
        Composite.add(engine.world, drag);

        // 조각 밖이나 배너 밖으로 마우스가 나가도 끌기가 이어지도록, 움직임과 버튼 떼기는 창 전체에서 받음
        stage.removeEventListener('mousemove', mouse.mousemove);
        stage.removeEventListener('mouseup', mouse.mouseup);
        window.addEventListener('mousemove', (e) => {
            if (!drag.constraint.bodyB) return;

            // 창 밖에서 버튼을 뗐다면 끌기를 끝냄
            if (e.buttons === 0) { mouse.mouseup(e); return; }

            mouse.mousemove(e);
            Matter.Sleeping.set(drag.constraint.bodyB, false);
            start();
        });
        window.addEventListener('mouseup', (e) => mouse.mouseup(e));
        stage.addEventListener('mousemove', (e) => { if (!drag.constraint.bodyB) mouse.mousemove(e); });

        // 엔진이 멈춰 있으면 끌기 판정(update)도 돌지 않으므로, 누르는 순간 먼저 엔진을 깨움
        stage.addEventListener('mousedown', start);

        // 끌기 시작하면 멈춰 있던 엔진을 다시 돌림
        Events.on(drag, 'startdrag', () => {
            stage.classList.add('is_dragging');
            start();
        });
        Events.on(drag, 'enddrag', () => stage.classList.remove('is_dragging'));

        window.pdBanner = {
            drag,
            mouse,
            engine,
            items,
            wake() {
                items.forEach((it) => it.body && Matter.Sleeping.set(it.body, false));
                start();
            },
        };
    }).catch((err) => {
        console.warn('banner physics failed:', err);
        clearTimeout(safety);
        showStatic();
    });
})();
