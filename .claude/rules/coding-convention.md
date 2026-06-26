# 코딩 컨벤션

Ellafi 프로젝트 코딩 규칙. Claude가 코드 작성 시 항상 따른다.

## TypeScript

- `strict: true` — `any` 사용 금지
- 타입 단언(`as SomeType`) 금지 — 타입 가드 또는 올바른 타입 정의 사용
- `as unknown as` 는 `src/test/mocks/` 에만 허용
- 모든 함수 파라미터/반환값 타입 명시

```typescript
// ✅
function formatBalance(value: bigint, decimals: number): string { ... }

// ❌
function formatBalance(value: any, decimals: any) { ... }
```

## React 컴포넌트

- 함수형 컴포넌트 + 훅만 사용, 클래스 컴포넌트 금지
- `React.FC<Props>` 금지 — 직접 Props 타입 정의

```typescript
// ✅
interface TokenCardProps { symbol: string; balance: string }
export function TokenCard({ symbol, balance }: TokenCardProps) { ... }

// ❌
export const TokenCard: React.FC<{ symbol: string }> = ({ symbol }) => { ... }
```

## 스타일링

- Tailwind + shadcn/ui 만 사용
- 인라인 스타일 금지 (CSS 변수 참조는 예외: `style={{ color: 'var(--gain)' }}`)
- 직접 CSS 파일 생성 금지

## 데이터 페칭

- TanStack Query 사용, `useEffect` 안에서 직접 fetch 금지
- Web3 훅은 wagmi만 사용, 컴포넌트에서 직접 viem/ethers 호출 금지

```typescript
// ✅ TanStack Query
const { data } = useQuery({ queryKey: ['prices'], queryFn: fetchPrices })

// ❌ useEffect fetch
useEffect(() => { fetch('/api/prices').then(...) }, [])
```

## 파일 명명

| 종류 | 규칙 | 예 |
|------|------|----|
| 컴포넌트 | kebab-case.tsx | `token-card.tsx` |
| 훅 | use-kebab-case.ts | `use-token-prices.ts` |
| 타입 | kebab-case.ts | `token.ts` |
| 유틸 | kebab-case.ts | `tokens.ts` |
| 테스트 | 대상파일.test.ts(x) | `use-token-prices.test.ts` |

## 파일 위치

```
src/
  app/[route]/          ← Next.js App Router 페이지
  components/[page]/    ← 페이지별 컴포넌트
  hooks/                ← 커스텀 훅
  lib/                  ← 유틸, 설정
  types/                ← 타입 정의
  test/mocks/           ← 테스트 mock factory
```

## 변수/함수 명명

- 이벤트 핸들러: `handle` + 이벤트 (예: `handleConnect`, `handleAmountChange`)
- boolean: `is`/`has`/`should` 접두사 (예: `isConnected`, `hasError`)
- 비동기 데이터 훅: `use` + 대상 + 행위 (예: `useTokenPrices`, `useSwapQuote`)

## 주석

- 주석 기본적으로 쓰지 않음
- 쓸 때: 왜(WHY)만. 무엇인지(WHAT)는 코드가 설명
- `// TODO` 금지 — 끝내거나 GitHub 이슈로

## 금지 패턴 요약

```typescript
any                    // TypeScript strict 위반
as SomeType            // 타입 단언 (테스트 mock 외)
React.FC               // 구식 패턴
useEffect + fetch      // TanStack Query 써야 함
import ethers from ... // wagmi 통해서만
style={{ color: '#...' }} // CSS var 없이 하드코딩
// TODO: ...           // 미완성 코드 커밋 금지
```
