const sideNav = document.querySelector('.side_nav');
const sideNavItems = sideNav.querySelectorAll('li');
const activeIcon = 'asset/icon/submenu_arrow.svg';
const inactiveIcon = 'asset/icon/submenu_dot.svg';

function changeSideNavIcon(icon, iconSource) {
    if (icon.getAttribute('src') === iconSource) return;

    icon.classList.remove('is_icon_animating');
    void icon.offsetWidth;
    icon.src = iconSource;
    icon.classList.add('is_icon_animating');
}

sideNav.addEventListener('click', (event) => {
    const link = event.target.closest('a');

    if (!link || !sideNav.contains(link)) return;

    const activeItem = link.closest('li');

    sideNavItems.forEach((item) => {
        const isActive = item === activeItem;
        const itemLink = item.querySelector('a');
        const icon = item.querySelector('img');

        item.classList.toggle('is_current', isActive);
        itemLink.toggleAttribute('aria-current', isActive);
        changeSideNavIcon(icon, isActive ? activeIcon : inactiveIcon);
    });
});

(() => {
    const siteLogo = document.querySelector('.site_logo');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!siteLogo) return;

    siteLogo.addEventListener('click', () => {
        if (reducedMotionQuery.matches) return;

        siteLogo.classList.remove('is_dot_bouncing');
        void siteLogo.offsetWidth;
        siteLogo.classList.add('is_dot_bouncing');
    });

    siteLogo.addEventListener('animationend', (event) => {
        if (event.animationName === 'logo_dot_bounce') {
            siteLogo.classList.remove('is_dot_bouncing');
        }
    });
})();

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
    // 고정 장식(trans_05) 아래끝에 걸쳐 시작해 아래로 떨어짐
    const dripTailRise = -305;
    const dropFallDistance = 120;
    const petOffsetRange = { min: 134, viewportRatio: 0.0835, max: 160 };
    const morphScrollDuration = 1.12;

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

    function getScrollState() {
        const viewportCenter = window.scrollY + window.innerHeight / 2;
        const timelineBounds = historyTimeline.getBoundingClientRect();
        const rawCenters = [...introDecos.map((deco) => {
            const bounds = deco.getBoundingClientRect();
            return window.scrollY + bounds.top + bounds.height / 2;
        }), window.scrollY + timelineBounds.top, ...historyItems.slice(1).map((item) => {
            const bounds = item.getBoundingClientRect();
            return window.scrollY + bounds.top + bounds.height / 2;
        })];
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

    const items = [];
    let animationFrame = 0;
    let lastTime = 0;

    const clamp = (value, limit) => Math.min(Math.max(value, -limit), limit);
    const isEnabled = () => hoverQuery.matches && !reducedMotionQuery.matches;

    // 기존 transform 을 지우지 않고 그 안쪽에 흔들림을 얹어야 제자리에서 회전함
    function captureBase(item) {
        item.element.style.transform = '';

        const base = window.getComputedStyle(item.element).transform;

        item.base = base && base !== 'none' ? `${base} ` : '';
    }

    function rest(item) {
        item.awake = false;
        item.x = 0;
        item.y = 0;
        item.rotation = 0;
        item.velocityX = 0;
        item.velocityY = 0;
        item.velocityRotation = 0;
        item.element.style.transform = '';
    }

    function step(time) {
        animationFrame = 0;

        const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.04) : 1 / 60;
        lastTime = time;

        let awakeCount = 0;

        items.forEach((item) => {
            if (!item.awake) return;

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
            item.element.style.transform = `${item.base}translate(${item.x.toFixed(2)}px, ${item.y.toFixed(2)}px) rotate(${item.rotation.toFixed(2)}deg)`;
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

        container.querySelectorAll('[data-momentum]').forEach((element) => {
            const item = {
                element,
                base: '',
                x: 0,
                y: 0,
                rotation: 0,
                velocityX: 0,
                velocityY: 0,
                velocityRotation: 0,
                awake: false
            };

            captureBase(item);
            lookup.set(element, item);
            items.push(item);
        });

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

            item.velocityX = clamp(velocityX * throwScale, maxThrow);
            item.velocityY = clamp(velocityY * throwScale, maxThrow);
            item.velocityRotation = clamp((cross / distance) * spinScale, maxSpin);
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
        }, 150);
    }, { passive: true });
})();

(() => {
    const photos = [...document.querySelectorAll('.history_photo')];

    if (!photos.length) return;

    // 화면에 완전히 들어와 있으면 컬러, 절반이 밖으로 나가면 완전한 흑백
    const colorRatio = 1;
    const grayRatio = 0.5;

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

        photos.forEach((photo) => {
            const progress = clamp((colorRatio - visibleRatio(photo)) / (colorRatio - grayRatio), 0, 1);
            // 양 끝에서 급격히 꺾이지 않도록 완만하게
            const eased = progress * progress * (3 - 2 * progress);

            photo.style.setProperty('--photo-grayscale', eased.toFixed(3));
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
