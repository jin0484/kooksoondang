/* 제품 상세 페이지의 3D 병(three.js) 연출을 걷어낸 뒤 남겨 둔 최소 동작.
   예전 draft.js 에는 3D 병과 같이 들어 있던 것들 중 3D 와 상관없는 두 가지만 옮겨 왔음. (초록색 LOADING 로딩 화면은 3D 병을 기다리던 용도라 아예 없앴음)
   - 스크롤 안내(#hint)를 조금 내려가면 숨김
   - 화면에 25% 이상 들어온 section 에 .in 클래스를 붙임(CSS 의 나타나는 연출이 이 클래스를 씀)
   draft.js(3D 버전)는 지우지 않고 파일로만 남겨 두었고, 이 페이지는 더 이상 불러오지 않음 */

(() => {
    const hint = document.getElementById('hint');

    function onScroll() {
        if (hint) hint.style.opacity = window.scrollY > 20 ? 0 : 1;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle('in', entry.isIntersecting);
        });
    }, { threshold: 0.25 });

    document.querySelectorAll('section').forEach((section) => observer.observe(section));
})();
