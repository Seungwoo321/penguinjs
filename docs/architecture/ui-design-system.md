# PenguinJS UI/UX 디자인 시스템 설계서

## 1. 개요

### 목적
JavaScript 학습 게임 플랫폼을 위한 일관된 사용자 경험과 시각적 아이덴티티 제공

### 설계 원칙
- **직관성**: 복잡한 개념을 쉽게 이해할 수 있는 UI
- **일관성**: 모든 게임에서 통일된 인터페이스
- **접근성**: 다양한 사용자와 기기 환경 지원
- **몰입감**: 게임적 재미를 극대화하는 인터랙션

---

## 2. 브랜드 아이덴티티

### 브랜드 컨셉
- **Cool Code, Warm Learning**: 펭귄처럼 차분하고 끈기있게
- **Developer Friendly**: 개발자들에게 친숙한 느낌
- **Modern & Clean**: 깔끔하고 현대적인 디자인

### 브랜드 키워드
- Calm, Persistent, Interactive, Accessible, Modern

---

## 3. 컬러 시스템

### PenguinJS 브랜드 컬러 팔레트

#### Penguin Colors (50-900)
펭귄의 차가운 블루-그레이 색상을 기반으로 한 10단계 팔레트
- **penguin-50**: #f6f9fc (가장 밝은 배경)
- **penguin-100**: #edf3f8 (보조 배경)
- **penguin-200**: #d6e6f0 (테두리, 구분선)
- **penguin-300**: #9eb9c7 (펭귄 몸통 색상)
- **penguin-400**: #7ba3b5
- **penguin-500**: #5a8ca3
- **penguin-600**: #4a7691 (Primary 색상)
- **penguin-700**: #3e6280 (Primary Hover)
- **penguin-800**: #2d3e50 (펭귄 머리 색상)
- **penguin-900**: #1b2a3a (가장 진한 텍스트)

#### Semantic Colors
- **Success**: #10b981 - 정답, 완료, 성취
- **Warning**: #f59e0b - 주의, 힌트, 중간 단계  
- **Error**: #ef4444 - 오답, 에러, 실패
- **Info**: #3b82f6 - 정보, 가이드, 설명

#### 의미론적 색상 변수
- **surface-primary**: 메인 배경 (penguin-50)
- **surface-secondary**: 보조 배경 (penguin-100)
- **surface-elevated**: 카드/패널 (흰색)
- **text-primary**: 주요 텍스트 (penguin-900)
- **text-secondary**: 보조 텍스트 (penguin-800)
- **text-tertiary**: 3차 텍스트 (penguin-700)
- **border**: 테두리 (penguin-200)

### 테마별 컬러 시스템

#### Light Mode
- 밝고 깔끔한 배경
- 높은 명도 대비
- 눈의 피로를 줄이는 부드러운 톤

#### Dark Mode
- 어두운 배경으로 집중력 향상
- 화면 발광 최소화
- 코딩 환경과 유사한 느낌

#### Game-Specific Themes
각 게임별 고유 컬러 테마 적용
- Closure Cave: 펭귄 블루 계열 활용
- CallStack Library: 펭귄 블루 계열 활용
- Promise Battle: 개발 예정

---

## 4. 타이포그래피

### 폰트 체계

#### 주요 폰트 패밀리
- **Interface Font**: Inter (UI 전반)
- **Code Font**: System Monospace (코드 에디터)
- **Fallback**: 시스템 기본 폰트

#### 타이포그래피 스케일
- **Heading 1**: 게임 제목, 메인 타이틀
- **Heading 2**: 섹션 제목
- **Heading 3**: 서브섹션 제목  
- **Heading 4**: 카드 제목
- **Body Large**: 중요한 본문
- **Body**: 일반 본문
- **Body Small**: 부가 정보
- **Caption**: 설명 텍스트
- **Code**: 코드 블록

### 텍스트 스타일 가이드

#### 가독성 최적화
- 충분한 행간 (line-height 1.5-1.6)
- 적절한 자간 (letter-spacing)
- 최적의 줄 길이 (45-75자)

#### 계층 구조
- 크기, 굵기, 색상으로 정보 위계 표현
- 스캔 가능한 텍스트 레이아웃
- 중요 정보 강조 전략

---

## 5. 아이콘 시스템

### 아이콘 스타일
- **선 굵기**: 1.5px (일관된 스트로크)
- **모서리**: 둥근 모서리 (친근한 느낌)
- **크기**: 16px, 20px, 24px, 32px
- **스타일**: Outline 기본, Filled 강조용

### 아이콘 카테고리

#### Navigation Icons
- 홈, 뒤로가기, 메뉴, 검색
- 게임 선택, 스테이지 이동

#### Game Icons
- 각 게임별 고유 아이콘
- 게임 상태 표시 (완료, 진행중, 잠금)
- 난이도 표시

