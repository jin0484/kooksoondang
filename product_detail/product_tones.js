/* =========================================================
   제품별 배경색 (배너 배경, 병 옆 장식, 글자색의 바탕이 되는 색)

   <head> 에서 먼저 불러와서 첫 화면이 그려지기 전에 배너 색을 정해 둠.
   (이걸 안 하면 기본 초록으로 그려졌다가 스크립트가 늦게 도착해 제품 색으로 바뀌는 것이 보임)
   product_switch.js 도 같은 값을 씀 → window.PD_TONES
   색은 상품 목록 카드의 배경색. 100 Billion Prebiotics 만 warm black(#272625)
========================================================= */

(() => {
    const TONES = {
        draft: '#2C8B62',
        banana: '#F2D757',
        peach: '#F5B4C1',
        whitegrape: '#B3C643',
        strawberry: '#F28E8E',
        rice: '#B0916E',
        prebiotics: '#272625',
        chestnut: '#845C42',
    };

    window.PD_TONES = TONES;

    // 주소의 ?product= 값에 맞는 색을 바로 적용 (없으면 Draft)
    let slug = 'draft';
    try {
        const wanted = new URLSearchParams(location.search).get('product');
        if (wanted && TONES[wanted]) slug = wanted;
    } catch (e) { /* 주소를 못 읽으면 Draft */ }

    document.documentElement.style.setProperty('--pd-tone', TONES[slug]);

    // product_switch.js 가 제품 소개를 선택한 제품으로 바꿔 끼우기 전에는 Draft 가 잠깐 보이지 않게 숨김
    // (스크립트가 못 도는 경우를 위해 1.5초 뒤에는 어떤 경우든 보이게 함)
    document.documentElement.classList.add('pd_pending');
    setTimeout(() => document.documentElement.classList.remove('pd_pending'), 1500);
})();
