"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";
import type { Token } from "@/types/token";

// Uniswap v3 on Base
const QUOTER_V2_ADDRESS = "0x3d4e44Eb1374240CE5F1B136041212d9d6F0f28" as const;
const SWAP_ROUTER_ADDRESS = "0x2626664c2603336E57B271c5C0b26F421741e481" as const;

const quoterV2Abi = [
  {
    name: "quoteExactInputSingle",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
  },
] as const;

const erc20Abi = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const swapRouterAbi = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

// 500 = 0.05%, 3000 = 0.3%, 10000 = 1%
const POOL_FEE = 3000 as const;

export type SwapStatus = "idle" | "approving" | "swapping" | "pending" | "success" | "error";

export interface UseSwapParams {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  slippageBps: number; // e.g. 50 = 0.5%
}

function formatQuoteAmount(raw: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = raw / divisor;
  const remainder = raw % divisor;
  const remainderStr = remainder.toString().padStart(decimals, "0").slice(0, 6);
  return `${whole.toString()}.${remainderStr}`;
}

export function useSwap({ tokenIn, tokenOut, amountIn, slippageBps }: UseSwapParams) {
  const { address } = useAccount();
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const amountInParsed =
    tokenIn && amountIn && !isNaN(Number(amountIn)) && Number(amountIn) > 0
      ? parseUnits(amountIn, tokenIn.decimals)
      : undefined;

  // Quote
  const { data: quoteData, isLoading: isQuoting } = useReadContract({
    address: QUOTER_V2_ADDRESS,
    abi: quoterV2Abi,
    functionName: "quoteExactInputSingle",
    args: amountInParsed && tokenIn && tokenOut
      ? [
          {
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            amountIn: amountInParsed,
            fee: POOL_FEE,
            sqrtPriceLimitX96: BigInt(0),
          },
        ]
      : undefined,
    query: {
      enabled: !!amountInParsed && !!tokenIn && !!tokenOut,
      refetchInterval: 10_000,
    },
  });

  const amountOut = quoteData?.[0];
  const amountOutFormatted = amountOut && tokenOut
    ? formatQuoteAmount(amountOut, tokenOut.decimals)
    : undefined;

  // Allowance check
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn?.address,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, SWAP_ROUTER_ADDRESS] : undefined,
    query: { enabled: !!tokenIn && !!address },
  });

  const needsApproval =
    amountInParsed !== undefined &&
    allowance !== undefined &&
    allowance < amountInParsed;

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const swap = useCallback(async () => {
    if (!tokenIn || !tokenOut || !amountInParsed || !amountOut || !address) return;

    try {
      setErrorMessage(undefined);

      if (needsApproval) {
        setStatus("approving");
        await writeContractAsync({
          address: tokenIn.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [SWAP_ROUTER_ADDRESS, amountInParsed],
        });
        await refetchAllowance();
      }

      setStatus("swapping");
      // amountOutMinimum with slippage
      const amountOutMinimum = (amountOut * BigInt(10000 - slippageBps)) / BigInt(10000);

      const hash = await writeContractAsync({
        address: SWAP_ROUTER_ADDRESS,
        abi: swapRouterAbi,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            fee: POOL_FEE,
            recipient: address,
            amountIn: amountInParsed,
            amountOutMinimum,
            sqrtPriceLimitX96: BigInt(0),
          },
        ],
      });

      setTxHash(hash);
      setStatus("pending");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      setErrorMessage(msg.includes("User rejected") ? "Transaction rejected" : msg.slice(0, 120));
      setStatus("error");
    }
  }, [tokenIn, tokenOut, amountInParsed, amountOut, address, needsApproval, slippageBps, writeContractAsync, refetchAllowance]);

  function reset() {
    setStatus("idle");
    setTxHash(undefined);
    setErrorMessage(undefined);
  }

  const derivedStatus: SwapStatus = isConfirmed
    ? "success"
    : isConfirming
    ? "pending"
    : status;

  return {
    amountOutFormatted,
    isQuoting,
    needsApproval,
    swap,
    reset,
    status: derivedStatus,
    txHash,
    errorMessage,
    isBusy: status === "approving" || status === "swapping" || isConfirming,
  };
}

// Re-export ABI data for potential use in tests
export { encodeFunctionData };
