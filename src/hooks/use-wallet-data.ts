import { useAccount, useBalance } from "wagmi";

export interface WalletData {
  isConnected: boolean;
  address: `0x${string}` | undefined;
  ethBalance: string | undefined;
  ethBalanceRaw: bigint | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useWalletData(): WalletData {
  const { address, isConnected } = useAccount();

  const {
    data: balanceData,
    isLoading,
    isError,
    refetch,
  } = useBalance({
    address,
    query: { enabled: isConnected && !!address },
  });

  const ethBalance = balanceData
    ? formatEth(balanceData.value, balanceData.decimals)
    : undefined;

  return {
    isConnected,
    address,
    ethBalance,
    ethBalanceRaw: balanceData?.value,
    isLoading: isConnected && isLoading,
    isError: isConnected && isError,
    refetch,
  };
}

function formatEth(value: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const remainder = value % divisor;

  const remainderStr = remainder.toString().padStart(decimals, "0").slice(0, 4);
  const wholeFormatted = whole.toLocaleString("en-US");

  return `${wholeFormatted}.${remainderStr}`;
}
