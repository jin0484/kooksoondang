(() => {
    const historySection = document.querySelector('.history');
    const historyTimeline = historySection?.querySelector('.history_timeline');
    const morphStage = historySection?.querySelector('.history_morph');
    const morphPath = historySection?.querySelector('.history_morph_path');
    const morphStopTop = historySection?.querySelector('.history_morph_stop_top');
    const morphStopBottom = historySection?.querySelector('.history_morph_stop_bottom');
    const introDecos = historySection ? [...historySection.querySelectorAll('.history_intro .history_deco')] : [];
    const staticDecos = historySection ? [...historySection.querySelectorAll('.history_deco')] : [];
    const historyItems = historySection ? [...historySection.querySelectorAll('.history_item')] : [];

    // 프레임 순서: 물방울(늘어짐) - 물방울(낙하) - 원 - 잔 - 병 - 페트
    // 유리잔에 붙은 trans_05 는 .history_drip 으로 고정 배치되며 모프에 참여하지 않음
    const introFrameCount = 2;
    const frameCount = introFrameCount + 4;
    const bottleFrameIndex = introFrameCount + 2;

    if (!historySection || !historyTimeline || !morphStage || !morphPath || !morphStopTop || !morphStopBottom) return;
    if (introDecos.length !== introFrameCount || staticDecos.length !== frameCount || historyItems.length !== frameCount - introFrameCount) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 48rem)');
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const stageSize = { width: 228, height: 510 };
    const sampleCount = 240;
    const rotationKeyframes = [0, 0, 0, -12, 12, -10];
    // 유리잔 영역에서는 흰색, 낙하하며 주황으로 물듦
    const fillKeyframes = [
        { top: '#FFFFFF', bottom: '#FFFFFF' },
        { top: '#FFFFFF', bottom: '#F29556' },
        { top: '#F29556', bottom: '#F29556' },
        { top: '#F29556', bottom: '#F29556' },
        { top: '#F29556', bottom: '#F29556' },
        { top: '#F29556', bottom: '#F29556' }
    ];
    // 고정 장식(trans_05) 아래끝에 걸쳐 시작해 아래로 떨어짐.
    // 낙하 종점은 화면 중앙(0). 잔·병 프레임과 마찬가지로 원 프레임도 중앙에 놓여야 해서,
    // 물방울이 그보다 아래로 떨어지면 원이 될 때 위로 튕겨 오르게 됨
    const dripTailRise = -305;
    const dropFallDistance = 0;
    // 원 프레임. 첫 항목이 화면 중앙에 올 때 원도 화면 중앙에 오도록 오프셋 없음
    const circleSettleDistance = 0;
    const petOffsetRange = { min: 134, viewportRatio: 0.0835, max: 160 };
    // 키프레임 간격 배율. 1 을 넘기면 기준점이 전체 중간점에서 바깥으로 밀려서
    // 항목이 화면 중앙에 왔을 때 이미 다음 모양으로 넘어가 버림(원이 원으로 안 보임).
    // 각 모양이 해당 항목 위치에서 정확히 완성되도록 1 로 둠
    const morphScrollDuration = 1;

    let sourceShapes = [];
    let morphFrames = [];
    let framePaths = [];
    let isPrepared = false;
    let animationFrame = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const isMorphEnabled = () => !reducedMotionQuery.matches && !mobileQuery.matches;

    function parseViewBox(svg) {
        const values = (svg.getAttribute('viewBox') || '')
            .trim()
            .split(/[\s,]+/)
            .map(Number);

        if (values.length !== 4 || values.some(Number.isNaN)) {
            throw new Error('A valid SVG viewBox is required for history morphing.');
        }

        return { x: values[0], y: values[1], width: values[2], height: values[3] };
    }

    function sampleCircle(circle) {
        const cx = Number(circle.getAttribute('cx')) || 0;
        const cy = Number(circle.getAttribute('cy')) || 0;
        const radius = Number(circle.getAttribute('r')) || 0;

        return Array.from({ length: sampleCount }, (_, index) => {
            const angle = -Math.PI / 2 + (Math.PI * 2 * index) / sampleCount;
            return {
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            };
        });
    }

    async function loadShape(source) {
        const response = await fetch(source);

        if (!response.ok) throw new Error(`Unable to load ${source}`);

        const sourceDocument = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        const sourceSvg = sourceDocument.documentElement;
        const viewBox = parseViewBox(sourceSvg);
        const sourceShape = sourceSvg.querySelector('path, circle');

        if (!sourceShape) throw new Error(`No supported outline found in ${source}`);

        if (sourceShape.tagName.toLowerCase() === 'circle') {
            return { viewBox, points: sampleCircle(sourceShape) };
        }

        const samplerSvg = document.createElementNS(svgNamespace, 'svg');
        const samplerPath = document.importNode(sourceShape, true);

        if (source.includes('brand_history_pet')) {
            const pathData = samplerPath.getAttribute('d') || '';
            const nextSubpath = pathData.indexOf('M', 1);

            if (nextSubpath !== -1) samplerPath.setAttribute('d', pathData.slice(0, nextSubpath));
        }

        samplerSvg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
        samplerSvg.setAttribute('width', '1');
        samplerSvg.setAttribute('height', '1');
        samplerSvg.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;';
        samplerSvg.append(samplerPath);
        document.body.append(samplerSvg);

        try {
            const length = samplerPath.getTotalLength();

            if (!Number.isFinite(length) || length <= 0) throw new Error(`Unable to sample ${source}`);

            const points = Array.from({ length: sampleCount }, (_, index) => {
                const point = samplerPath.getPointAtLength((length * index) / sampleCount);
                return { x: point.x, y: point.y };
            });

            return { viewBox, points };
        } finally {
            samplerSvg.remove();
        }
    }

    function mapToStage(sourceShape, targetRect, bottleWidth) {
        const stageScale = stageSize.width / bottleWidth;
        const targetWidth = targetRect.width * stageScale;
        const targetHeight = targetRect.height * stageScale;
        const scaleX = targetWidth / sourceShape.viewBox.width;
        const scaleY = targetHeight / sourceShape.viewBox.height;
        const offsetX = (stageSize.width - targetWidth) / 2;
        const offsetY = (stageSize.height - targetHeight) / 2;

        return sourceShape.points.map((point) => ({
            x: offsetX + (point.x - sourceShape.viewBox.x) * scaleX,
            y: offsetY + (point.y - sourceShape.viewBox.y) * scaleY
        }));
    }

    function alignToPrevious(previousPoints, nextPoints) {
        let bestPoints = nextPoints;
        let bestScore = Number.POSITIVE_INFINITY;

        [nextPoints, [...nextPoints].reverse()].forEach((candidatePoints) => {
            for (let offset = 0; offset < candidatePoints.length; offset += 1) {
                let score = 0;

                for (let index = 0; index < candidatePoints.length; index += 1) {
                    const previousPoint = previousPoints[index];
                    const candidatePoint = candidatePoints[(index + offset) % candidatePoints.length];
                    const deltaX = previousPoint.x - candidatePoint.x;
                    const deltaY = previousPoint.y - candidatePoint.y;
                    score += deltaX * deltaX + deltaY * deltaY;
                }

                if (score < bestScore) {
                    bestScore = score;
                    bestPoints = candidatePoints.map((_, index) => {
                        const point = candidatePoints[(index + offset) % candidatePoints.length];
                        return { x: point.x, y: point.y };
                    });
                }
            }
        });

        return bestPoints;
    }

    function createPath(points) {
        return `M ${points.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' L ')} Z`;
    }

    function interpolatePoints(startPoints, endPoints, progress) {
        return startPoints.map((startPoint, index) => {
            const endPoint = endPoints[index];
            return {
                x: startPoint.x + (endPoint.x - startPoint.x) * progress,
                y: startPoint.y + (endPoint.y - startPoint.y) * progress
            };
        });
    }

    function parseHexColor(hex) {
        return [
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16)
        ];
    }

    const fillColorFrames = fillKeyframes.map((frame) => ({
        top: parseHexColor(frame.top),
        bottom: parseHexColor(frame.bottom)
    }));

    function mixColor(startColor, endColor, progress) {
        const channels = startColor.map((channel, index) => (
            Math.round(channel + (endColor[index] - channel) * progress)
        ));

        return `rgb(${channels.join(' ')})`;
    }

    // 프레임별 세로 오프셋: 물방울은 그릇에 매달렸다 떨어져 나오고, 페트는 아래로 밀려남
    function frameOffset(index) {
        if (index === 0) return dripTailRise;
        if (index === 1) return dropFallDistance;
        if (index === introFrameCount) return circleSettleDistance;
        if (index === frameCount - 1) {
            return clamp(window.innerWidth * petOffsetRange.viewportRatio, petOffsetRange.min, petOffsetRange.max);
        }

        return 0;
    }

    function prepareFrames() {
        const targetRects = staticDecos.map((deco) => deco.getBoundingClientRect());
        const bottleWidth = targetRects[bottleFrameIndex]?.width;

        if (!bottleWidth) return false;

        historySection.style.setProperty('--history-morph-width', `${bottleWidth}px`);

        const mappedFrames = sourceShapes.map((sourceShape, index) => (
            mapToStage(sourceShape, targetRects[index], bottleWidth)
        ));

        morphFrames = [mappedFrames[0]];

        for (let index = 1; index < mappedFrames.length; index += 1) {
            morphFrames.push(alignToPrevious(morphFrames[index - 1], mappedFrames[index]));
        }

        framePaths = morphFrames.map(createPath);
        return true;
    }

    // 각 프레임이 완성되는 스크롤 지점. 항목 프레임은 모두 그 항목이 화면 정중앙에 올 때가 기준.
    // 첫 항목(원)만 타임라인 상단을 쓰면 항목이 가운데 왔을 때 이미 다음 모양으로 넘어가 버림
    function getScrollState() {
        const viewportCenter = window.scrollY + window.innerHeight / 2;
        const rawCenters = [...introDecos, ...historyItems].map((element) => {
            const bounds = element.getBoundingClientRect();
            return window.scrollY + bounds.top + bounds.height / 2;
        });
        const centerPoint = (rawCenters[0] + rawCenters[rawCenters.length - 1]) / 2;
        const centers = rawCenters.map((center) => (
            centerPoint + (center - centerPoint) * morphScrollDuration
        ));

        if (viewportCenter <= centers[0]) return { from: 0, to: 0, progress: 0 };
        if (viewportCenter >= centers[centers.length - 1]) return { from: morphFrames.length - 1, to: morphFrames.length - 1, progress: 0 };

        for (let index = 0; index < centers.length - 1; index += 1) {
            if (viewportCenter <= centers[index + 1]) {
                return {
                    from: index,
                    to: index + 1,
                    progress: clamp((viewportCenter - centers[index]) / (centers[index + 1] - centers[index]), 0, 1)
                };
            }
        }

        return { from: 0, to: 0, progress: 0 };
    }

    function renderMorph() {
        const { from, to, progress } = getScrollState();
        const easedProgress = progress * progress * (3 - 2 * progress);
        const pathData = from === to
            ? framePaths[from]
            : createPath(interpolatePoints(morphFrames[from], morphFrames[to], easedProgress));
        const rotation = rotationKeyframes[from] + (rotationKeyframes[to] - rotationKeyframes[from]) * easedProgress;
        const startOffset = frameOffset(from);
        const verticalOffset = startOffset + (frameOffset(to) - startOffset) * easedProgress;

        morphStopTop.setAttribute('stop-color', mixColor(fillColorFrames[from].top, fillColorFrames[to].top, easedProgress));
        morphStopBottom.setAttribute('stop-color', mixColor(fillColorFrames[from].bottom, fillColorFrames[to].bottom, easedProgress));
        morphPath.setAttribute('d', pathData);
        morphStage.style.setProperty('--history-morph-rotation', `${rotation.toFixed(2)}deg`);
        morphStage.style.setProperty('--history-morph-offset', `${verticalOffset.toFixed(2)}px`);
    }

    function requestRender() {
        if (!historySection.classList.contains('is_morph_ready') || animationFrame) return;

        animationFrame = window.requestAnimationFrame(() => {
            animationFrame = 0;
            renderMorph();
        });
    }

    function updateMode() {
        const shouldMorph = isPrepared && isMorphEnabled();

        if (!shouldMorph) {
            historySection.classList.remove('is_morph_ready');
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            return;
        }

        if (!prepareFrames()) return;

        historySection.classList.add('is_morph_ready');
        requestRender();
    }

    const listenForChanges = (query, callback) => {
        if (query.addEventListener) query.addEventListener('change', callback);
        else query.addListener(callback);
    };

    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', updateMode, { passive: true });
    listenForChanges(reducedMotionQuery, updateMode);
    listenForChanges(mobileQuery, updateMode);

    Promise.all(staticDecos.map((deco) => loadShape(deco.getAttribute('src'))))
        .then((shapes) => {
            sourceShapes = shapes;
            isPrepared = true;
            updateMode();
        })
        .catch(() => {
            // Keep the existing static SVGs visible if the morph sources cannot be loaded.
        });
})();

