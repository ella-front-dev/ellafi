import { useAccount, useReadContracts } from "wagmi";
import { BASE_TOKENS, formatTokenBalance } from "@/lib/tokens";
import type { TokenHolding } from "@/types/token";

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export function useTokenBalances() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: BASE_TOKENS.map((token) => ({
      address: token.address,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [address ?? ZERO_ADDRESS],
    })),
    query: {
      enabled: isConnected && !!address,
    },
  });

  const holdings: TokenHolding[] = BASE_TOKENS.map((token, i) => {
    const balanceRaw = (data?.[i]?.result as bigint | undefined) ?? BigInt(0);
    return {
      token,
      balanceRaw,
      balanceFormatted: formatTokenBalance(balanceRaw, token.decimals),
      price: undefined,
      value: undefined,
      change24h: undefined,
    };
  });

  return {
    holdings,
    isConnected,
    isLoading: isConnected && isLoading,
    isError: isConnected && isError,
    refetch,
  };
}
