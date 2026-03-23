import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWalletData } from "./use-wallet-data";
import {
  mockConnectedAccount,
  mockDisconnectedAccount,
  mockBalanceSuccess,
  mockBalanceLoading,
  mockBalanceError,
} from "@/test/mocks/wagmi";

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useBalance: vi.fn(),
}));

import { useAccount, useBalance } from "wagmi";

const mockUseAccount = vi.mocked(useAccount);
const mockUseBalance = vi.mocked(useBalance);

const MOCK_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678" as const;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useWalletData", () => {
  it("미연결 상태: isConnected false, 잔고 undefined", () => {
    mockUseAccount.mockReturnValue(mockDisconnectedAccount());
    mockUseBalance.mockReturnValue(mockBalanceLoading());

    const { result } = renderHook(() => useWalletData());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBeUndefined();
    expect(result.current.ethBalance).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("로딩 중: isLoading true 반환", () => {
    mockUseAccount.mockReturnValue(mockConnectedAccount(MOCK_ADDRESS));
    mockUseBalance.mockReturnValue(mockBalanceLoading());

    const { result } = renderHook(() => useWalletData());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.ethBalance).toBeUndefined();
  });

  it("성공: ETH 잔고 포맷 (소수점 4자리, 콤마)", () => {
    mockUseAccount.mockReturnValue(mockConnectedAccount(MOCK_ADDRESS));
    mockUseBalance.mockReturnValue(
      mockBalanceSuccess({
        value: BigInt("1500000000000000000"), // 1.5 ETH
        decimals: 18,
        symbol: "ETH",
      })
    );

    const { result } = renderHook(() => useWalletData());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.ethBalance).toBe("1.5000");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("성공: 1000단위 콤마 포맷", () => {
    mockUseAccount.mockReturnValue(mockConnectedAccount(MOCK_ADDRESS));
    mockUseBalance.mockReturnValue(
      mockBalanceSuccess({
        value: BigInt("1234567890000000000000"), // 1,234.5678 ETH
        decimals: 18,
        symbol: "ETH",
      })
    );

    const { result } = renderHook(() => useWalletData());

    expect(result.current.ethBalance).toBe("1,234.5678");
  });

  it("에러 상태: isError true 반환", () => {
    mockUseAccount.mockReturnValue(mockConnectedAccount(MOCK_ADDRESS));
    mockUseBalance.mockReturnValue(mockBalanceError());

    const { result } = renderHook(() => useWalletData());

    expect(result.current.isError).toBe(true);
    expect(result.current.ethBalance).toBeUndefined();
  });

  it("에러 상태: refetch 함수 제공", () => {
    const mockRefetch = vi.fn();
    mockUseAccount.mockReturnValue(mockConnectedAccount(MOCK_ADDRESS));
    mockUseBalance.mockReturnValue({ ...mockBalanceError(), refetch: mockRefetch } as ReturnType<typeof useBalance>);

    const { result } = renderHook(() => useWalletData());

    result.current.refetch();
    expect(mockRefetch).toHaveBeenCalledOnce();
  });
});
