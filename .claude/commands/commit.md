# /commit

staged된 변경사항을 분석해서 커밋 메시지를 생성하고 커밋한다.

## Step 1: 변경사항 파악

다음을 실행해서 변경사항을 파악한다:
- `git diff --staged` — staged 변경사항
- `git log --oneline -5` — 최근 커밋 스타일 참고
- staged가 없으면 `git diff`도 확인

staged 파일이 없으면 사용자에게 "staged 파일이 없습니다. git add 먼저 해주세요." 출력하고 중단.

## Step 2: 커밋 메시지 작성

아래 규칙에 맞는 커밋 메시지를 작성한다.

### 타입 선택

| 타입 | 사용 시점 |
|------|-----------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `chore` | 빌드, 설정, 패키지 변경 |
| `docs` | 문서만 변경 |
| `test` | 테스트 추가/수정 |
| `style` | 포맷, 공백 등 스타일만 변경 |

### 형식

```
타입(범위): 제목

- 변경 내용 상세 1 (필요시)
- 변경 내용 상세 2 (필요시)
```

- 제목: 한국어, 50자 이내, 명사형 또는 동사 원형으로 종결
- 범위(scope): 변경된 주요 파일/기능명 (생략 가능)
- 본문: 제목만으로 설명이 부족할 때만 추가

### 금지사항

- 영어 커밋 금지
- "Claude가 작성", "AI가 생성" 등 AI attribution 문구 금지
- "Co-Authored-By: Claude" 금지
- 제목에 마침표 금지

## Step 3: 커밋 실행

작성한 메시지로 `git commit`을 실행한다.

메시지 예시:
```
feat(swap): Uniswap v3 토큰 스왑 기능 구현

- useSwapQuote: Quoter V2로 예상 수량 계산
- useSwapExecute: Router exactInputSingle 트랜잭션
- 슬리피지 0.5% 기본값, 0.1-5% 사용자 조정
```