(() => {
    const containers = [...document.querySelectorAll('[data-momentum-init]')];

    if (!containers.length) return;

    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 커서 속도(px/s)를 요소의 초기 속도로 환산하는 배율
    const throwScale = 0.32;
    const spinScale = 0.16;
    const maxThrow = 1600;
    const maxSpin = 320;
    // 원위치로 되돌리는 스프링. stiffness 가 클수록 빨리, damping 이 클수록 덜 출렁임
    const stiffness = 130;
    const damping = 15;
    const restEpsilon = 0.08;

    /* 던지기와 별개로 늘 살아 있는 움직임(부유 / 시차 / 오른쪽 진입 반응)의 층별 세기.
       float 은 위아래 진폭(px), period 는 한 번 오르내리는 데 걸리는 초, phase 는 층끼리 어긋나게 하는 시작점,
       depth 는 커서를 따라 밀리는 최대 거리(px) 라 값이 클수록 앞에 있는 것처럼 보임,
       spread 는 오른쪽 영역 진입 시 캐릭터에서 멀어지는 거리(px), lift 는 캐릭터가 떠오르는 거리(px).
       같은 이름을 쓴 요소는 값도 위상도 같아 캐릭터 4 장처럼 겹쳐 둔 것도 어긋나지 않음 */
    const heroLayers = {
        cup: { float: 8, period: 7.4, phase: 0, depth: 10, spread: 5 },
        character: { float: 6, period: 6.6, phase: 1.9, depth: 6, spread: 0, lift: 4 },
        pet: { float: 12, period: 8.4, phase: 3.4, depth: 16, spread: 7 },
        bottle: { float: 16, period: 6.2, phase: 0.8, depth: 22, spread: 8 },
        bowl: { float: 10, period: 9, phase: 4.6, depth: 26, spread: 6 }
    };

    // 가로로 이 지점을 넘어가면 "오른쪽 영역" 으로 봄
    const rightZone = 0.55;
    // 목표값을 따라가는 속도. 프레임 수와 상관없이 같은 속도가 되도록 지수 보간에 씀
    const followSpeed = 4.5;

    const items = [];
    const ambients = [];
    let animationFrame = 0;
    let lastTime = 0;
    let clock = 0;

    const clamp = (value, limit) => Math.min(Math.max(value, -limit), limit);
    const isEnabled = () => hoverQuery.matches && !reducedMotionQuery.matches;

    // 기존 transform 을 지우지 않고 그 안쪽에 흔들림을 얹어야 제자리에서 회전함
    function captureBase(item) {
        item.element.style.transform = '';

        const base = window.getComputedStyle(item.element).transform;

        item.base = base && base !== 'none' ? `${base} ` : '';
    }

    // 던진 흔들림과 상시 움직임을 한 자리에서 합쳐야 둘이 서로 transform 을 덮어쓰지 않음
    function render(item) {
        const x = item.x + item.ambientX;
        const y = item.y + item.ambientY;

        if (!x && !y && !item.rotation) {
            item.element.style.transform = '';
            return;
        }

        item.element.style.transform = `${item.base}translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${item.rotation.toFixed(2)}deg)`;
    }

    function rest(item) {
        item.awake = false;
        item.x = 0;
        item.y = 0;
        item.rotation = 0;
        item.velocityX = 0;
        item.velocityY = 0;
        item.velocityRotation = 0;
        render(item);
    }

    // svg 는 그림보다 훨씬 큰 상자를 쓰므로 실제 도형(path)의 중심을 봐야 벌어질 방향이 맞음
    function centerOf(element) {
        const target = element.querySelector('path') || element;
        const bounds = target.getBoundingClientRect();

        return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
    }

    // 캐릭터를 기준으로 각 도형이 어느 쪽으로 물러날지 미리 재 둠
    function measureSpread(ambient) {
        const anchor = ambient.items.find((item) => item.layer.lift);
        const origin = anchor ? centerOf(anchor.element) : null;

        ambient.items.forEach((item) => {
            item.spreadX = 0;
            item.spreadY = 0;

            if (!origin || !item.layer.spread) return;

            const center = centerOf(item.element);
            const offsetX = center.x - origin.x;
            const offsetY = center.y - origin.y;
            const distance = Math.hypot(offsetX, offsetY) || 1;

            item.spreadX = (offsetX / distance) * item.layer.spread;
            item.spreadY = (offsetY / distance) * item.layer.spread;
        });
    }

    function stepAmbient(ambient, delta) {
        // 커서를 따라가는 값과 오른쪽 반응은 목표를 향해 서서히 붙어야 뚝뚝 끊기지 않음
        const follow = 1 - Math.exp(-followSpeed * delta);

        ambient.x += (ambient.targetX - ambient.x) * follow;
        ambient.y += (ambient.targetY - ambient.y) * follow;
        ambient.right += (ambient.targetRight - ambient.right) * follow;

        ambient.items.forEach((item) => {
            const layer = item.layer;
            const wave = (clock / layer.period) * Math.PI * 2 + layer.phase;

            // 가로는 세로보다 폭이 좁고 주기도 어긋나야 같은 자리를 왕복하지 않고 떠다니는 것처럼 보임
            item.ambientX = Math.sin(wave * 0.73) * layer.float * 0.5
                - ambient.x * layer.depth
                + item.spreadX * ambient.right;
            item.ambientY = Math.sin(wave) * layer.float
                - ambient.y * layer.depth
                + item.spreadY * ambient.right
                - (layer.lift || 0) * ambient.right;
        });
    }

    function step(time) {
        animationFrame = 0;

        const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.04) : 1 / 60;
        lastTime = time;
        clock += delta;

        let awakeCount = 0;

        ambients.forEach((ambient) => {
            const enabled = isEnabled() && ambient.visible;

            if (!enabled) {
                // 꺼진 첫 프레임에만 제자리로 돌려 놓고 손을 뗌
                if (!ambient.running) return;

                ambient.running = false;
                ambient.items.forEach((item) => {
                    item.ambientX = 0;
                    item.ambientY = 0;
                });
                awakeCount += 1;
                return;
            }

            ambient.running = true;
            awakeCount += 1;
            stepAmbient(ambient, delta);
        });

        items.forEach((item) => {
            if (item.awake) {
                item.velocityX += (-stiffness * item.x - damping * item.velocityX) * delta;
                item.velocityY += (-stiffness * item.y - damping * item.velocityY) * delta;
                item.velocityRotation += (-stiffness * item.rotation - damping * item.velocityRotation) * delta;
                item.x += item.velocityX * delta;
                item.y += item.velocityY * delta;
                item.rotation += item.velocityRotation * delta;

                const settled = Math.abs(item.x) < restEpsilon && Math.abs(item.velocityX) < restEpsilon
                    && Math.abs(item.y) < restEpsilon && Math.abs(item.velocityY) < restEpsilon
                    && Math.abs(item.rotation) < restEpsilon && Math.abs(item.velocityRotation) < restEpsilon;

                if (settled) {
                    rest(item);
                    return;
                }

                awakeCount += 1;
                render(item);
                return;
            }

            if (item.layer) render(item);
        });

        if (awakeCount) animationFrame = window.requestAnimationFrame(step);
        else lastTime = 0;
    }

    function wake() {
        if (animationFrame) return;

        lastTime = 0;
        animationFrame = window.requestAnimationFrame(step);
    }

    containers.forEach((container) => {
        const lookup = new Map();
        let pointerX = 0;
        let pointerY = 0;
        let pointerTime = 0;
        let velocityX = 0;
        let velocityY = 0;
        let entered = null;

        const ambient = {
            // 커서 위치는 히어로 구역 전체를 기준으로 재야 도형이 상자 밖으로 삐져나와 있어도 어색하지 않음
            scope: container.closest('section') || container,
            items: [],
            targetX: 0,
            targetY: 0,
            targetRight: 0,
            x: 0,
            y: 0,
            right: 0,
            visible: false,
            running: false
        };

        container.querySelectorAll('[data-momentum], [data-hero-layer]').forEach((element) => {
            const layer = heroLayers[element.dataset.heroLayer] || null;
            const item = {
                element,
                base: '',
                strength: Math.min(Math.max(Number.parseFloat(element.dataset.momentumStrength) || 1, 0.05), 1),
                layer,
                spreadX: 0,
                spreadY: 0,
                ambientX: 0,
                ambientY: 0,
                x: 0,
                y: 0,
                rotation: 0,
                velocityX: 0,
                velocityY: 0,
                velocityRotation: 0,
                awake: false
            };

            captureBase(item);
            if (element.hasAttribute('data-momentum')) lookup.set(element, item);
            if (layer) ambient.items.push(item);
            items.push(item);
        });

        if (ambient.items.length) {
            ambients.push(ambient);

            // 화면 밖에서까지 매 프레임 돌 이유가 없음
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    ambient.visible = entry.isIntersecting;
                    if (entry.isIntersecting) measureSpread(ambient);
                });
                wake();
            });

            // 도형이 상자 밖으로 나가 있어 컨테이너 자체는 폭이 0 이 되기도 하므로 구역을 기준으로 봄
            observer.observe(ambient.scope);
            window.addEventListener('load', () => measureSpread(ambient));

            ambient.scope.addEventListener('mousemove', (event) => {
                const bounds = ambient.scope.getBoundingClientRect();

                if (!bounds.width || !bounds.height) return;

                const ratioX = (event.clientX - bounds.left) / bounds.width;
                const ratioY = (event.clientY - bounds.top) / bounds.height;

                // -1 ~ 1 로 바꿔 두면 층마다 depth 만 곱해서 이동량을 다르게 줄 수 있음
                ambient.targetX = clamp(ratioX * 2 - 1, 1);
                ambient.targetY = clamp(ratioY * 2 - 1, 1);
                ambient.targetRight = ratioX > rightZone ? 1 : 0;
                wake();
            }, { passive: true });

            ambient.scope.addEventListener('mouseleave', () => {
                ambient.targetX = 0;
                ambient.targetY = 0;
                ambient.targetRight = 0;
                wake();
            });
        }

        container.addEventListener('mousemove', (event) => {
            const elapsed = event.timeStamp - pointerTime;

            if (pointerTime && elapsed > 0) {
                // 순간 속도는 튀기 쉬워서 지수 평활로 다듬음
                const instantX = ((event.clientX - pointerX) / elapsed) * 1000;
                const instantY = ((event.clientY - pointerY) / elapsed) * 1000;

                velocityX = velocityX * 0.55 + instantX * 0.45;
                velocityY = velocityY * 0.55 + instantY * 0.45;
            }

            pointerX = event.clientX;
            pointerY = event.clientY;
            pointerTime = event.timeStamp;
        }, { passive: true });

        // SVG path 는 mouseenter 가 걸리지 않으므로 버블링되는 mouseover 로 위임 처리
        container.addEventListener('mouseover', (event) => {
            const target = event.target instanceof Element
                ? event.target.closest('[data-momentum]')
                : null;

            if (target === entered) return;

            entered = target;

            const item = target && lookup.get(target);

            if (!item || !isEnabled()) return;

            const bounds = target.getBoundingClientRect();
            const offsetX = event.clientX - (bounds.left + bounds.width / 2);
            const offsetY = event.clientY - (bounds.top + bounds.height / 2);
            // 중심 오프셋과 커서 속도의 2D 외적이 회전의 방향과 세기가 됨.
            // 가장자리를 스칠수록 크게 돌고 중앙을 곧장 지나면 거의 돌지 않음
            const cross = offsetX * velocityY - offsetY * velocityX;
            const distance = Math.hypot(offsetX, offsetY) || 1;

            item.velocityX = clamp(velocityX * throwScale * item.strength, maxThrow * item.strength);
            item.velocityY = clamp(velocityY * throwScale * item.strength, maxThrow * item.strength);
            item.velocityRotation = clamp(
                (cross / distance) * spinScale * item.strength,
                maxSpin * item.strength
            );
            item.awake = true;
            wake();
        });

        container.addEventListener('mouseleave', () => {
            entered = null;
        });
    });

    let resizeTimer = 0;

    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        // 기준 transform 이 뷰포트에 따라 달라지므로 다시 읽어 둠
        resizeTimer = window.setTimeout(() => {
            items.forEach((item) => {
                rest(item);
                captureBase(item);
            });
            // 도형끼리의 위치 관계가 달라졌으니 벌어질 방향도 다시 잼
            ambients.forEach(measureSpread);
            wake();
        }, 150);
    }, { passive: true });
})();

