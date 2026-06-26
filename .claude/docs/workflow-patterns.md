# 워크플로우 패턴

## 패턴 1: 기능 개발 → 커밋 → PR

```
feat/ 브랜치 생성
    ↓
기능 요청 ("useSwapQuote 훅 만들어줘")
    ↓
Claude: 구현 + 테스트 자동 작성
    ↓
/commit → Claude: diff 분석 → 컨벤션 커밋
    ↓
/pr → Claude: 구현 내용 파악 → PR description 작성
    ↓
gh pr create → 포트폴리오에 PR 쌓임
```

## 패턴 2: 버그 수정

```
"useTokenPrices가 지갑 연결 해제해도 계속 fetch해"
    ↓
Claude: 관련 파일 전부 읽기
    ↓
Claude: 원인 찾기 → 수정 → pnpm test 실행
    ↓
/commit "fix: 지갑 미연결 시 price fetch 중단"
```

## 패턴 3: 코드 품질 검토

```
/review src/hooks/use-swap-quote.ts
    ↓
Claude: naming, TypeScript, 패턴 위반 체크
    ↓
Critical/Major/Minor 분류 출력
```

## 패턴 4: 대형 도구 제작 (DSP 사례 기반)

**언제 씀**: 반복 작업을 자동화하고 싶을 때

```
사람: 문제 정의 ("Figma vs 실제 구현 자동 검증 스크립트")
    ↓
Claude: scripts/ 폴더에 도구 전체 구현
    ↓
사람: 도구 실행
    ↓
Claude: 결과 집계 → 이슈 생성 → PR 작성
```

Ellafi 적용 예시:
- "온체인 트랜잭션 히스토리 자동 수집 스크립트"
- "Base 네트워크 가스비 모니터링 스크립트"

---

## 효과적인 요청 방법

### 나쁜 요청

```
"swap 페이지 만들어줘"
```

너무 추상적. Claude가 어디서부터 시작할지 모름.

### 좋은 요청

```
"swap 페이지 만들어줘.
- Uniswap v3 Router 사용
- wagmi useSendTransaction 기반
- 슬리피지 설정 (기본 0.5%, 0.1–5% 범위)
- 트랜잭션 확인 모달 포함
- src/app/swap/page.tsx + src/hooks/use-swap-*.ts 구조로"
```

스펙이 구체적일수록 Claude 결과물 품질이 높아짐.

### 기존 코드 참조 요청

```
"use-token-balances.ts 참고해서 
 use-swap-quote.ts 만들어줘"
```

Claude가 기존 패턴을 그대로 따라서 일관성 유지.

---

## 멀티 에이전트 패턴 (고급)

`review-task.md` 같은 커맨드 파일에서 서브에이전트 활용:

```markdown
## Step 2: 파일 탐색
Agent(subagent_type="Explore", model="haiku")로
대상 파일 경로 수집 — 빠른 탐색용 작은 모델

## Step 4: 코드 리뷰  
Agent(subagent_type="code-reviewer")로
실제 리뷰 수행 — 전문 에이전트
```

왜 유용하냐:
- 탐색(빠름, 싸다) → haiku
- 리뷰(정확함, 비쌈) → 큰 모델
- 병렬 실행으로 속도 향상

---

## 컨텍스트 한계 관리

대화가 길어지면 Claude가 앞부분을 잊음.  
그래서 CLAUDE.md + rules 파일이 중요:

```
Claude가 잊는 것          → Claude가 못 잊는 것
─────────────────────     ─────────────────────
이전 대화 내용             CLAUDE.md (매번 재로드)
"아까 말했잖아요"           .claude/rules/*.md
임시로 설명한 컨벤션        .claude/commands/*.md
```

"이 프로젝트 규칙이 뭔지" → CLAUDE.md  
"이 파일 어떻게 구조화하는지" → rules/coding-convention.md  
"커밋 어떻게 쓰는지" → commands/commit.md
