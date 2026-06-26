# 테스트 가이드

## 테스트 대상

새 훅과 유틸 함수는 항상 테스트 필수. 컴포넌트는 복잡한 로직이 있을 때만.

## 파일 위치

대상 파일과 같은 디렉토리에 위치.

```
src/hooks/
  use-token-prices.ts
  use-token-prices.test.ts   ← 같은 폴더
```

## 기본 구조

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'

describe('대상명', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('기능명', () => {
    it('기대 동작을 서술한다', () => {
      // given
      // when
      // then
    })
  })
})
```

- `describe` 중첩 최대 2단계
- `afterEach`에서 `vi.restoreAllMocks()` 필수

## 훅 테스트

wagmi 훅 mock은 `src/test/mocks/wagmi.ts`의 factory 함수 사용.  
테스트 파일에서 `as unknown as` 직접 쓰는 것 금지.

```typescript
import { mockConnectedAccount, mockBalanceSuccess } from '@/test/mocks/wagmi'
import { vi } from 'vitest'
import * as wagmi from 'wagmi'

describe('useWalletData', () => {
  it('연결된 지갑의 ETH 잔고를 반환한다', () => {
    vi.spyOn(wagmi, 'useAccount').mockReturnValue(mockConnectedAccount())
    vi.spyOn(wagmi, 'useBalance').mockReturnValue(mockBalanceSuccess({
      value: 1500000000000000000n,  // 1.5 ETH
      decimals: 18,
    }))

    const { result } = renderHook(() => useWalletData())

    expect(result.current.ethBalance).toBe('1.5000')
  })
})
```

## 쿼리 우선순위

| 우선순위 | 쿼리 | 사용 시점 |
|----------|------|-----------|
| 1 | `getByRole` | 기본 |
| 2 | `getByText`, `getByLabelText` | role로 특정 불가 |
| 3 | `getByTestId` | 최후 수단 |

```typescript
// ✅
screen.getByRole('button', { name: 'Connect Wallet' })

// ❌
screen.getByTestId('connect-button')
```

## 이벤트

`fireEvent` 금지, `userEvent` 사용.

```typescript
import userEvent from '@testing-library/user-event'

await userEvent.click(screen.getByRole('button'))
await userEvent.type(input, '1.5')
```

## 금지 패턴

- `toMatchSnapshot()` — 의미 있는 assertion 작성
- `fireEvent` — `userEvent` 사용
- 테스트 파일에서 `as unknown as` 직접 사용 — mock factory 사용
- mock 정리 누락 — `afterEach(() => vi.restoreAllMocks())` 필수
