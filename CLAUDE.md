# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Base network DeFi trading terminal. Portfolio project for landing overseas freelance contracts and full-time positions (senior/mid frontend).

- Deploy: Vercel (ellafi.vercel.app)
- Network: Base (chainId-based design, multi-chain expansion planned)
- Transactions: real on-chain
- Blog: dev.to (based on README)

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript strict
- **UI**: shadcn/ui + Warm Artisan dark/light theme + next-themes
- **Fonts**: Inter (sans) + JetBrains Mono (mono) via `next/font/google`
- **Web3**: wagmi v2 + viem + RainbowKit
- **State/Data**: TanStack Query + Zustand
- **Charts/Table**: TradingView Lightweight Charts + TanStack Virtual
- **Analytics**: Vercel Analytics
- **Package manager**: pnpm

## Commands

```bash
pnpm dev           # dev server
pnpm build         # production build
pnpm lint          # ESLint
pnpm test          # Vitest (all)
pnpm test [file]   # single test file
```

## Page Structure

| Route | Description |
|-------|-------------|
| `/` | Dashboard — portfolio summary, wallet status, key metrics |
| `/wallet` | Connect/disconnect wallet, token balances, QR code, withdraw |
| `/trade` | Real-time order book (WebSocket + TanStack Virtual) + TradingView chart |
| `/swap` | Token swap via Uniswap v3 router, slippage, tx confirm modal |

## Development Phases

Phase 1–3 complete = ready to apply for freelance work.

- [x] **Phase 0**: Project setup + Dashboard UI (static)
- [ ] **Phase 1**: Dashboard + Wallet — connect real wallet data (in progress)
- [ ] **Phase 2**: Trade — order book + TradingView chart
- [ ] **Phase 3**: Swap — Uniswap v3 router

## Git Strategy

포트폴리오를 실제 서비스처럼 운영하는 방식으로 시니어/미들 어필.

```
main          ← 배포 브랜치 (Vercel)
feat/xxx      ← 기능 개발 → PR → main 머지
```

- `dev` 브랜치 없음 (혼자 작업, 오버엔지니어링)
- 모든 기능은 `feat/` 브랜치에서 작업 → PR 생성 → main 머지
- PR description에 구현 내용 + 스크린샷 포함
- Vercel preview URL이 PR마다 자동 생성됨
- `gh pr create` CLI로 PR 생성

**현재 브랜치**: `feat/wallet-page` (다음 작업)

## Current Status

**Phase 1 진행 중. Dashboard 실데이터 연동 완료. 현재 `/wallet` 페이지 작업 시작.**

### 완료된 작업 (main 브랜치, 커밋 완료)

#### Infrastructure
- Next.js 15 + all dependencies installed
- Provider stack: `ThemeProvider` → `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider`
- wagmi config: Base network 단일 체인 (`src/lib/wagmi.ts`)
- WalletConnect Project ID: `.env.local`의 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — **cloud.walletconnect.com에서 발급 필요** (현재 placeholder)
- Vitest + Testing Library configured (`vitest.config.ts`)
- Test mock factory: `src/test/mocks/wagmi.ts` (useAccount, useBalance typed factories)

#### Theme
- Warm Artisan palette in `src/app/globals.css`
- CSS vars: `--bg`, `--surface`, `--surface-2`, `--border`, `--neutral`, `--muted`, `--text`, `--accent`, `--gain`, `--loss`, `--gain-bg`, `--loss-bg`, `--accent-bg`
- Dark mode default (`defaultTheme="dark"`)

#### Dashboard (`/`)
- `navbar.tsx` — RainbowKit `ConnectButton.Custom` 구현
  - 미연결: "Connect Wallet" 버튼
  - 연결됨: `0x1234...5678` 주소 표시 + 클릭 시 RainbowKit 계정 모달
  - 모바일: 아이콘만 표시 (`hidden sm:inline`)
  - SSR: `mounted` 체크로 hydration mismatch 방지
- `portfolio-cards.tsx` — 실데이터 연동
  - ETH 잔고: `useWalletData` 훅 (wagmi `useBalance`)
  - 로딩: shadcn `Skeleton`
  - 에러: "Failed to load" + RefreshCw retry 버튼
  - 미연결: "--" 표시
  - 24h PnL, Open Positions: Phase 2 예정 (현재 "--")
- `token-holdings.tsx` — 실데이터 연동 + 모바일 반응형
  - 미연결: DEMO_HOLDINGS (mock 데이터) + "DEMO" 뱃지
  - 연결됨: Base 네트워크 ERC-20 실잔고 (USDC, WETH, cbETH)
  - 가격: CoinGecko public API (no key), 30초 refetch
  - 잔고 0인 토큰 필터링, 빈 상태 처리
  - 모바일 3컬럼: Asset(+Balance 스택) / Price(+Value 스택) / 24h%
  - 데스크톱 5컬럼: Asset / Price / Balance / Value / 24h%