#### Action Icons
- 플레이, 일시정지, 정지
- 힌트, 재시작, 다음
- 설정, 공유, 즐겨찾기

#### Status Icons
- 성공, 실패, 경고
- 로딩, 완료, 에러
- 점수, 시간, 진행도

#### Interface Icons
- 코드 편집 (복사, 붙여넣기, 실행)
- 테마 전환 (라이트/다크)
- 접근성 (확대, 고대비)

---

## 6. 레이아웃 시스템

### 그리드 시스템
- **컨테이너**: 최대 너비 1280px
- **컬럼**: 12컬럼 그리드
- **거터**: 24px (데스크톱), 16px (모바일)
- **마진**: 좌우 24px (데스크톱), 16px (모바일)

### 반응형 브레이크포인트
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### 스페이싱 시스템
- **기본 단위**: 4px
- **스페이싱 스케일**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px
- **섹션 간격**: 64px (데스크톱), 48px (모바일)

---

## 7. 컴포넌트 시스템

### 기본 컴포넌트

#### Button Components
- **Primary Button**: 주요 액션 (게임 시작, 제출)
- **Secondary Button**: 보조 액션 (취소, 뒤로가기)
- **Ghost Button**: 미니멀한 액션 (설정, 정보)
- **Icon Button**: 아이콘만 있는 버튼
- **Floating Action Button**: 고정 위치 액션

#### Input Components  
- **Text Input**: 일반 텍스트 입력
- **Code Input**: 코드 입력 (하이라이팅 포함)
- **Select**: 드롭다운 선택
- **Checkbox**: 체크박스
- **Radio**: 라디오 버튼
- **Switch**: 토글 스위치

#### Display Components
- **Card**: 정보 카드 (게임, 스테이지)
- **Badge**: 상태 표시 (완료, 신규, 레벨)
- **Tag**: 분류 표시 (난이도, 카테고리)
- **Avatar**: 사용자 프로필
- **Progress Bar**: 진행도 표시

#### Navigation Components
- **Header**: 상단 네비게이션
- **Sidebar**: 사이드 메뉴
- **Breadcrumb**: 경로 표시
- **Pagination**: 페이지 네비게이션
- **Tab**: 탭 네비게이션

#### Feedback Components
- **Alert**: 알림 메시지
- **Toast**: 임시 알림
- **Modal**: 모달 대화상자
- **Tooltip**: 도움말 팝업
- **Loading**: 로딩 인디케이터

### 게임 전용 컴포넌트

#### Game Layout Components
- **Game Container**: 게임 전체 레이아웃
- **Game Header**: 게임 상단 정보
- **Game Controls**: 게임 조작 버튼
- **Game Visualizer**: 게임 시각화 영역
- **Game Sidebar**: 게임 사이드 정보

#### Learning Components
- **Code Editor**: 코드 입력 에디터
- **Code Output**: 코드 실행 결과
- **Hint Panel**: 힌트 표시 패널
- **Progress Tracker**: 학습 진행도
- **Achievement Badge**: 성취 배지

#### Interactive Components
- **Drag Drop Zone**: 드래그 앤 드롭 영역
- **Canvas Playground**: 인터랙티브 캔버스
- **Animation Container**: 애니메이션 컨테이너
- **Step Indicator**: 단계 표시기
- **Score Display**: 점수 표시

---

## 8. 애니메이션 및 인터랙션

### 애니메이션 원칙

#### Motion Design Principles
- **자연스러운 움직임**: 물리 법칙을 따르는 애니메이션
- **목적이 있는 움직임**: 사용자 이해를 돕는 애니메이션
- **적절한 속도**: 너무 빠르거나 느리지 않은 타이밍

#### Animation Curves
- **Ease In**: 시작이 느린 가속 (진입 애니메이션)
- **Ease Out**: 끝이 느린 감속 (종료 애니메이션)
- **Ease In Out**: 양쪽이 부드러운 곡선 (일반 애니메이션)
- **Spring**: 탄성 있는 움직임 (인터랙티브 요소)

### 애니메이션 유형

#### Micro Interactions
- **Hover Effects**: 마우스 호버 시 반응
- **Click Feedback**: 클릭 시 시각적 피드백
- **Focus States**: 포커스 시 강조 효과
- **Loading States**: 로딩 중 상태 표시

#### Transitions
- **Page Transitions**: 페이지 간 전환
- **Modal Animations**: 모달 등장/사라짐
- **Drawer Animations**: 사이드바 슬라이드
- **Tab Transitions**: 탭 전환 효과

#### Game Animations
- **Success Celebrations**: 성공 시 축하 애니메이션
- **Error Feedback**: 실패 시 피드백 애니메이션
- **Progress Animations**: 진행도 증가 애니메이션
- **Level Completion**: 레벨 완료 애니메이션

### 성능 고려사항