(() => {
    const photos = [...document.querySelectorAll('.history_photo')];
    const textBoxes = [...document.querySelectorAll('.history_item > article')];

    if (!photos.length && !textBoxes.length) return;

    // 화면에 완전히 들어와 있으면 선명하게, 40% 이상 밖으로 나가면 효과가 완료됨
    const colorRatio = 1;
    const grayRatio = 0.6;
    const maximumTextBlur = 4;

    let animationFrame = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    function visibleRatio(element) {
        const bounds = element.getBoundingClientRect();

        if (!bounds.height) return colorRatio;

        const visible = Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0);

        return clamp(visible / bounds.height, 0, 1);
    }

    function render() {
        animationFrame = 0;

        const effectProgress = (element) => (
            clamp((colorRatio - visibleRatio(element)) / (colorRatio - grayRatio), 0, 1)
        );
        const ease = (progress) => progress * progress * (3 - 2 * progress);

        photos.forEach((photo) => {
            const progress = effectProgress(photo);
            // 양 끝에서 급격히 꺾이지 않도록 완만하게
            const eased = ease(progress);

            photo.style.setProperty('--photo-grayscale', eased.toFixed(3));
        });

        textBoxes.forEach((textBox) => {
            const blur = ease(effectProgress(textBox)) * maximumTextBlur;

            textBox.style.setProperty('--history-text-blur', `${blur.toFixed(2)}px`);
        });
    }

    function requestRender() {
        if (animationFrame) return;

        animationFrame = window.requestAnimationFrame(render);
    }

    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', requestRender, { passive: true });
    window.addEventListener('load', requestRender);
    render();
})();