- `recent-transactions.tsx` — mock 데이터 유지 (Phase 1 후반 예정)
- `theme-toggle.tsx` — dark/light 토글

#### Types & Lib
- `src/types/token.ts` — `Token`, `TokenHolding`, `PriceMap`, `DemoHolding`
- `src/lib/tokens.ts` — `BASE_TOKENS` (USDC/WETH/cbETH 주소), `DEMO_HOLDINGS`, `formatTokenBalance`, `formatCurrency`

#### Hooks
- `src/hooks/use-wallet-data.ts` — `useAccount` + `useBalance` 래핑, ETH 포맷 (소수점 4자리, 1000단위 콤마)
- `src/hooks/use-token-balances.ts` — `useReadContracts`로 ERC-20 `balanceOf` 배치 조회
- `src/hooks/use-token-prices.ts` — CoinGecko API, TanStack Query (`refetchInterval: 30_000`)
- `src/hooks/use-mobile.ts` — `useIsMobile()` responsive hook
- `src/hooks/use-toast.ts` — toast notification hook

#### Tests
- `src/hooks/use-wallet-data.test.ts` — 6개 테스트 (미연결/로딩/성공/콤마포맷/에러/refetch)
- `src/test/mocks/wagmi.ts` — typed mock factories
  - `mockConnectedAccount()` / `mockDisconnectedAccount()` → cast 없이 완전한 타입
  - `mockBalanceSuccess()` / `mockBalanceLoading()` / `mockBalanceError()` → TanStack Query result

#### shadcn components installed
Button, Input, Select, Toast, Skeleton

### Base 네트워크 토큰 주소

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| WETH | `0x4200000000000000000000000000000000000006` | 18 |
| cbETH | `0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22` | 18 |

### Key files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — fonts, ThemeProvider, Providers, Analytics |
| `src/app/globals.css` | Warm Artisan theme + shadcn variable overrides |
| `src/components/providers.tsx` | wagmi + TanStack Query + RainbowKit providers |
| `src/lib/wagmi.ts` | wagmi config (Base chain, SSR: true) |
| `src/lib/tokens.ts` | BASE_TOKENS 설정, DEMO_HOLDINGS, 포맷 함수 |
| `src/types/token.ts` | Token 관련 타입 정의 |
| `src/test/mocks/wagmi.ts` | wagmi hook typed mock factories |
| `src/components/theme-provider.tsx` | next-themes wrapper |
| `.env.local` | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` |

### 다음 작업: `/wallet` 페이지 (`feat/wallet-page` 브랜치)

Phase 1 마무리를 위한 `/wallet` 페이지 구현:

1. 지갑 연결/해제 UI (RainbowKit ConnectButton 재활용)
2. ETH + ERC-20 토큰 잔고 목록 (use-token-balances 재활용)
3. 지갑 주소 표시 + 복사 버튼
4. QR 코드 (수신용)
5. 출금(send) 기능 — wagmi `useSendTransaction`
6. 작업 완료 후 `gh pr create`로 PR 생성 → main 머지

### 미완성 항목 (추후 Phase)

- `recent-transactions.tsx` — 온체인 트랜잭션 히스토리 연동 (Phase 1 후반)
- 24h PnL, Open Positions — 실데이터 (Phase 2)
- `/trade` 페이지 — 실시간 오더북 + TradingView (Phase 2)
- `/swap` 페이지 — Uniswap v3 라우터 (Phase 3)

## Known Issues / 주의사항

- WalletConnect Project ID가 placeholder라 MetaMask 모바일, Rainbow 모바일 등 WalletConnect 기반 지갑 연결 불가. 브라우저 익스텐션(MetaMask, Rainbow, Coinbase, Phantom)은 정상 작동.
- `chrome.runtime.sendMessage()` 콘솔 에러 — 지갑 익스텐션 내부 통신 노이즈, 무시해도 됨.
- CoinGecko public API rate limit 있음 — 과도한 refetch 주의.

## Stack rules
- TypeScript strict: no `any`, no type assertions without comment
- Components: functional + hooks only, no class components
- Styling: Tailwind + shadcn only, no inline styles except CSS vars
- Data fetching: TanStack Query for all async, no raw useEffect for data
- Web3: wagmi hooks only, no direct ethers/viem calls in components
- State: Zustand for global, useState for local UI only
- Test mocks: `as unknown as`는 `src/test/mocks/`에만 격리, 테스트 파일에서는 factory 함수 사용

## File conventions
- Components: src/components/[page]/[name].tsx
- Hooks: src/hooks/use-[name].ts
- Types: src/types/[domain].ts
- Lib/utils: src/lib/[name].ts
- Test mocks: src/test/mocks/[library].ts

## Before every task
1. Read relevant existing files first
2. Run `pnpm lint` after changes
3. No TODOs left in code — finish or create GitHub issue instead
4. New hooks and utils require Vitest tests
5. 작업 완료 후 feat/ 브랜치에서 `gh pr create`로 PR 생성
