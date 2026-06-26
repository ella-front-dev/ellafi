# Claude Code 활용법

## Claude Code가 뭔가

터미널에서 실행하는 AI 코딩 어시스턴트. ChatGPT에 코드 붙여넣는 것과 근본적으로 다름.

| ChatGPT/일반 AI         | Claude Code                        |
|-------------------------|------------------------------------|
| 코드를 복사해서 보여줌   | 실제 파일을 직접 읽고 수정          |
| 대화가 끝나면 컨텍스트 사라짐 | `.claude/` 설정으로 컨텍스트 유지 |
| 매번 같은 설명 반복해야 함 | rules 파일이 항상 로드됨           |
| 코드 작성만              | 파일 수정 + 명령 실행 + PR 생성     |

---

## 핵심 개념 3가지

### 1. CLAUDE.md — 프로젝트 상시 컨텍스트

루트의 `CLAUDE.md`는 **매 대화마다 자동으로 Claude에게 주입**된다.  
"이 프로젝트는 Next.js 15, wagmi v2 씁니다. TypeScript strict입니다. pnpm 씁니다." — 매번 설명 안 해도 됨.

```
CLAUDE.md에 들어가야 할 것
├── 기술 스택 (버전 포함)
├── 프로젝트 구조 (파일 규칙, 폴더 구조)
├── 코딩 컨벤션 (금지 패턴 포함)
├── 현재 진행 상황 (Phase, 완료/미완료)
└── 명령어 (pnpm dev, pnpm test 등)
```

### 2. `.claude/commands/` — 슬래시 커맨드

`.claude/commands/` 안의 `.md` 파일 하나가 `/커맨드명` 하나.

```
.claude/commands/commit.md  →  /commit
.claude/commands/pr.md      →  /pr
```

커맨드 파일 안에는 **Claude에게 줄 프롬프트**를 쓴다.  
"이 커맨드가 실행되면 이렇게 행동해라"를 명시하는 것.

```markdown
<!-- commit.md -->
# /commit

git diff를 분석하고 아래 규칙에 맞는 커밋 메시지를 작성해라:
- 타입: feat/fix/refactor/chore/docs
- 한국어로
- 50자 이내
...
```

실행: 터미널에서 `/commit` 입력 → Claude가 diff 보고 커밋 자동 생성.

### 3. `.claude/rules/` — 행동 규칙 문서

Claude가 코드 작성할 때 항상 따라야 할 규칙들.  
`coding-convention.md`, `testing-guide.md` 같은 파일로 쪼갬.

CLAUDE.md에서 참조(`rules/` 참조)하거나, 커맨드 파일에서 인용하는 방식으로 연결.

---

## 실제로 어떻게 쓰냐 — Ellafi 예시

### 시나리오 1: 기능 개발

```
1. feat/ 브랜치 생성
2. "useTokenPrices 훅 만들어줘, CoinGecko API 써서" → Claude가 구현
3. Claude가 rules/testing-guide.md 보면서 테스트 자동 작성
4. /commit → Claude가 diff 분석 → 컨벤션 맞는 커밋 생성
5. /pr → Claude가 구현 내용 파악 → 구조화된 PR description 작성
```

사람이 한 것: 요구사항 말하기 + 결과 검토

### 시나리오 2: 코드 리뷰

```
/review-task src/hooks/use-token-prices.ts
```

Claude가:
1. 파일 읽기
2. naming, TypeScript, 레이어 의존성, DRY 등 13개 항목 체크
3. Critical/Major/Minor 분류해서 이슈 draft 생성

### 시나리오 3: 대형 도구 제작 (DSP figma-validate 사례)

```
사람: "Figma 디자인과 실제 DOM이 얼마나 다른지 
       자동으로 검증하는 스크립트 만들어줘"

Claude: scripts/figma-validate/ 전체 구현
        - Phase 1: pixel diff
        - Phase 2: color token 비교
        - Phase 3: typography 비교
        - Phase 4: layout 비교
        - CLI: pnpm figma:validate / figma:batch / figma:issue-draft

사람: pnpm figma:batch 실행

Claude: 결과 집계 → 이슈 #385 자동 생성 → PR description 작성
```

**사람이 한 것: 문제 정의 + 결과 검토.**  
도구 설계, 구현, 검증, 문서화 — 전부 Claude.

---

## Claude Code가 일반 AI와 다른 핵심

### 파일 시스템 접근

```
일반 AI: "이렇게 코드 수정하세요" (복붙해야 함)
Claude Code: 파일을 직접 열고 수정하고 저장
```

### 명령 실행

```
Claude Code: pnpm lint, pnpm test, git diff 직접 실행
→ "lint 에러 없애줘" → Claude가 실행하고 에러 보고 직접 고침
```

### 컨텍스트 지속성

```
CLAUDE.md + .claude/rules/ + .claude/commands/
→ 매 대화마다 이 컨텍스트가 자동 로드됨
→ "이 프로젝트는 wagmi 씁니다" 반복 설명 불필요
```

### Multi-agent (고급)

```
Agent(subagent_type="Explore", model="haiku")  ← 빠른 탐색용 작은 모델
Agent(subagent_type="code-reviewer")           ← 리뷰 전문 에이전트
```

큰 작업을 여러 에이전트가 병렬로 처리.  
`review-task.md` 참조: 탐색 → 리뷰 → 이슈 생성 파이프라인.

---

## `.claude/` 디렉토리 구조

```
.claude/
  settings.local.json   ← 권한 설정 (어떤 명령 자동 허용할지)
  docs/                 ← 이 문서들 (학습/참조용)
  commands/             ← 슬래시 커맨드
    commit.md           →  /commit
    pr.md               →  /pr
  rules/                ← 코딩 규칙 (Claude 행동 기준)
    coding-convention.md
    testing-guide.md
    web3-patterns.md
```

---

## settings.local.json — 권한 설정

Claude Code가 실행할 때 사용자 승인 없이 자동으로 허용할 명령들.

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm lint *)",
      "Bash(pnpm test *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git status)"
    ]
  }
}
```

매번 "pnpm lint 실행할까요? Y/N" 묻는 걸 생략.

---

## 포트폴리오 관점에서의 가치

PR description 퀄리티가 시니어 어필 포인트.

Claude가 쓴 PR:
```
## Overview
Token swap 기능 구현. Uniswap v3 Router를 통한 실온체인 스왑.

## 구현 내용
- useSwapQuote: Quoter V2 컨트랙트 쿼리로 예상 수량 계산
- useSwapExecute: Router.exactInputSingle wagmi useSendTransaction 래핑
- 슬리피지: 0.5% 기본값, 사용자 조정 가능 (0.1–5%)
- 트랜잭션 확인 모달: 예상 수량 / 가스 / 슬리피지 표시

## Test plan
- [ ] ETH → USDC 스왑 정상 동작
- [ ] 슬리피지 초과 시 revert 처리
- [ ] 잔고 부족 시 버튼 비활성화
```

이게 GitHub에 쌓이면 "실제로 이렇게 일하는 사람"으로 보임.