// 브랜드 스토리 일러스트 플립북.
// 항목이 화면에 60% 이상 들어오면 두 장(brandstoryN <-> brandstoryN_1)을 번갈아 보여
// 그림이 움직이는 것처럼 만들고, 40% 아래로 내려가면 첫 장으로 되돌리고 멈춤.
// 켜는 기준과 끄는 기준을 벌려 둔 건 경계에 걸쳐 있을 때 깜빡이지 않게 하려는 것
(() => {
    const photos = [...document.querySelectorAll('.history_item .history_photo')];
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!photos.length || reducedMotionQuery.matches) return;

    const enterRatio = 0.6;
    const exitRatio = 0.4;
    const frameDuration = 420;

    const flipbooks = photos
        .map((photo) => {
            const baseSource = photo.getAttribute('src');
            const item = photo.closest('.history_item');

            if (!baseSource || !item) return null;

            return {
                photo,
                item,
                baseSource,
                // 두 번째 장은 확장자 앞에 _1 이 붙는 규칙
                altSource: baseSource.replace(/(\.[a-z0-9]+)$/i, '_1$1'),
                loader: null,
                isLoaded: false,
                isPlaying: false,
                showsAltFrame: false
            };
        })
        .filter(Boolean);

    if (!flipbooks.length) return;

    let timer = 0;
    let animationFrame = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    function visibleRatio(element) {
        const bounds = element.getBoundingClientRect();
        const visible = Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0);
        // 항목이 화면보다 크면 비율이 60% 에 닿지 못하므로 화면 높이로 한 번 더 눌러 줌
        const reference = Math.min(bounds.height, window.innerHeight);

        if (reference <= 0) return 0;

        return clamp(visible / reference, 0, 1);
    }

    // 두 번째 장이 무거워서 처음 재생될 때 받아 둠. 받는 동안은 첫 장이 그대로 보임
    function preload(flipbook) {
        if (flipbook.loader) return;

        flipbook.loader = new Image();
        flipbook.loader.addEventListener('load', () => {
            flipbook.isLoaded = true;
        }, { once: true });
        flipbook.loader.src = flipbook.altSource;
    }

    function showFrame(flipbook, useAltFrame) {
        if (flipbook.showsAltFrame === useAltFrame) return;

        flipbook.showsAltFrame = useAltFrame;
        flipbook.photo.src = useAltFrame ? flipbook.altSource : flipbook.baseSource;
    }

    function tick() {
        flipbooks.forEach((flipbook) => {
            if (!flipbook.isPlaying || !flipbook.isLoaded) return;

            showFrame(flipbook, !flipbook.showsAltFrame);
        });
    }

    function syncTimer() {
        const shouldRun = flipbooks.some((flipbook) => flipbook.isPlaying);

        if (shouldRun && !timer) timer = window.setInterval(tick, frameDuration);
        else if (!shouldRun && timer) {
            window.clearInterval(timer);
            timer = 0;
        }
    }

    function update() {
        animationFrame = 0;

        flipbooks.forEach((flipbook) => {
            const ratio = visibleRatio(flipbook.item);

            if (!flipbook.isPlaying && ratio >= enterRatio) {
                flipbook.isPlaying = true;
                preload(flipbook);
                return;
            }

            if (flipbook.isPlaying && ratio < exitRatio) {
                flipbook.isPlaying = false;
                showFrame(flipbook, false);
            }
        });

        syncTimer();
    }

    function requestUpdate() {
        if (animationFrame) return;

        animationFrame = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    window.addEventListener('load', requestUpdate);
    update();
})();

