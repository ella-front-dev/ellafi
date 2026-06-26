# Web3 패턴

Ellafi에서 wagmi/viem 사용 패턴. Claude가 Web3 코드 작성 시 따른다.

## 기본 원칙

- wagmi 훅만 컴포넌트/훅에서 사용
- 컴포넌트에서 직접 viem 호출 금지
- 컨트랙트 ABI는 `src/lib/abis/` 에 분리

## 지갑 연결 상태

```typescript
import { useAccount } from 'wagmi'

const { address, isConnected, chain } = useAccount()

// 미연결 상태 처리 패턴
if (!isConnected || !address) {
  return <ConnectPrompt />
}
```

## 토큰 잔고 조회

ERC-20 다건 조회는 `useReadContracts` 배치로.

```typescript
const { data } = useReadContracts({
  contracts: tokens.map(token => ({
    address: token.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  })),
  query: { enabled: isConnected },
})
```

## 트랜잭션

```typescript
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'

const { sendTransaction, data: txHash } = useSendTransaction()
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash: txHash,
})

// 실행
sendTransaction({ to: address, value: parseEther('0.1') })
```

## 컨트랙트 write

```typescript
import { useWriteContract } from 'wagmi'

const { writeContract } = useWriteContract()

writeContract({
  address: ROUTER_ADDRESS,
  abi: routerAbi,
  functionName: 'exactInputSingle',
  args: [params],
})
```

## 에러 처리 패턴

```typescript
const { error, isError } = useSendTransaction()

// wagmi error는 BaseError 상속
import { BaseError, UserRejectedRequestError } from 'viem'

if (error instanceof UserRejectedRequestError) {
  // 사용자가 지갑에서 거절
}
```

## 로딩 상태 표시

TanStack Query의 `isPending`, wagmi의 `isLoading` 구분:

```typescript
// 컨트랙트 read — TanStack Query 상태
const { data, isPending, isError } = useReadContract(...)

// 트랜잭션 send — wagmi 상태
const { isPending: isSending } = useSendTransaction()
const { isLoading: isConfirming } = useWaitForTransactionReceipt(...)
```

## Base 네트워크 상수

```typescript
// src/lib/tokens.ts 에서 임포트
import { BASE_TOKENS } from '@/lib/tokens'

BASE_TOKENS.USDC    // 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
BASE_TOKENS.WETH    // 0x4200000000000000000000000000000000000006
BASE_TOKENS.cbETH   // 0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22
```

## 금액 포맷

```typescript
import { formatUnits } from 'viem'

// ERC-20 (decimals 주의)
formatUnits(balance, token.decimals)

// ETH
formatUnits(balance, 18)

// 표시용 포맷은 src/lib/tokens.ts의 formatTokenBalance 사용
import { formatTokenBalance, formatCurrency } from '@/lib/tokens'
```

## SSR 주의사항

wagmi 훅은 클라이언트에서만 동작. hydration mismatch 방지:

```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

if (!mounted) return <Skeleton />
```

또는 컴포넌트에 `'use client'` 지시어 확인.
