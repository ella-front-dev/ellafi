import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSendEth } from "./use-send-transaction";

vi.mock("wagmi", () => ({
  useSendTransaction: vi.fn(),
  useWaitForTransactionReceipt: vi.fn(),
}));

vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("viem")>();
  return {
    ...actual,
    parseEther: actual.parseEther,
    isAddress: actual.isAddress,
  };
});

import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

const mockUseSendTransaction = vi.mocked(useSendTransaction);
const mockUseWaitForTransactionReceipt = vi.mocked(useWaitForTransactionReceipt);

const VALID_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678" as const;
const MOCK_HASH = "0xabc123" as `0x${string}`;

function makeWaitResult(overrides = {}) {
  return {
    isLoading: false,
    isSuccess: false,
    isError: false,
    data: undefined,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useWaitForTransactionReceipt>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseWaitForTransactionReceipt.mockReturnValue(makeWaitResult());
});

describe("useSendEth", () => {
  it("초기 상태: idle, txHash undefined", () => {
    mockUseSendTransaction.mockReturnValue({
      sendTransactionAsync: vi.fn(),
    } as unknown as ReturnType<typeof useSendTransaction>);

    const { result } = renderHook(() => useSendEth());

    expect(result.current.status).toBe("idle");
    expect(result.current.txHash).toBeUndefined();
    expect(result.current.isBusy).toBe(false);
  });

  it("잘못된 주소 입력 시 error 상태 반환", async () => {
    mockUseSendTransaction.mockReturnValue({
      sendTransactionAsync: vi.fn(),
    } as unknown as ReturnType<typeof useSendTransaction>);

    const { result } = renderHook(() => useSendEth());

    await act(async () => {
      await result.current.send({ to: "invalid-address", amountEth: "1.0" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe("Invalid recipient address");
  });

  it("잘못된 금액 입력 시 error 상태 반환", async () => {
    mockUseSendTransaction.mockReturnValue({
      sendTransactionAsync: vi.fn(),
    } as unknown as ReturnType<typeof useSendTransaction>);

    const { result } = renderHook(() => useSendEth());

    await act(async () => {
      await result.current.send({ to: VALID_ADDRESS, amountEth: "-1" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe("Invalid amount");
  });

  it("전송 성공 시 txHash 설정 및 pending 상태", async () => {
    const mockSend = vi.fn().mockResolvedValue(MOCK_HASH);
    mockUseSendTransaction.mockReturnValue({
      sendTransactionAsync: mockSend,
    } as unknown as ReturnType<typeof useSendTransaction>);

    const { result } = renderHook(() => useSendEth());

    await act(async () => {
      await result.current.send({ to: VALID_ADDRESS, amountEth: "0.1" });
    });

    expect(result.current.txHash).toBe(MOCK_HASH);
    expect(result.current.status).toBe("pending");
  });

  it("트랜잭션 confirmed 시 success 상태", async () => {
    const mockSend = vi.fn().mockResolvedValue(MOCK_HASH);
    mockUseSendTransaction.mockReturnValue({
      sendTransactionAsync: mockSend,
    } as unknown as ReturnType<typeof useSendTransaction>);
    mockUseWaitForTransactionReceipt.mockReturnValue(
      makeWaitResult({ isSuccess: true, isLoading: false })
    );

    const { result } = renderHook(() => useSendEth());

    await act(async () => {
      await result.current.send({ to: VALID_ADDRESS, amountEth: "0.1" });
    });

    expect(result.current.status).toBe("success");
  });

  it("지갑 거절 시 'Transaction rejected' 메시지", async () => {
    const mockSend = vi.fn().mockRejectedValue(new Error("User rejected the request"));
    mockUseSendTransaction.mockReturnValue({
      sendTransactionAsync: mockSend,
    } as unknown as ReturnType<typeof useSendTransaction>);

    const { result } = renderHook(() => useSendEth());

    await act(async () => {
      await result.current.send({ to: VALID_ADDRESS, amountEth: "0.1" });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe("Transaction rejected");
  });

  it("reset 호출 시 초기 상태 복귀", async () => {
    mockUseSendTransaction.mockReturnValue({
      sendTransactionAsync: vi.fn().mockRejectedValue(new Error("fail")),
    } as unknown as ReturnType<typeof useSendTransaction>);

    const { result } = renderHook(() => useSendEth());

    await act(async () => {
      await result.current.send({ to: VALID_ADDRESS, amountEth: "0.1" });
    });

    expect(result.current.status).toBe("error");

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.errorMessage).toBeUndefined();
  });
});