(() => {
    const section = document.querySelector('.pairing');
    const cards = section ? [...section.querySelectorAll('.pairing_card')] : [];
    const foodCards = section ? [...section.querySelectorAll('.pairing_food .pairing_card')] : [];
    const drinkCards = section ? [...section.querySelectorAll('.pairing_drink .pairing_card')] : [];
    const plates = section ? [...section.querySelectorAll('.pairing_plate_slot')] : [];
    const resetButton = section?.querySelector('.btn_pill_reset');
    const checkButton = section?.querySelector('.btn_pill_check');
    const handHint = section?.querySelector('.pairing_drag_hand');
    const feedback = section?.querySelector('[data-pairing-feedback]');
    const resultModal = document.querySelector('[data-pairing-result-modal]');
    const resultDialog = resultModal?.querySelector('.pairing_result_dialog');
    const resultCards = resultModal?.querySelector('[data-pairing-result-cards]');
    const resultScore = resultModal?.querySelector('[data-pairing-result-score]');
    const resultTitle = resultModal?.querySelector('[data-pairing-result-title]');
    const resultDescription = resultModal?.querySelector('[data-pairing-result-description]');
    const resultCloseButtons = resultModal ? [...resultModal.querySelectorAll('[data-pairing-result-close]')] : [];
    const resultRetryButton = resultModal?.querySelector('[data-pairing-result-retry]');
    const resultNextButton = resultModal?.querySelector('[data-pairing-result-next]');

    if (!section || !cards.length || !foodCards.length || !drinkCards.length || plates.length < 2 || !checkButton) return;

    const desktopQuery = window.matchMedia('(min-width: 48.0625rem)');
    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hintCard = foodCards[Math.min(1, foodCards.length - 1)];
    const revealDuration = 1100;
    const hintDelay = 1250;

    let revealObserver = null;
    let revealTimer = 0;
    let hintTimer = 0;
    let hintPositionFrame = 0;
    let scoreCountFrame = 0;
    let hasRevealed = false;
    let dragState = null;
    let suppressTapUntil = 0;
    const plateFlashTimers = new WeakMap();
    const absorptionGhosts = new Set();
    const selectedCards = { food: null, drink: null };
    const labels = {
        food: {
            pancake: 'Seafood Scallion Pancake',
            pizza: 'Gorgonzola Cheese Pizza',
            chicken: 'Spicy Braised Chicken',
            ribs: 'Sweet and Savory BBQ Ribs',
            bossam: 'Korean-Style Bossam'
        },
        drink: {
            // 접시 위 라벨은 nowrap + ellipsis 라, 카드 문구가 긴 백세주만 짧은 이름으로 둠
            baekseju: 'Bekseju',
            banana: 'Kooksoondang Banana Makgeolli',
            chestnut: 'Kooksoondang Chestnut Makgeolli',
            draft: 'Kooksoondang Draft Makgeolli',
            prebiotics: '100 Billion Prebiotics Makgeolli'
        }
    };
    const pairingResults = {
        baekseju: {
            pancake: { score: 88, description: "Bekseju's clean acidity cuts right through the richness of the pancake." },
            pizza: { score: 70, description: 'Gorgonzola dipped in honey meets the gentle sweetness of Bekseju — not bad at all!' },
            chicken: { score: 82, description: 'A quiet savoury depth that softens the heat beautifully.' },
            ribs: { score: 75, description: 'Sweet and salty barbecue sauce finds a surprising partner in the herbal notes.' },
            bossam: { score: 98, description: 'The rich flavor of herbal medicine perfectly blends with the savory taste of the boiled pork!' }
        },
        draft: {
            pancake: { score: 100, description: 'A flawless classic! The fizz sweeps away every last trace of oil from the pancake.' },
            pizza: { score: 85, description: 'Nutty cheese meets the tang and sparkle of makgeolli — fusion that really works.' },
            chicken: { score: 95, description: 'Spicy seasoning and the sweet, sparkling draft makgeolli are a dream team.' },
            ribs: { score: 65, description: 'Pleasant enough, though the crisp makgeolli gets a little buried under the heavy sauce.' },
            bossam: { score: 90, description: 'Mild boiled pork and the nutty rice makgeolli sit beautifully together.' }
        },
        prebiotics: {
            pancake: { score: 80, description: 'A touch plainer than regular makgeolli, but it still works nicely with the crisp pancake.' },
            pizza: { score: 92, description: 'Creamy probiotic notes and rich pizza cheese make a lovely sweet-savoury match.' },
            chicken: { score: 98, description: 'A yogurt-like sweet tartness that completely tames the chilli heat.' },
            ribs: { score: 72, description: 'Tangy makgeolli over sweet-salty barbecue sauce gives it a fun finger-food feel.' },
            bossam: { score: 78, description: 'It works with the mild pork, though the sweetness can come through a little strong.' }
        },
        banana: {
            pancake: { score: 60, description: 'The bright scallion aroma and the banana can end up fighting each other.' },
            pizza: { score: 95, description: 'Banana sweetness meets salty cheese — the very definition of sweet and salty.' },
            chicken: { score: 75, description: 'A sweet, dessert-like drink that soothes the spice.' },
            ribs: { score: 80, description: 'Sweet fruity notes harmonise with the smoky BBQ sauce.' },
            bossam: { score: 55, description: 'The herbal notes of the pork and the banana aroma never quite meet.' }
        },
        chestnut: {
            pancake: { score: 58, description: 'The delicate scallion aroma and the sweet, dessert-like chestnut clash a little.' },
            pizza: { score: 96, description: 'Nutty chestnut and salty cheese make a perfect sweet-and-salty dessert pairing.' },
            chicken: { score: 85, description: 'A sweet, charming combination that calms the tingling heat.' },
            ribs: { score: 78, description: 'Sweet chestnut forms an unexpected sweet-salty duo with the barbecue seasoning.' },
            bossam: { score: 50, description: "The herbal flavours and the strong chestnut just don't come together." }
        }
    };

    const isMotionEnabled = () => desktopQuery.matches && !reducedMotionQuery.matches;
    const isDragEnabled = () => desktopQuery.matches && finePointerQuery.matches;
    const areCardsReady = () => !isMotionEnabled() || hasRevealed;

    function typeFor(card) {
        return card.closest('.pairing_drink') ? 'drink' : 'food';
    }

    function labelFor(card) {
        if (!card) return '';

        const type = typeFor(card);
        return labels[type][card.dataset.pairingKey] || '';
    }

    function defaultPlateLabel(type) {
        return type === 'food' ? 'Food card' : 'Drink card';
    }

    function setFeedback(message = '') {
        if (feedback) feedback.textContent = message;
    }

    function syncPlate(plate) {
        const type = plate.dataset.pairingPlate;
        const selectedCard = selectedCards[type];
        const selection = plate.querySelector('[data-pairing-selection]');

        plate.classList.toggle('is_pairing_slot_filled', Boolean(selectedCard));

        if (selection) selection.textContent = selectedCard ? labelFor(selectedCard) : defaultPlateLabel(type);
    }

    function disposeAbsorptionGhost(ghost, cancelAnimation = false) {
        if (!absorptionGhosts.delete(ghost)) return;

        if (cancelAnimation) ghost.animation?.cancel();
        ghost.element.remove();
    }

    function clearAbsorptionGhosts(card = null) {
        [...absorptionGhosts]
            .filter((ghost) => !card || ghost.card === card)
            .forEach((ghost) => disposeAbsorptionGhost(ghost, true));
    }

    function animateCardIntoPlate(card, plate, sourceBounds = card.getBoundingClientRect()) {
        if (!isMotionEnabled() || !sourceBounds?.width || !sourceBounds?.height) return;

        const plateGraphic = plate.querySelector('.pairing_plate') || plate;
        const targetBounds = plateGraphic.getBoundingClientRect();

        if (!targetBounds.width || !targetBounds.height) return;

        const ghostElement = document.createElement('ul');
        const cardType = typeFor(card);
        const ghostCard = card.cloneNode(true);

        ghostElement.className = `pairing_absorb_ghost pairing_${cardType}`;
        ghostElement.setAttribute('aria-hidden', 'true');
        ghostCard.classList.remove('is_pairing_dragging', 'is_pairing_selected');
        [
            '--pairing-card-enter-y',
            '--pairing-card-drag-x',
            '--pairing-card-drag-y',
            '--pairing-card-drag-rotation',
            '--pairing-card-hover-y'
        ].forEach((property) => ghostCard.style.removeProperty(property));

        ghostElement.style.left = `${sourceBounds.left}px`;
        ghostElement.style.top = `${sourceBounds.top}px`;
        ghostElement.style.width = `${sourceBounds.width}px`;
        ghostElement.style.height = `${sourceBounds.height}px`;
        ghostElement.append(ghostCard);
        document.body.append(ghostElement);

        if (typeof ghostElement.animate !== 'function') {
            ghostElement.remove();
            return;
        }

        const sourceCenterX = sourceBounds.left + sourceBounds.width / 2;
        const sourceCenterY = sourceBounds.top + sourceBounds.height / 2;
        const targetCenterX = targetBounds.left + targetBounds.width / 2;
        const targetCenterY = targetBounds.top + targetBounds.height * 0.48;
        const translateX = targetCenterX - sourceCenterX;
        const translateY = targetCenterY - sourceCenterY;
        const midpointX = translateX * 0.72;
        const midpointY = translateY * 0.72;
        const turn = Math.max(-5, Math.min(5, translateX * 0.01));
        const ghost = { card, element: ghostElement, animation: null };

        absorptionGhosts.add(ghost);
        ghost.animation = ghostElement.animate([
            {
                transform: 'translate3d(0, 0, 0) scale(1)',
                opacity: 1,
                filter: 'blur(0) brightness(1)'
            },
            {
                offset: 0.62,
                transform: `translate3d(${midpointX.toFixed(1)}px, ${midpointY.toFixed(1)}px, 0) scale(0.42) rotate(${turn.toFixed(2)}deg)`,
                opacity: 0.84,
                filter: 'blur(0.6px) brightness(1.04)'
            },
            {
                transform: `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0) scale(0.08) rotate(${(turn * 0.35).toFixed(2)}deg)`,
                opacity: 0,
                filter: 'blur(4px) brightness(1.12)'
            }
        ], {
            duration: 520,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards'
        });

        ghost.animation.finished
            .then(() => disposeAbsorptionGhost(ghost))
            .catch(() => disposeAbsorptionGhost(ghost));
    }

    function selectCard(card, plate, sourceBounds) {
        const type = typeFor(card);

        if (!plate || plate.dataset.pairingPlate !== type) return;

        const previousCard = selectedCards[type];

        if (previousCard && previousCard !== card) {
            clearAbsorptionGhosts(previousCard);
            previousCard.classList.remove('is_pairing_selected');
        }

        selectedCards[type] = card;
        if (previousCard !== card) animateCardIntoPlate(card, plate, sourceBounds);
        card.classList.add('is_pairing_selected');
        syncPlate(plate);
        stopHint();
        section.classList.add('is_pairing_hint_paused');

        if (selectedCards.food && selectedCards.drink) {
            setFeedback('');
        } else {
            setFeedback(type === 'food' ? 'Your food card is on the plate. Now pick a drink card!' : 'Your drink card is on the plate. Now pick a food card!');
        }
    }

    function clearSelections() {
        clearAbsorptionGhosts();
        selectedCards.food = null;
        selectedCards.drink = null;
        cards.forEach((card) => card.classList.remove('is_pairing_selected'));
        plates.forEach(syncPlate);
    }

    function getPairingResult() {
        const foodCard = selectedCards.food;
        const drinkCard = selectedCards.drink;

        if (!foodCard || !drinkCard) return null;

        const foodKey = foodCard.dataset.pairingKey;
        const drinkKey = drinkCard.dataset.pairingKey;
        const result = pairingResults[drinkKey]?.[foodKey];

        if (!result) return null;

        return {
            ...result,
            foodLabel: labelFor(foodCard),
            drinkLabel: labelFor(drinkCard)
        };
    }

    function resultTitleFor(score) {
        if (score >= 95) return 'The perfect match!';
        if (score >= 85) return 'A really great match!';
        if (score >= 75) return 'An unexpected harmony!';
        return 'A brand-new pairing!';
    }

    function stopScoreCount() {
        if (!scoreCountFrame) return;

        window.cancelAnimationFrame(scoreCountFrame);
        scoreCountFrame = 0;
    }

    // 1 에서 최종 점수까지 세어 올림. 끝으로 갈수록 느려져 마지막 숫자가 눈에 들어옴
    function countScore(target) {
        if (!resultScore) return;

        stopScoreCount();

        // 모션을 껐거나 셀 구간이 없으면 결과만 바로 보여 줌
        if (!isMotionEnabled() || target <= 1) {
            resultScore.textContent = target;
            return;
        }

        const duration = 900;
        const startTime = performance.now();

        resultScore.textContent = 1;

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            resultScore.textContent = Math.round(1 + (target - 1) * eased);
            scoreCountFrame = progress < 1 ? window.requestAnimationFrame(step) : 0;
        };

        scoreCountFrame = window.requestAnimationFrame(step);
    }

    function closeResult() {
        // 세는 도중에 닫으면 멈춰 둬야 다음에 열 때 이전 카운트가 이어지지 않음
        stopScoreCount();

        if (resultModal) resultModal.hidden = true;
    }

    // 고른 카드를 그대로 복제해 보여줌. 상태 클래스와 식별자는 떼어내 원본 로직과 얽히지 않게 함
    function renderResultCards() {
        if (!resultCards) return;

        resultCards.replaceChildren();

        [selectedCards.drink, selectedCards.food].forEach((card) => {
            if (!card) return;

            const clone = card.cloneNode(true);

            clone.classList.remove('is_pairing_selected', 'is_pairing_dragging');
            clone.removeAttribute('data-momentum');

            const slot = document.createElement('div');
            // 음식 이미지 확대·위치가 `.pairing_food` 하위 규칙과 카드별 data-pairing-key 로 잡혀 있어서
            // 감싸는 칸에 원래 줄 클래스를 그대로 붙여 줘야 게임 화면과 똑같이 보임
            const rowClass = card.closest('.pairing_food') ? 'pairing_food' : 'pairing_drink';

            slot.className = `pairing_result_card ${rowClass}`;
            slot.append(clone);
            resultCards.append(slot);
        });
    }

    function showResult(result) {
        if (!resultModal) {
            setFeedback(`${result.foodLabel} × ${result.drinkLabel}: ${result.score} pts — ${result.description}`);
            return;
        }

        renderResultCards();
        countScore(result.score);
        if (resultTitle) resultTitle.textContent = resultTitleFor(result.score);
        if (resultDescription) resultDescription.textContent = result.description;

        resultModal.hidden = false;
        window.requestAnimationFrame(() => resultDialog?.focus({ preventScroll: true }));
    }

    function clearTimers() {
        window.clearTimeout(revealTimer);
        window.clearTimeout(hintTimer);
        revealTimer = 0;
        hintTimer = 0;
    }

    function setCardDelays() {
        cards.forEach((card) => {
            const row = card.closest('.pairing_drink') ? 1 : 0;
            const column = Math.max(0, [...card.parentElement.children].indexOf(card));
            const delay = column * 74 + row * 80;

            card.style.setProperty('--pairing-card-delay', `${delay}ms`);
        });
    }

    function resetCardPosition(card) {
        card.classList.remove('is_pairing_dragging');
        card.style.removeProperty('--pairing-card-drag-x');
        card.style.removeProperty('--pairing-card-drag-y');
        card.style.removeProperty('--pairing-card-drag-rotation');
    }

    function stopHint() {
        window.clearTimeout(hintTimer);
        hintTimer = 0;
        section.classList.remove('is_pairing_hint_running');
    }

    function positionHint() {
        hintPositionFrame = 0;

        if (!isMotionEnabled() || !hintCard || !plates[0]) return;

        // 접시 칸(.pairing_plate_slot)에는 위쪽 라벨도 포함돼 있어서, 접시 그림 자체를 목표로 삼음
        const plateGraphic = plates[0].querySelector('.pairing_plate') || plates[0];
        const sectionBounds = section.getBoundingClientRect();
        const sourceBounds = hintCard.getBoundingClientRect();
        const targetBounds = plateGraphic.getBoundingClientRect();
        const startX = sourceBounds.left - sectionBounds.left + sourceBounds.width * 0.55;
        const startY = sourceBounds.top - sectionBounds.top + sourceBounds.height * 0.54;
        const targetX = targetBounds.left - sectionBounds.left + targetBounds.width / 2;
        const targetY = targetBounds.top - sectionBounds.top + targetBounds.height / 2;

        section.style.setProperty('--pairing-hint-start-x', `${startX.toFixed(1)}px`);
        section.style.setProperty('--pairing-hint-start-y', `${startY.toFixed(1)}px`);
        section.style.setProperty('--pairing-hint-delta-x', `${(targetX - startX).toFixed(1)}px`);
        section.style.setProperty('--pairing-hint-delta-y', `${(targetY - startY).toFixed(1)}px`);
    }

    function requestHintPosition() {
        if (!isMotionEnabled() || hintPositionFrame) return;

        hintPositionFrame = window.requestAnimationFrame(positionHint);
    }

    function startHint() {
        if (!isMotionEnabled() || !hasRevealed || section.classList.contains('is_pairing_hint_paused')) return;

        positionHint();
        section.classList.remove('is_pairing_hint_running');

        if (handHint) void handHint.offsetWidth;

        section.classList.add('is_pairing_hint_running');
    }

    function scheduleHint() {
        stopHint();
        hintTimer = window.setTimeout(startHint, hintDelay);
    }

    function isPointInside(element, x, y) {
        const bounds = element.getBoundingClientRect();
        const horizontalPadding = 16;
        const topPadding = 88;
        const bottomPadding = 24;

        return x >= bounds.left - horizontalPadding && x <= bounds.right + horizontalPadding
            && y >= bounds.top - topPadding && y <= bounds.bottom + bottomPadding;
    }

    function targetPlateFor(card) {
        const type = typeFor(card);

        return plates.find((plate) => plate.dataset.pairingPlate === type);
    }

    function flashPlate(plate) {
        window.clearTimeout(plateFlashTimers.get(plate));
        plate.classList.remove('is_pairing_drop_active');
        void plate.offsetWidth;
        plate.classList.add('is_pairing_drop_active');

        const timer = window.setTimeout(() => {
            plate.classList.remove('is_pairing_drop_active');
        }, 650);

        plateFlashTimers.set(plate, timer);
    }

    function resetPlate(plate) {
        window.clearTimeout(plateFlashTimers.get(plate));
        plate.classList.remove('is_pairing_drop_active');
    }

    function handlePointerMove(event) {
        if (!dragState || event.pointerId !== dragState.pointerId) return;

        const offsetX = event.clientX - dragState.startX;
        const offsetY = event.clientY - dragState.startY;
        const rotation = Math.max(-4, Math.min(4, offsetX * 0.016));

        if (Math.abs(offsetX) > 6 || Math.abs(offsetY) > 6) dragState.hasMoved = true;

        dragState.card.style.setProperty('--pairing-card-drag-x', `${offsetX.toFixed(1)}px`);
        dragState.card.style.setProperty('--pairing-card-drag-y', `${offsetY.toFixed(1)}px`);
        dragState.card.style.setProperty('--pairing-card-drag-rotation', `${rotation.toFixed(2)}deg`);
    }

    function clearDragState() {
        if (!dragState) return null;

        const activeDrag = dragState;
        const { card, pointerId } = activeDrag;

        card.removeEventListener('pointermove', handlePointerMove);
        card.removeEventListener('pointerup', finishDrag);
        card.removeEventListener('pointercancel', finishDrag);

        if (card.hasPointerCapture?.(pointerId)) card.releasePointerCapture(pointerId);

        resetCardPosition(card);
        dragState = null;

        return activeDrag;
    }

    function finishDrag(event) {
        if (!dragState || event.pointerId !== dragState.pointerId) return;

        const { card } = dragState;
        const isDrop = event.type === 'pointerup';
        const targetPlate = targetPlateFor(card);
        const sourceBounds = card.getBoundingClientRect();

        const completedDrag = clearDragState();

        if (completedDrag?.hasMoved) suppressTapUntil = performance.now() + 350;

        if (isDrop && targetPlate && isPointInside(targetPlate, event.clientX, event.clientY)) {
            selectCard(card, targetPlate, sourceBounds);
            flashPlate(targetPlate);
        } else if (isDrop) {
            setFeedback('Please drop the card onto the matching plate.');
        }
    }

    function startDrag(event) {
        if (!isDragEnabled() || !areCardsReady() || dragState || event.button !== 0) return;

        const card = event.currentTarget;

        if (!(card instanceof HTMLElement)) return;

        event.preventDefault();
        stopHint();
        section.classList.add('is_pairing_hint_paused');

        dragState = {
            card,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            hasMoved: false
        };

        card.classList.add('is_pairing_dragging');
        card.setPointerCapture?.(event.pointerId);
        card.addEventListener('pointermove', handlePointerMove);
        card.addEventListener('pointerup', finishDrag);
        card.addEventListener('pointercancel', finishDrag);
    }

    function selectWithTap(card) {
        if (!areCardsReady() || performance.now() < suppressTapUntil) return;

        const targetPlate = targetPlateFor(card);

        if (!targetPlate) return;

        selectCard(card, targetPlate, card.getBoundingClientRect());
        flashPlate(targetPlate);
    }

    function revealCards() {
        if (!isMotionEnabled() || hasRevealed) return;

        hasRevealed = true;
        section.classList.add('is_pairing_cards_revealing');

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                if (!isMotionEnabled() || !hasRevealed) return;

                section.classList.add('is_pairing_cards_revealed');
                requestHintPosition();
                scheduleHint();

                revealTimer = window.setTimeout(() => {
                    section.classList.remove('is_pairing_cards_revealing');
                }, revealDuration);
            });
        });
    }

    function resetMotion() {
        clearTimers();

        if (revealObserver) {
            revealObserver.disconnect();
            revealObserver = null;
        }

        if (hintPositionFrame) {
            window.cancelAnimationFrame(hintPositionFrame);
            hintPositionFrame = 0;
        }

        clearDragState();
        cards.forEach(resetCardPosition);
        clearSelections();
        plates.forEach(resetPlate);
        closeResult();
        section.classList.remove(
            'is_pairing_motion_ready',
            'is_pairing_cards_revealing',
            'is_pairing_cards_revealed',
            'is_pairing_hint_running',
            'is_pairing_hint_paused'
        );
        hasRevealed = false;
        dragState = null;
    }

    function updateMode() {
        resetMotion();

        if (!isMotionEnabled()) return;

        setCardDelays();
        section.classList.add('is_pairing_motion_ready');
        revealObserver = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;

            revealCards();
            revealObserver?.disconnect();
        }, { threshold: 0.18 });
        revealObserver.observe(section);
    }

    resetButton?.addEventListener('click', () => {
        cards.forEach(resetCardPosition);
        clearSelections();
        plates.forEach(resetPlate);
        closeResult();
        setFeedback('Your selected cards have been reset.');
        section.classList.remove('is_pairing_hint_paused');

        if (isMotionEnabled() && hasRevealed) {
            requestHintPosition();
            scheduleHint();
        }
    });

    checkButton.addEventListener('click', () => {
        const result = getPairingResult();

        if (!result) {
            setFeedback('Please place one food card and one drink card on the plates.');
            return;
        }

        showResult(result);
    });

    resultCloseButtons.forEach((button) => button.addEventListener('click', closeResult));

    // 둘 다 결과를 닫고 접시를 비움. 안내 문구는 남기지 않음
    resultRetryButton?.addEventListener('click', () => {
        closeResult();
        clearSelections();
        setFeedback('');
    });

    resultNextButton?.addEventListener('click', () => {
        closeResult();
        clearSelections();
        setFeedback('');
    });

    resultModal?.addEventListener('click', (event) => {
        if (event.target === resultModal) closeResult();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && resultModal && !resultModal.hidden) closeResult();
    });

    cards.forEach((card) => {
        card.addEventListener('pointerdown', startDrag);
        card.addEventListener('click', () => selectWithTap(card));
    });

    const listenForChanges = (query, callback) => {
        if (query.addEventListener) query.addEventListener('change', callback);
        else query.addListener(callback);
    };

    window.addEventListener('resize', requestHintPosition, { passive: true });
    window.addEventListener('load', requestHintPosition);
    /* 힌트 애니메이션은 무한 반복이라 startHint 때 잰 좌표를 계속 쓴다.
       그 뒤 접시 위치가 바뀌면(레이아웃 변경·이미지 지연 로딩·CSS 갱신) 손이 엉뚱한 곳으로 가므로
       매 회차가 시작될 때 다시 재서 스스로 맞춰지게 함 */
    handHint?.addEventListener('animationiteration', positionHint);
    listenForChanges(desktopQuery, updateMode);
    listenForChanges(reducedMotionQuery, updateMode);
    updateMode();
})();