#### 최적화 전략
- **GPU 가속**: transform, opacity 속성 우선 사용
- **프레임 레이트**: 60fps 유지
- **애니메이션 지속시간**: 200-500ms 권장
- **reduce-motion**: 접근성 고려한 모션 감소 옵션

---

## 9. 접근성 디자인

### 접근성 원칙

#### WCAG 2.1 AA 준수
- **인식 가능**: 모든 사용자가 정보를 인식할 수 있음
- **운용 가능**: 모든 사용자가 인터페이스를 조작할 수 있음
- **이해 가능**: 정보와 UI 조작이 이해 가능함
- **견고함**: 다양한 보조 기술과 호환

#### 시각적 접근성
- **색상 대비**: 4.5:1 이상 (일반 텍스트), 3:1 이상 (큰 텍스트)
- **색상에 의존하지 않는 정보 전달**: 모양, 패턴 등 추가 단서
- **충분한 터치 타겟**: 최소 44px × 44px
- **명확한 포커스 표시**: 키보드 네비게이션 지원

#### 인지적 접근성
- **명확한 라벨**: 모든 인터페이스 요소에 설명적 라벨
- **예측 가능한 동작**: 일관된 인터랙션 패턴
- **에러 방지**: 명확한 안내와 확인 절차
- **도움말 제공**: 필요시 쉽게 접근 가능한 도움말

---

## 10. 다국어 지원 디자인

### 국제화 고려사항

#### 텍스트 확장성
- **텍스트 길이 변화**: 언어별 20-30% 텍스트 길이 차이 고려
- **유연한 레이아웃**: 텍스트 확장에 대응하는 유연한 디자인
- **폰트 호환성**: 다양한 언어 문자 지원

#### 문화적 적응성
- **색상 의미**: 문화별 색상 인식 차이 고려
- **읽기 방향**: LTR/RTL 텍스트 방향 지원
- **현지화**: 지역별 선호도와 관습 반영

---

## 11. 모바일 최적화

### 모바일 UX 원칙

#### 터치 인터페이스
- **충분한 터치 영역**: 최소 44px 권장
- **제스처 지원**: 스와이프, 핀치, 탭 등
- **햅틱 피드백**: 중요한 액션에 진동 피드백

#### 화면 크기 적응
- **우선순위 기반 정보 배치**: 중요한 정보 우선 표시
- **접기/펼치기 인터페이스**: 공간 효율적 활용
- **상하 스크롤 최적화**: 자연스러운 세로 스크롤

---

## 12. 게임별 특화 디자인

### 게임 유형별 UI 패턴

#### Code-Writing Games (Closure Cave, Event Target)
- **코드 에디터 중심 레이아웃**
- **실시간 피드백 표시**
- **단계별 가이드 제공**

#### Simulation Games (CallStack Library, Async Airways)
- **시각화 중심 레이아웃**
- **애니메이션 중심 인터랙션**
- **단계별 실행 컨트롤**

#### Card/Battle Games (Promise Battle)
- **카드 중심 인터페이스**
- **드래그 앤 드롭 인터랙션**
- **실시간 대전 피드백**

#### Puzzle Games (Prototype Chain, Destructuring Circus)
- **퍼즐 중심 레이아웃**
- **조각 연결 인터랙션**
- **완성도 시각화**

---

## 13. 디자인 토큰

### 토큰 시스템 구조

#### Primitive Tokens
- 기본 색상값, 크기값, 폰트값
- 디자인 시스템의 가장 기본 단위

#### Semantic Tokens  
- Primary, Secondary, Success 등 의미적 토큰
- 컴포넌트에서 직접 참조하는 토큰

#### Component Tokens
- 특정 컴포넌트에 특화된 토큰
- 컴포넌트별 변형 관리

### 토큰 카테고리

#### Color Tokens
- Brand Colors, Semantic Colors, Neutral Colors
- 라이트/다크 모드 변형

#### Typography Tokens
- Font Family, Font Size, Line Height, Letter Spacing
- 텍스트 스타일 조합

#### Spacing Tokens
- Margin, Padding, Gap
- 레이아웃 스페이싱

#### Border Tokens
- Border Width, Border Radius, Border Color
- 컴포넌트 경계선

#### Shadow Tokens
- Box Shadow, Drop Shadow
- 깊이감 표현

---

## 14. 스타일 가이드 적용

### 개발팀 가이드라인

#### 컴포넌트 사용 규칙
- 디자인 시스템 컴포넌트 우선 사용
- 커스텀 스타일 최소화
- 일관성 있는 속성명 사용

#### 품질 관리
- 디자인 리뷰 프로세스
- 접근성 체크리스트
- 다국어 테스트

### 유지보수 전략

#### 버전 관리
- 디자인 시스템 버전 관리
- 브레이킹 체인지 문서화
- 마이그레이션 가이드 제공

#### 지속적 개선
- 사용자 피드백 수집
- 사용성 테스트 결과 반영
- 새로운 패턴 발굴 및 적용