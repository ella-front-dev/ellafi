import { vi } from "vitest";
import type { Connector, UseAccountReturnType, UseBalanceReturnType } from "wagmi";

// ── useAccount factories ──────────────────────────────────────────────────────
// GetConnectionReturnType is a discriminated union — each variant is fully typed.
// The only cast is `{} as Connector`: an opaque wagmi class we cannot instantiate in tests.

export function mockConnectedAccount(
  address: `0x${string}`
): UseAccountReturnType {
  return {
    address,
    addresses: [address],
    chain: undefined,
    chainId: 8453, // Base mainnet
    connector: {} as Connector,
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
    isReconnecting: false,
    status: "connected",
  };
}

export function mockDisconnectedAccount(): UseAccountReturnType {
  return {
    address: undefined,
    addresses: undefined,
    chain: undefined,
    chainId: undefined,
    connector: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
    isReconnecting: false,
    status: "disconnected",
  };
}

// ── useBalance factories ──────────────────────────────────────────────────────
// UseBalanceReturnType = UseQueryResult<GetBalanceData> from TanStack Query.
// TanStack Query result has 20+ internal fields (fetchStatus, dataUpdatedAt, …).
// The cast is isolated here so test files stay type-clean.

type BalanceData = { value: bigint; decimals: number; symbol: string };

export function mockBalanceSuccess(data: BalanceData): UseBalanceReturnType {
  return {
    data,
    isLoading: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as UseBalanceReturnType;
}

export function mockBalanceLoading(): UseBalanceReturnType {
  return {
    data: undefined,
    isLoading: true,
    isPending: true,
    isSuccess: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as UseBalanceReturnType;
}

export function mockBalanceError(): UseBalanceReturnType {
  return {
    data: undefined,
    isLoading: false,
    isPending: false,
    isSuccess: false,
    isError: true,
    error: new Error("RPC error"),
    refetch: vi.fn(),
  } as unknown as UseBalanceReturnType;
}