(() => {
    const section = document.querySelector('.events');
    const slides = section ? [...section.querySelectorAll('.event_slide')] : [];

    if (!section || slides.length < 2) return;

    const desktopQuery = window.matchMedia('(min-width: 48.0625rem)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const smoothStep = (value) => value * value * (3 - 2 * value);
    const revealTrail = 20;
    const transitionSpan = 0.18;
    const cupStopProgress = 0.9;
    const motionProperties = [
        '--event-card-opacity',
        '--event-copy-opacity',
        '--event-cup-y',
        '--event-cup-x',
        '--event-bottle-color',
        '--event-line-progress'
    ];

    const slideStates = slides.map((element) => ({
        element,
        revealTargets: [...element.querySelectorAll('[data-event-reveal]')],
        characters: []
    }));

    let isPrepared = false;
    let animationFrame = 0;

    function prepareCharacters() {
        if (isPrepared) return;

        slideStates.forEach((slide) => {
            slide.revealTargets.forEach((target) => {
                const label = target.textContent.trim();
                const fragment = document.createDocumentFragment();

                target.setAttribute('aria-label', label);

                [...label].forEach((character) => {
                    if (/\s/.test(character)) {
                        fragment.append(document.createTextNode(character));
                        return;
                    }

                    const span = document.createElement('span');

                    span.className = 'event_reveal_char';
                    span.setAttribute('aria-hidden', 'true');
                    span.textContent = character;
                    fragment.append(span);
                    slide.characters.push(span);
                });

                target.replaceChildren(fragment);
            });
        });

        isPrepared = true;
    }

    function resetStaticState() {
        section.classList.remove('is_event_motion_ready');

        slideStates.forEach((slide) => {
            slide.element.classList.remove('is_event_visible');
            slide.element.removeAttribute('aria-hidden');
            motionProperties.forEach((property) => slide.element.style.removeProperty(property));
            slide.characters.forEach((character) => character.style.removeProperty('--event-char-emphasis'));
        });
    }

    function slideVisibility(index, stagePosition) {
        const enter = index === 0
            ? 1
            : clamp((stagePosition - (index - transitionSpan)) / (transitionSpan * 2), 0, 1);
        const exit = index === slides.length - 1
            ? 1
            : clamp(((index + 1 + transitionSpan) - stagePosition) / (transitionSpan * 2), 0, 1);

        return Math.min(enter, exit);
    }

    function renderSlide(slide, index, stagePosition, activeIndex, journeyProgress, cupProgress) {
        const localProgress = clamp(stagePosition - index, 0, 1);
        const eased = smoothStep(localProgress);
        const opacity = slideVisibility(index, stagePosition);
        const copyProgress = clamp((localProgress - 0.08) / 0.74, 0, 1);
        const revealPosition = copyProgress * (slide.characters.length + revealTrail);

        slide.element.classList.toggle('is_event_visible', opacity > 0.01);
        slide.element.setAttribute('aria-hidden', index === activeIndex ? 'false' : 'true');
        slide.element.style.setProperty('--event-card-opacity', opacity.toFixed(3));
        slide.element.style.setProperty('--event-copy-opacity', (0.38 + eased * 0.62).toFixed(3));
        slide.element.style.setProperty('--event-cup-y', `${((1 - cupProgress) * 10).toFixed(2)}px`);
        slide.element.style.setProperty('--event-cup-x', `${(cupProgress * 100).toFixed(2)}%`);
        slide.element.style.setProperty(
            '--event-bottle-color',
            cupProgress >= cupStopProgress
                ? 'var(--kooksoondang_orange)'
                : 'var(--makgeolli_light1)'
        );
        slide.element.style.setProperty('--event-line-progress', journeyProgress.toFixed(3));

        slide.characters.forEach((character, characterIndex) => {
            const emphasis = smoothStep(clamp((revealPosition - characterIndex) / revealTrail, 0, 1));
            const characterOpacity = 0.34 + emphasis * 0.66;

            character.style.setProperty('--event-char-emphasis', characterOpacity.toFixed(3));
        });
    }

    function render() {
        animationFrame = 0;

        if (!section.classList.contains('is_event_motion_ready')) return;

        const bounds = section.getBoundingClientRect();
        const scrollDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
        const progress = clamp(-bounds.top / scrollDistance, 0, 1);
        const stagePosition = progress * slides.length;
        const activeIndex = Math.min(Math.floor(stagePosition), slides.length - 1);
        const journeyStage = Math.min(Math.floor(stagePosition), slides.length - 1);
        const journeyStageProgress = smoothStep(clamp(stagePosition - journeyStage, 0, 1));
        const journeyProgress = (journeyStage + journeyStageProgress) / slides.length;
        const cupProgress = Math.min(journeyProgress, cupStopProgress);

        slideStates.forEach((slide, index) => (
            renderSlide(slide, index, stagePosition, activeIndex, journeyProgress, cupProgress)
        ));
    }

    function requestRender() {
        if (animationFrame) return;

        animationFrame = window.requestAnimationFrame(render);
    }

    function updateMode() {
        const isEnabled = desktopQuery.matches && !reducedMotionQuery.matches;

        if (!isEnabled) {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            resetStaticState();
            return;
        }

        prepareCharacters();
        section.classList.add('is_event_motion_ready');
        requestRender();
    }

    const listenForChanges = (query, callback) => {
        if (query.addEventListener) query.addEventListener('change', callback);
        else query.addListener(callback);
    };

    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', requestRender, { passive: true });
    listenForChanges(desktopQuery, updateMode);
    listenForChanges(reducedMotionQuery, updateMode);
    updateMode();
})();

(() => {
    const character = document.querySelector('.hero_character:not(.hero_character_frame)');
    const frames = [...document.querySelectorAll('[data-hero-frame]')];

    if (!character || frames.length < 2) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // 1 - 2 - 3 - 2 로 한 바퀴. 이어 붙으면 1-2-3-2-1-2-3-2… 가 되어 같은 장면이 겹치지 않음
    const order = [0, 1, 2, 1];
    const frameDuration = 200;

    let frameTimer = 0;
    let step = 0;

    function showStep(next) {
        step = next % order.length;

        const current = order[step];

        frames.forEach((frame, index) => frame.classList.toggle('is_hero_frame_on', index === current));
        character.classList.add('is_hero_playing');
    }

    function stop() {
        window.clearInterval(frameTimer);
        frameTimer = 0;
        frames.forEach((frame) => frame.classList.remove('is_hero_frame_on'));
        character.classList.remove('is_hero_playing');
    }

    character.addEventListener('mouseenter', () => {
        if (frameTimer || reducedMotionQuery.matches) return;

        showStep(0);
        frameTimer = window.setInterval(() => showStep(step + 1), frameDuration);
    });

    character.addEventListener('mouseleave', stop);
})();

/* 페어링 게임 구간 스크롤 잠금: 카드가 화면을 가득 채운 지점에서 스크롤을 멈추고,
   결과 모달의 Next 를 누르면 풀림. 한 번 풀리면 다시 잠기지 않음 */
(() => {
    const section = document.querySelector('.pairing');
    const inner = section?.querySelector('.pairing_inner');
    const modal = document.querySelector('[data-pairing-result-modal]');
    const nextButton = modal?.querySelector('[data-pairing-result-next]');
    // 결과 창을 닫는 것도 게임을 끝냈다는 뜻이라 Next 와 같이 잠금을 풀어 줌
    const closeButtons = modal ? [...modal.querySelectorAll('[data-pairing-result-close]')] : [];

    if (!section || !inner || !nextButton) return;

    const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar']);

    let lockY = 0;
    let lastY = window.scrollY;
    let isLocked = false;
    let hasFinished = false;

    // 결과 모달 안은 자체 스크롤(overflow-y: auto)이 있어야 해서 잠금에서 제외
    const isInsideModal = (target) => target instanceof Element && !!target.closest('[data-pairing-result-modal]');

    // .pairing_inner 가 화면 정중앙에 오는 위치. 이때 섹션이 화면을 완전히 덮음
    function measure() {
        const bounds = inner.getBoundingClientRect();
        lockY = Math.round(bounds.top + window.scrollY + bounds.height / 2 - window.innerHeight / 2);
    }

    // 위치는 네이티브로 즉시 잡고, Lenis 에는 같은 값을 알려 내부 상태를 맞춤.
    // Lenis 쪽만 쓰면 자체 rAF 틱을 기다리느라 한 프레임 늦게 반영됨.
    // force 는 stop() 상태에서도 이동시키는 옵션
    function jumpTo(y) {
        const lenis = window.siteLenis;

        window.scrollTo(0, y);
        if (lenis && typeof lenis.scrollTo === 'function') lenis.scrollTo(y, { immediate: true, force: true });
    }

    function blockEvent(event) {
        if (isInsideModal(event.target)) return;

        event.preventDefault();
    }

    function blockKey(event) {
        if (!scrollKeys.has(event.key) || isInsideModal(event.target)) return;

        event.preventDefault();
    }

    // 스크롤바 드래그처럼 막을 수 없는 경로는 위치를 되돌려 붙잡음
    function holdPosition() {
        if (isLocked && Math.abs(window.scrollY - lockY) > 1) jumpTo(lockY);
    }

    function lock() {
        if (isLocked) return;

        isLocked = true;
        window.siteLenis?.stop();
        jumpTo(lockY);
        window.addEventListener('wheel', blockEvent, { passive: false });
        window.addEventListener('touchmove', blockEvent, { passive: false });
        window.addEventListener('keydown', blockKey);
        window.addEventListener('scroll', holdPosition, { passive: true });
    }

    // 미니 메뉴로 구간을 고르는 건 게임을 건너뛰겠다는 뜻이므로 다시 걸리지 않게 함.
    // 아직 잠기기 전에 눌렀더라도 이동 도중 잠금 지점을 지나며 붙잡히면 안 되므로 표시부터 세움
    function release() {
        hasFinished = true;
        unlock();
    }

    function unlock() {
        if (!isLocked) return;

        isLocked = false;
        hasFinished = true;
        window.removeEventListener('wheel', blockEvent);
        window.removeEventListener('touchmove', blockEvent);
        window.removeEventListener('keydown', blockKey);
        window.removeEventListener('scroll', holdPosition);
        window.siteLenis?.start();
    }

    // 위에서 아래로 지나가는 순간만 잡음. 이미 지나친 위치에서 시작하면(새로고침 등)
    // 뒤로 끌어당기지 않고, 다시 올라갔다 내려올 때 비로소 걸림
    function watch() {
        const previous = lastY;

        lastY = window.scrollY;

        if (isLocked || hasFinished || previous >= lockY || lastY < lockY) return;

        // 이미지가 늦게 실려 lockY 가 어긋나 있을 수 있어 교차 순간에만 다시 잼
        measure();
        if (lastY < lockY) return;

        lock();
    }

    measure();
    lastY = window.scrollY;

    window.addEventListener('scroll', watch, { passive: true });
    window.addEventListener('resize', () => {
        measure();
        holdPosition();
    }, { passive: true });
    window.addEventListener('load', measure);
    nextButton.addEventListener('click', unlock);
    closeButtons.forEach((button) => button.addEventListener('click', unlock));

    // 링크가 하나씩 늘어도 따라오도록 목록에 위임해 둠.
    // 아이콘이나 여백이 아니라 글자(.side_nav_label)를 눌렀을 때만 풀림
    document.querySelector('.side_nav')?.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('.side_nav_label')) release();
    });
})();

