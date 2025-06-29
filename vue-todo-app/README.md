# Vue 3 Todo List

Vue 3 Composition API를 사용한 현대적인 Todo List 애플리케이션입니다.

## 주요 기능

- ✅ 할 일 추가, 수정, 삭제
- ✅ 완료 상태 토글
- ✅ 필터링 (전체, 진행중, 완료)
- ✅ 일괄 완료/해제
- ✅ 완료된 항목 일괄 삭제
- ✅ 로컬스토리지 자동 저장
- ✅ 반응형 디자인
- ✅ TypeScript 지원
- ✅ 완전한 테스트 커버리지

## 기술 스택

- **Vue 3** - Composition API
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 개발 서버
- **Vitest** - 단위 테스트
- **Vue Test Utils** - 컴포넌트 테스트

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트 실행
npm run test:unit

# 타입 검사
npm run type-check
```

## 배포

### Netlify 배포
1. 레포지토리를 Netlify에 연결
2. Build command: `npm run build`
3. Publish directory: `dist`

### Vercel 배포
1. 레포지토리를 Vercel에 연결
2. Framework Preset: Vue.js
3. 자동으로 배포 설정이 적용됩니다

## 프로젝트 구조

```
src/
├── components/          # Vue 컴포넌트
│   ├── TodoApp.vue     # 메인 앱 컴포넌트
│   ├── TodoInput.vue   # 할 일 입력 컴포넌트
│   ├── TodoList.vue    # 할 일 목록 컴포넌트
│   ├── TodoItem.vue    # 개별 할 일 컴포넌트
│   ├── TodoFooter.vue  # 필터 및 액션 버튼
│   └── __tests__/      # 컴포넌트 테스트
├── composables/        # 재사용 가능한 로직
│   ├── useTodos.ts     # 할 일 관리 로직
│   └── __tests__/      # Composable 테스트
├── types/              # TypeScript 타입 정의
│   └── Todo.ts         # Todo 관련 타입
└── App.vue             # 루트 컴포넌트
```

## 주요 특징

### Vue 3 Composition API
최신 Vue 3의 Composition API를 활용하여 로직을 재사용 가능한 composable로 구성했습니다.

### TypeScript 지원
완전한 타입 안전성을 제공하며, 개발 시 더 나은 IDE 지원을 받을 수 있습니다.

### 테스트 커버리지
모든 주요 기능에 대한 단위 테스트와 컴포넌트 테스트를 포함합니다.

### 반응형 디자인
모바일과 데스크톱 환경 모두에서 최적화된 사용자 경험을 제공합니다.

