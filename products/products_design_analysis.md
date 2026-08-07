[kooksoondang] Products 디자인 분석표
확인한 자료
 디자인 원본: Figma 디자인 파일
 확인한 화면: PRODUCTS
 실제 에셋 위치: products_asset
 참고 시안: product.pdf
화면 목록
화면목적주요 행동필요한 상태PRODUCTS국순당 제품 탐색 및 제품 특징 확인필터 선택, 카테고리 선택, 제품 탐색, CTA 클릭기본, hover, selected, focus
구현 범위
포함
 Products Hero
 Taste / Experience Filter
 Product Category
 Product Showcase
 Product Cards
 View All
 Beginner's Starter Kit
 Brand Keyword Section
제외
 Header / GNB
 Search
 Footer
 Family Site
 Footer SNS
디자인 토큰
 배경색: makgeolli_light4, makgeolli_W
 주요 본문색: bekseju_darker_cold
 강조색: kooksoondang_orange
 제목 폰트: Albert Sans, Pretendard, ROH HOE-CHAN
 본문 폰트: Albert Sans, Pretendard
 기본 간격: 12px
 라운드: 8px ~ 10px
 그림자: 시안에서 별도 확인되지 않음
반응형
360px: 최소 모바일 대응
768px: 태블릿 대응
1280px: 기본 데스크톱 검수
1920px: 디자인 기준 데스크톱
 최대 폭: 3840px
제품 카드의 열 개수는 화면 크기에 따라 변경하며, 모바일에서 제품 이미지·텍스트가 잘리거나 겹치지 않도록 구성합니다.
인터랙션
Experience / Taste Filter
 경험 수준 선택
 선택된 옵션에 is_active 상태 제공
Product Category
 제품군 선택
 선택 상태 표시
 선택한 카테고리에 해당하는 제품 노출
Product Card
 hover
 focus
 클릭 가능한 경우 해당 상세 콘텐츠로 이동
CTA
VIEW ALL
VIEW DETAILS
PDF에서 정확한 목적지가 확인되지 않는 경우 임의 페이지를 생성하지 않습니다.
에셋
 제품 이미지: products_asset/img
 로고: 기존 프로젝트 에셋 사용
 아이콘: products_asset/icon
 폰트: WebFont
확인된 사실
 Products 페이지는 국순당의 다양한 전통주 제품을 해외 사용자가 탐색하도록 구성되어 있습니다.
 상단 Hero에는 제품 이미지와 KOREAN TRADITIONAL HERBAL RICE WINE 문구가 배치되어 있습니다.
 Hero 아래에는 What are you craving today? 제품 탐색 영역이 존재합니다.
 제품 영역에는 MEET YOUR NEW FAVORITE 타이틀과 카테고리 UI가 제공됩니다.
 제품은 카드 형태로 배치되며 제품 이미지, 제품명, 간단한 Taste Keyword가 함께 표시됩니다.
 Makgeolli 외에도 Bekseju, Yedam/Charyeju, Soju 등의 카테고리가 시안에 존재합니다.
 Draft Makgeolli, Rice Makgeolli, 100 Billion Prebiotics, Strawberry, Banana, Peach, Chestnut, White Grape Makgeolli가 제품 영역에 노출됩니다.
 하단에는 막걸리 입문자를 위한 BEGINNER'S STARTER KIT 영역이 존재합니다.
 Starter Kit에는 Strawberry, Banana, White Grape Makgeolli가 강조되어 있습니다.
 제품 페이지 전체는 따뜻한 오프화이트 계열 배경과 제품별 컬러 그래픽을 활용합니다.
 제품 카드 및 Starter Kit는 막걸리 초보자도 제품 차이를 쉽게 이해하도록 시각적인 구성을 사용합니다.
아직 확인하지 못한 내용
What are you craving today? UI의 정확한 필터링 로직
 각 Experience Level의 실제 필터 기준
VIEW ALL의 정확한 이동 목적지
VIEW DETAILS의 정확한 이동 목적지
 각 제품 카드 클릭 여부 및 상세 페이지 연결 방식
 카테고리 변경 시 애니메이션 여부
 제품 데이터의 실제 저장·관리 방식
 접근성 세부 기준
 CMS 및 관리자 연동 여부
 Products 페이지별 KPI 및 사용성 검증 결과
그리고 클로드에 전달할 때는 이 분석표 맨 위에 한 줄 더 추가하는 걸 추천해.
중요: Header와 Footer는 기존 구현을 그대로 유지하며, 이 분석표는 <main> 내부 Products 콘텐츠에만 적용한다. Header/Footer 관련 파일 및 스타일은 수정하지 않는다.