/* 스크롤 스택: 브랜드 스토리를 마지막 화면에서 고정시키려면 sticky top 에 음수 오프셋이 필요한데,
   그 값이 섹션 높이에 걸려 있어 css 만으로는 못 씀. 높이를 재서 변수로 넘겨 줌 */
(() => {
    const history = document.querySelector('.scroll_stack > .history');

    if (!history) return;

    const syncHeight = () => {
        history.style.setProperty('--history-sticky-height', `${history.offsetHeight}px`);
    };

    syncHeight();

    // 이미지·폰트가 늦게 들어오면 높이가 크게 달라지므로 load 는 항상 확인.
    // top 만 바뀌고 높이에는 영향이 없어서 되먹임이 생기지 않음
    window.addEventListener('load', syncHeight);

    if (typeof ResizeObserver === 'function') {
        new ResizeObserver(syncHeight).observe(history);
    } else {
        window.addEventListener('resize', syncHeight, { passive: true });
    }
})();

/* 섹션 머리말(data-head-reveal): 화면에 들어오면 타이틀 → 설명 순서로 fade-up.
   휠을 되감으면 클래스가 떨어지면서 역순으로 되감김 */
(() => {
    const heads = [...document.querySelectorAll('[data-head-reveal]')];

    if (!heads.length || typeof IntersectionObserver !== 'function') return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 모션을 끈 사용자에겐 대기 상태 자체를 씌우지 않아 처음부터 그대로 보임
    if (reducedMotionQuery.matches) return;

    // 이 비율만큼 보이면 나타나고, 그 아래로 떨어지면 되감김
    const revealRatio = 0.6;
    const revealStep = 130;

    heads.forEach((head) => {
        // 나타날 땐 위에서부터, 되감을 땐 아래에서부터. 자식이 몇 개든 정확히 역순이 됨
        const items = [...head.children];

        items.forEach((item, index) => {
            item.style.setProperty('--head-reveal-in', `${index * revealStep}ms`);
            item.style.setProperty('--head-reveal-out', `${(items.length - 1 - index) * revealStep}ms`);
        });

        head.classList.add('is_head_reveal_ready');
    });

    window.requestAnimationFrame(() => {
        heads.forEach((head) => head.classList.add('is_head_reveal_armed'));
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle('is_head_reveal_revealed', entry.intersectionRatio >= revealRatio);
        });
    }, { threshold: [0, revealRatio, 1] });

    heads.forEach((head) => revealObserver.observe(head));
})();

