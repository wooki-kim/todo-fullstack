# Todo API Server

Vue Todo 앱과 연동하는 NestJS 기반 REST API 서버입니다.

## 📋 API 스펙

### Todo 모델
```typescript
{
  id: string;          // UUID
  text: string;        // 할 일 내용 (최대 500자)
  completed: boolean;  // 완료 상태
  priority: 'high' | 'medium' | 'low';  // 우선순위
  createdAt: Date;     // 생성일시
  updatedAt: Date;     // 수정일시
}
```

### API 엔드포인트

#### 📚 Todo CRUD
- `GET /todos` - 할 일 목록 조회
  - Query: `filter=all|active|completed` (옵션)
- `GET /todos/:id` - 특정 할 일 조회
- `POST /todos` - 새 할 일 생성
  - Body: `{ text: string, priority?: 'high'|'medium'|'low' }`
- `PATCH /todos/:id` - 할 일 수정
  - Body: `{ text?: string, completed?: boolean, priority?: string }`
- `DELETE /todos/:id` - 할 일 삭제

#### 📊 통계 및 일괄 작업
- `GET /todos/stats` - 통계 정보 조회
  - Response: `{ total: number, completed: number, active: number }`
- `PATCH /todos` - 모든 할 일 완료/미완료 토글
- `DELETE /todos?type=completed` - 완료된 할 일 삭제
- `DELETE /todos?type=all` - 모든 할 일 삭제

## 🚀 실행 방법

### 1. 의존성 설치
```bash
cd todo-api
npm install
```

### 2. 데이터베이스 설정
MySQL 데이터베이스를 설정하고 `.env` 파일을 수정하세요:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=todo_db
```

### 3. 서버 실행
```bash
# 개발 모드
npm run start:dev

# 프로덕션 모드
npm run start:prod
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 🔧 주요 기능

- **TypeORM**: MySQL 데이터베이스 연결
- **Validation**: DTO 기반 입력 검증
- **CORS**: Vue 앱과의 통신 지원
- **UUID**: 고유 ID 생성
- **Auto Migration**: 개발 환경에서 자동 스키마 동기화

## 📁 프로젝트 구조

```
src/
├── controllers/     # API 컨트롤러
├── services/        # 비즈니스 로직
├── entities/        # TypeORM 엔티티
├── dto/            # 데이터 전송 객체
├── modules/        # NestJS 모듈
├── app.module.ts   # 루트 모듈
└── main.ts         # 애플리케이션 진입점
```