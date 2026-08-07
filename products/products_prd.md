[Kooksoondang] Products Page PRD
1. 제품 개요
국순당의 다양한 전통주 제품을 해외 사용자가 쉽고 직관적으로 탐색할 수 있도록 구성한 영문 Products 페이지를 제작합니다.
제품을 단순 나열하는 방식에서 벗어나 사용자의 막걸리 경험 수준과 제품 카테고리를 기반으로 제품을 탐색할 수 있도록 구성하며, 막걸리 입문자에게는 별도의 Starter Kit를 제안하여 제품 선택의 진입장벽을 낮춥니다.
시각적으로는 따뜻한 오프화이트 배경과 제품별 컬러 그래픽, 제품 컷아웃 이미지를 활용하여 각 제품의 맛과 특징을 직관적으로 구분합니다.
2. 문제 정의
 해외 사용자는 막걸리 제품 간 종류와 특징의 차이를 이해하기 어렵습니다.
 다양한 제품이 존재하지만 사용자의 취향이나 경험 수준에 맞는 제품을 선택하기 어렵습니다.
 막걸리를 처음 접하는 사용자는 어떤 제품부터 시작해야 하는지 판단하기 어렵습니다.
 기존의 정보 중심 제품 소개만으로는 각 제품의 맛과 개성을 직관적으로 전달하기 어렵습니다.
 제품 탐색 과정에서 카테고리와 사용자 수준을 고려한 탐색 경험이 필요합니다.
3. 목표 사용자
 막걸리와 한국 전통주를 처음 접하는 해외 20~30대 사용자
 자신의 취향에 맞는 새로운 막걸리를 탐색하려는 사용자
 기존 막걸리 외 과일 막걸리 등 다양한 제품을 경험하고 싶은 사용자
 모바일 또는 데스크톱 환경에서 국순당 제품 정보를 탐색하는 사용자
4. 제품 목표
 사용자가 자신의 막걸리 경험 수준을 기준으로 제품을 탐색할 수 있게 합니다.
 제품을 카테고리별로 분류하여 원하는 제품을 빠르게 찾을 수 있게 합니다.
 제품 이미지와 간단한 Taste Keyword를 통해 제품 특징을 직관적으로 전달합니다.
 막걸리 입문자에게 Beginner's Starter Kit를 제안하여 제품 선택을 돕습니다.
 제품 탐색 과정에서 국순당이 보유한 다양한 제품 라인업을 자연스럽게 인지하도록 합니다.
5. 제외 범위
 회원가입 및 로그인
 장바구니 및 직접 결제
 실시간 재고 조회
 배송 및 주문 관리
 사용자 리뷰 작성
 개인화 추천 알고리즘
 관리자 및 CMS
 데이터베이스 연동
6. 디자인 기준
 제공된 product.pdf를 Products 페이지의 시각 기준으로 사용합니다.
 PDF에 없는 제품, 기능, 이미지, 아이콘을 임의로 추가하지 않습니다.
 오프화이트 계열의 배경과 제품별 컬러 그래픽을 유지합니다.
 제품 이미지는 기존 승인된 assets를 우선 사용합니다.
 제품 카드의 크기, 간격, 타이포그래피 및 카테고리 버튼의 시각적 위계를 디자인 시안에 맞춥니다.
 데스크톱 디자인을 기준으로 하되 모바일 환경에서도 제품 탐색이 가능하도록 반응형으로 구현합니다.
7. 핵심 기능
[Experience / Taste Filter]
What are you craving today? 영역을 통해 사용자의 제품 탐색 기준을 제공합니다.
 Beginner 등 사용자의 막걸리 경험 수준을 선택할 수 있도록 구성합니다.
 선택된 상태는 시각적으로 명확하게 구분합니다.
 선택 결과에 따라 관련 제품을 탐색할 수 있도록 연결합니다.
[Product Category]
제품군을 카테고리별로 탐색할 수 있도록 합니다.
 Makgeolli
 Bekseju
 YedamCheong
 Soju
선택된 카테고리는 is_active 상태로 표시합니다.
[Product Cards]
 제품 이미지
 제품명
 제품별 Taste Keyword
 제품별 배경 그래픽
을 카드 형태로 제공합니다.
PDF에서 확인되는 주요 제품은 다음과 같습니다.
 Draft Makgeolli
 Rice Makgeolli
 100 Billion Prebiotics
 Strawberry Makgeolli
 Banana Makgeolli
 Peach Makgeolli
 Chestnut Makgeolli
 White Grape Makgeolli
[View All]
 대표 제품 하단에 VIEW ALL CTA를 제공합니다.
 클릭 시 전체 제품을 확인할 수 있도록 제품 영역을 확장하거나 전체 제품 목록으로 연결합니다.
 실제 구현 방식은 디자인 및 개발 구조에 맞춰 결정합니다.