/* 히어로 제목: 페이지에 들어올 때(첫 진입·새로고침) 한 번만 잔이 차오르듯 색이 채워짐.
   스크롤로 되돌아오거나 hover 해도 다시 재생되지 않음 */
(() => {
    const title = document.querySelector('.hero_title');

    if (!title) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const supportsTextClip = typeof CSS === 'object'
        && typeof CSS.supports === 'function'
        && (CSS.supports('background-clip', 'text') || CSS.supports('-webkit-background-clip', 'text'));

    // 오려 내기를 못 하는 환경이거나 모션을 끈 사용자에겐 처음부터 칠해진 글자 그대로 둠
    if (reducedMotionQuery.matches || !supportsTextClip) return;

    const animationName = 'hero_title_pour';
    const safetyDelay = 3000;
    let safetyTimer = 0;

    function finish() {
        window.clearTimeout(safetyTimer);
        title.removeEventListener('animationend', handleAnimationEnd);
        title.classList.remove('is_pour_ready', 'is_pour_running');
    }

    function handleAnimationEnd(event) {
        if (event.animationName !== animationName) return;

        finish();
    }

    title.classList.add('is_pour_ready');
    title.addEventListener('animationend', handleAnimationEnd);
    // 애니메이션이 끝내 재생되지 않아도 글자가 투명한 채로 남지 않도록
    safetyTimer = window.setTimeout(finish, safetyDelay);

    // 대기 상태가 한 프레임 그려진 뒤라야 처음부터 재생됨
    window.requestAnimationFrame(() => title.classList.add('is_pour_running'));
})();

/* 히어로 설명 문구: 왼쪽 → 오른쪽, 위 → 아래로 한 글자씩 타이핑되듯 나타남 */
(() => {
    const desc = document.querySelector('.hero_desc');

    if (!desc || typeof IntersectionObserver !== 'function') return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 모션을 끈 사용자에겐 쪼개지 않고 그대로 둠
    if (reducedMotionQuery.matches) return;

    // 원본(codepen xxmaNYj)은 stagger 0.04s. 이 문단은 글자가 137 자라 그대로 쓰면
    // 글자 수가 많아 간격이 조금만 넓어도 마지막 글자가 한참 뒤에 들어옴. 슬라이드 인은 균일한 간격이라 문장부호 쉼은 두지 않음
    const charStep = 14;

    // <br> 로 줄을 나누고, 들여쓰기 때문에 생긴 공백은 브라우저가 렌더링하는 대로 하나로 접음
    const lines = [...desc.childNodes]
        .reduce((acc, node) => {
            if (node.nodeName === 'BR') acc.push('');
            else acc[acc.length - 1] += node.textContent;

            return acc;
        }, [''])
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean);

    if (!lines.length) return;

    const fragment = document.createDocumentFragment();
    let delay = 0;

    lines.forEach((line, lineIndex) => {
        if (lineIndex) fragment.append(document.createElement('br'));

        line.split(' ').forEach((word, wordIndex) => {
            // 단어 사이 공백은 실제 공백 문자로 남겨 둬야 이 자리에서만 줄이 바뀜
            if (wordIndex) fragment.append(document.createTextNode(' '));

            const wordSpan = document.createElement('span');

            wordSpan.className = 'hero_desc_word';

            [...word].forEach((character) => {
                const span = document.createElement('span');

                span.className = 'hero_desc_char';
                span.textContent = character;
                span.style.setProperty('--type-delay', `${delay}ms`);
                wordSpan.append(span);

                delay += charStep;
            });

            fragment.append(wordSpan);
        });
    });

    desc.replaceChildren(fragment);
    desc.classList.add('is_typing_ready');

    const typeObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        // 대기 상태가 한 프레임 그려진 뒤라야 transition 이 걸림
        window.requestAnimationFrame(() => desc.classList.add('is_typing_running'));
        typeObserver.disconnect();
    }, { threshold: 0.3 });

    typeObserver.observe(desc);
})();

/* 유리잔 분리선: 스크롤로 화면에 들어오면 위에서 아래로 그라데이션이 차오르며 나타남 */
(() => {
    const divider = document.querySelector('.glass_divider');

    if (!divider || typeof IntersectionObserver !== 'function') return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 모션을 끈 사용자에겐 마스크 자체를 씌우지 않아 처음부터 그대로 보임
    if (reducedMotionQuery.matches) return;

    // 되감기까지 하려면 옵저버를 계속 붙여 두고, 임계값을 넘나들 때마다 클래스를 토글해야 함.
    // isIntersecting 은 1px 만 걸쳐도 true 라 임계값 판단에 못 쓰고 intersectionRatio 로 비교함
    const revealRatio = 0.2;

    divider.classList.add('is_glass_ready');
    // 마스크가 씌워진 첫 프레임이 지난 뒤에 transition 을 열어 준다 (로드 직후 저절로 사라지는 것 방지)
    window.requestAnimationFrame(() => divider.classList.add('is_glass_armed'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            divider.classList.toggle('is_glass_revealed', entry.intersectionRatio >= revealRatio);
        });
    }, { threshold: [0, revealRatio, 1] });

    revealObserver.observe(divider);
})();
