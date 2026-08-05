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
    const historySection = document.querySelector('.history');
    const historyTimeline = historySection?.querySelector('.history_timeline');
    const morphStage = historySection?.querySelector('.history_morph');
    const morphPath = historySection?.querySelector('.history_morph_path');
    const staticDecos = historySection ? [...historySection.querySelectorAll('.history_deco')] : [];
    const historyItems = historySection ? [...historySection.querySelectorAll('.history_item')] : [];

    if (!historySection || !historyTimeline || !morphStage || !morphPath || staticDecos.length !== 4 || historyItems.length !== staticDecos.length) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 48rem)');
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const stageSize = { width: 228, height: 510 };
    const sampleCount = 240;
    const rotationKeyframes = [0, -12, 12, -10];
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

    function prepareFrames() {
        const targetRects = staticDecos.map((deco) => deco.getBoundingClientRect());
        const bottleWidth = targetRects[2]?.width;

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
        const rawCenters = [window.scrollY + timelineBounds.top, ...historyItems.slice(1).map((item) => {
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
        const petOffset = clamp(window.innerWidth * petOffsetRange.viewportRatio, petOffsetRange.min, petOffsetRange.max);
        const verticalOffset = from === to
            ? (from === rotationKeyframes.length - 1 ? petOffset : 0)
            : (to === rotationKeyframes.length - 1 ? petOffset * easedProgress : 0);

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