[Beginner's Starter Kit]
막걸리 입문자에게 비교적 접근하기 쉬운 제품을 별도 영역에서 추천합니다.
PDF에서는 BEGINNER'S STARTER KIT와 함께 “A perfectly sweet and smooth introduction to Korean traditional drinks.”라는 설명 및 Strawberry, Banana, White Grape Makgeolli가 제시되어 있습니다.
 Strawberry Makgeolli
 Banana Makgeolli
 White Grape Makgeolli
VIEW DETAILS CTA 제공
8. 화면 목록과 목적
Header / Navigation
 목적: Products 페이지 내외의 주요 콘텐츠로 이동할 수 있도록 합니다.
 주요 행동:
 About Brand 이동
 Products 이동
 Pairing 이동
 Event/Promotion 이동
 Contact Us 이동
 검색 기능 접근
 필요한 정보:
 Kooksoondang Logo
 GNB
 Search Icon
 이동 경로:
 Products → 선택한 메뉴 또는 관련 페이지
Products Hero
 목적: 국순당의 다양한 전통주 제품을 강렬한 비주얼로 소개합니다.
 주요 행동:
 Hero 콘텐츠 확인
 아래 제품 탐색 영역으로 스크롤
 필요한 정보:
KOREAN TRADITIONAL HERBAL RICE WINE
 대표 제품 이미지
 제품 및 액체 Splash 그래픽
 이동 경로:
 Header → Taste / Experience Filter
Taste / Experience Filter
 목적: 사용자의 막걸리 경험 수준을 기반으로 제품 탐색을 시작하도록 합니다.
 주요 행동:
 사용자 경험 수준 선택
 선택 상태 확인
 필요한 정보:
What are you craving today?
 Experience Level
 선택 상태 UI
 이동 경로:
 Hero → Product Showcase
Product Showcase
 목적: 국순당 제품을 카테고리별로 탐색하고 각 제품의 특징을 빠르게 확인하도록 합니다.
 주요 행동:
 제품 카테고리 선택
 제품 카드 탐색
 View All 선택
 필요한 정보:
MEET YOUR NEW FAVORITE
 Product Category
 Product Image
 Product Name
 Taste Keyword
 이동 경로:
 Filter → Product → Starter Kit
Beginner's Starter Kit
 목적: 막걸리를 처음 접하는 사용자의 제품 선택을 돕습니다.
 주요 행동:
 추천 제품 확인
VIEW DETAILS 선택
 필요한 정보:
 Starter Kit Title
 Starter Kit Description
 추천 제품 이미지 및 제품명
 BEST 표시
 View Details CTA
 이동 경로:
 Product Showcase → Product Detail 또는 다음 콘텐츠
Brand Keyword Section
 목적: 제품 탐색 후 국순당의 브랜드 및 주요 제품 키워드를 반복적으로 노출하여 브랜드 이미지를 강화합니다.
 주요 행동:
 콘텐츠 확인
 Footer로 스크롤
 필요한 정보:
 Kooksoondang
 Probiotics
 Original Makgeolli
 Since 1970
 Makgeolli
 Bekseju
 Yedam
PDF 하단에서도 해당 브랜드·제품 키워드가 반복적으로 노출됩니다.
 이동 경로:
 Starter Kit → Footer
Footer
 목적: 회사 정보 및 공통 사이트 정보를 제공합니다.
 주요 행동:
 Privacy Policy
 Terms of Use
 About Us
 Customer Support
 Directions
 SNS
 Family Site
 필요한 정보:
 회사 정보
 주소 및 연락처
 Copyright
 Footer Navigation
 SNS Icon
 이동 경로:
 Products 페이지 하단 → 관련 페이지
9. 사용자 흐름
 사용자가 Products 페이지에 진입하여 Hero에서 국순당의 대표 제품과 브랜드 비주얼을 확인합니다.
 사용자가 What are you craving today? 영역에서 자신의 막걸리 경험 수준 또는 탐색 기준을 선택합니다.
 화면이 선택된 상태를 표시하고 사용자가 제품 탐색 영역으로 이동합니다.
 사용자가 Makgeolli, Bekseju 등 원하는 제품 카테고리를 선택합니다.
 화면이 해당 카테고리의 제품 이미지, 제품명 및 Taste Keyword를 보여줍니다.
 사용자가 관심 있는 제품을 탐색하거나 VIEW ALL을 통해 더 많은 제품을 확인합니다.
 막걸리 입문자는 Beginner's Starter Kit에서 추천 제품을 확인합니다.
 사용자가 VIEW DETAILS를 선택하여 관련 제품 정보를 추가로 탐색합니다.
 페이지 하단에서 브랜드 키워드와 Footer 정보를 확인하고 다른 페이지 또는 SNS로 이동합니다.
10. 화면 상태
기본 상태: Hero와 전체 Products 콘텐츠가 기본 상태로 표시됩니다.
선택 상태: 선택된 경험 수준 및 제품 카테고리에 is_active 스타일을 적용합니다.
Hover 상태: 제품 카드 및 CTA에 시각적 피드백을 제공합니다.
Focus 상태: 키보드 사용자가 현재 선택된 버튼과 링크를 확인할 수 있도록 합니다.
빈 상태: 선택한 조건에 해당하는 제품이 없는 경우 다른 조건 선택을 안내합니다.
오류 상태: 제품 정보를 표시할 수 없는 경우 기본 안내 메시지를 제공합니다.
Reduced Motion: 모션 감소 설정 시 제품 등장 및 전환 애니메이션을 최소화합니다.
11. 데이터와 저장
 데이터 출처:
 국순당 공식 제품 정보
 제공된 디자인/PDF
 프로젝트 assets
 제품 데이터:
 제품명
 제품 카테고리
 제품 이미지
 Taste Keyword
 Experience Level
 브라우저 저장:
 필수 저장 데이터 없음
 저장하지 않는 정보:
 개인정보
 결제 정보
 회원 정보
12. 개발 조건
 HTML, CSS, JavaScript로 구현합니다.
 React, Vue, TypeScript, Tailwind를 추가하지 않습니다.
 기존 프로젝트 폴더 구조와 공통 스타일을 유지합니다.
 기존 assets의 제품 이미지를 우선 사용합니다.
 디자인에 없는 제품이나 기능을 임의로 추가하지 않습니다.
 별도의 라이브러리가 필요하지 않은 필터 및 카테고리 기능은 기본 JavaScript로 구현합니다.
13. 명명 규칙
 CSS class와 HTML id는 snake_case를 사용합니다.
 상태 class는 is_active, is_selected, is_open 형식을 사용합니다.
 오류 상태는 has_error를 사용합니다.
 JavaScript 변수와 함수는 camelCase를 사용합니다.
 불리언 값은 is, has, can, should로 시작합니다.
 이벤트 함수는 handleXxx 형식을 사용합니다.
예:
product_cardproduct_filterexperience_filterstarter_kitis_active
14. 반응형 기준
 최소: 360px
 Tablet: 768px
 Desktop: 1280px
 Large Desktop: 1920px
 최대: 3840px
제품 카드 그리드는 화면 크기에 맞게 열 수를 조정하고, 모바일에서는 제품 이미지와 텍스트가 잘리거나 겹치지 않도록 구성합니다.
15. 접근성
 카테고리 및 필터 선택에는 button 요소를 사용합니다.
 페이지 이동에는 a 요소를 사용합니다.
 제품 이미지에는 제품명을 설명하는 alt를 제공합니다.
 선택된 필터는 색상 외에도 텍스트 또는 상태 속성으로 구분합니다.
 키보드만으로 필터, 제품 카드 및 CTA를 탐색할 수 있어야 합니다.
focus-visible 상태를 제공합니다.
 적절한 heading 계층을 유지합니다.
prefers-reduced-motion 설정을 반영합니다.
16. 인터랙션 라이브러리
 제품 카테고리 필터링은 기본 JavaScript로 구현합니다.
 제품 카드 Hover 효과는 CSS를 우선 사용합니다.
 단순한 등장 및 전환 효과에는 별도의 라이브러리를 사용하지 않습니다.
 복잡한 스크롤 모션이 디자인에 존재할 경우에만 GSAP / ScrollTrigger 사용을 검토합니다.
 실제 슬라이더가 구현될 경우에만 Swiper를 사용합니다.
17. 검증 방법
product.pdf와 실제 브라우저 화면을 나란히 비교합니다.
 Hero → Filter → Product → Starter Kit → Footer의 콘텐츠 순서를 확인합니다.
 제품 카테고리 선택 시 올바른 제품이 표시되는지 확인합니다.
 Experience Level 선택 상태가 정상적으로 표시되는지 확인합니다.
 모든 제품명과 이미지가 올바르게 매칭되는지 확인합니다.
VIEW ALL, VIEW DETAILS 및 GNB 링크를 실제로 조작합니다.
 360px, 768px, 1280px, 1920px에서 레이아웃을 확인합니다.
 키보드 Tab 이동 및 focus-visible을 확인합니다.
 가로 스크롤, 이미지 잘림, UI 겹침 및 콘솔 오류를 확인합니다.
18. 완료 조건
 Products 페이지가 PDF의 Hero → Experience/Taste Filter → Product Showcase → Beginner's Starter Kit → Brand Keyword → Footer 계층을 따릅니다.
 Header의 메뉴가 승인된 페이지 또는 섹션으로 정상 이동합니다.
 Hero에 PDF에서 확인되는 제품 중심의 브랜드 비주얼과 타이틀이 구현됩니다.
 제품 영역에 승인된 제품 이미지, 제품명 및 Taste Keyword가 표시됩니다.
 제품 카테고리를 선택하면 선택 상태가 명확하게 표시됩니다.
 Experience Level UI를 사용자가 조작할 수 있습니다.
 PDF에서 확인되는 대표 Makgeolli 제품들이 제품 영역에 올바르게 표시됩니다.
 Beginner's Starter Kit에 Strawberry, Banana, White Grape Makgeolli가 표시됩니다.
VIEW ALL과 VIEW DETAILS CTA가 승인된 동작을 수행합니다.
 제품 카드와 필터는 마우스 및 키보드 환경에서 조작할 수 있습니다.
 360px, 768px, 1280px, 1920px에서 overflow, 이미지 잘림, UI 겹침 및 포커스 순서를 검증합니다.
 콘솔 오류 및 불필요한 console.log가 남아 있지 않습니다.