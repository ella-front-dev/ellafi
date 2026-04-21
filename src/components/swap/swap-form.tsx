"use client";

import { useState } from "react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector } from "./token-selector";
import { SlippageSetting } from "./slippage-setting";
import { TxConfirmModal } from "./tx-confirm-modal";
import { useSwap } from "@/hooks/use-swap";
import { BASE_TOKENS } from "@/lib/tokens";
import type { Token } from "@/types/token";

const DEFAULT_IN = BASE_TOKENS.find((t) => t.symbol === "WETH")!;
const DEFAULT_OUT = BASE_TOKENS.find((t) => t.symbol === "USDC")!;

export function SwapForm() {
  const { isConnected } = useAccount();
  const [tokenIn, setTokenIn] = useState<Token>(DEFAULT_IN);
  const [tokenOut, setTokenOut] = useState<Token>(DEFAULT_OUT);
  const [amountIn, setAmountIn] = useState("");
  const [slippageBps, setSlippageBps] = useState(50);
  const [modalOpen, setModalOpen] = useState(false);

  const { amountOutFormatted, isQuoting, needsApproval, swap, reset, status, txHash, errorMessage, isBusy } =
    useSwap({ tokenIn, tokenOut, amountIn, slippageBps });

  function handleFlip() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOutFormatted ?? "");
  }

  function handleOpenModal() {
    reset();
    setModalOpen(true);
  }

  function handleClose() {
    if (status === "success") {
      setAmountIn("");
    }
    reset();
    setModalOpen(false);
  }

  const canSwap = isConnected && !!amountIn && Number(amountIn) > 0 && !!amountOutFormatted && !isBusy;

  return (
    <>
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 w-full max-w-md mx-auto">
        <h2 className="text-sm font-medium text-text">Swap</h2>

        {/* Token selectors */}
        <TokenSelector
          tokens={BASE_TOKENS}
          selected={tokenIn}
          exclude={tokenOut}
          onSelect={setTokenIn}
          label="From"
        />

        {/* Amount input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted uppercase tracking-wider font-medium">Amount</label>
          <Input
            placeholder="0.0"
            type="number"
            step="any"
            min="0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="font-mono text-sm bg-surface-2 border-border text-text placeholder:text-muted"
          />
        </div>

        {/* Flip button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleFlip}
            className="h-8 w-8 rounded-full border border-border bg-surface-2 flex items-center justify-center text-muted hover:text-text hover:border-accent/50 transition-colors"
            aria-label="Flip tokens"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        <TokenSelector
          tokens={BASE_TOKENS}
          selected={tokenOut}
          exclude={tokenIn}
          onSelect={setTokenOut}
          label="To"
        />

        {/* Quote output */}
        <div className="bg-surface-2 border border-border rounded-lg px-4 py-3 min-h-[52px] flex items-center justify-between">
          <span className="text-xs text-muted uppercase tracking-wider font-medium">You receive</span>
          {isQuoting ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted" />
          ) : amountOutFormatted ? (
            <span className="font-mono text-sm font-medium text-gain">
              ~{amountOutFormatted} {tokenOut.symbol}
            </span>
          ) : (
            <span className="text-sm text-muted">—</span>
          )}
        </div>

        {/* Slippage */}
        <SlippageSetting value={slippageBps} onChange={setSlippageBps} />

        {/* Submit */}
        {!isConnected ? (
          <div className="h-10 flex items-center justify-center rounded-lg border border-border bg-surface-2 text-sm text-muted">
            Connect wallet to swap
          </div>
        ) : (
          <Button
            onClick={handleOpenModal}
            disabled={!canSwap}
            className="h-10 bg-accent text-bg hover:bg-accent/90 font-medium disabled:opacity-50"
          >
            {!amountIn || Number(amountIn) === 0
              ? "Enter amount"
              : isQuoting
              ? "Fetching quote…"
              : !amountOutFormatted
              ? "No route found"
              : "Review Swap"}
          </Button>
        )}
      </div>

      {modalOpen && amountOutFormatted && (
        <TxConfirmModal
          open={modalOpen}
          status={status}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          amountIn={amountIn}
          amountOut={amountOutFormatted}
          slippageBps={slippageBps}
          txHash={txHash}
          errorMessage={errorMessage}
          needsApproval={needsApproval}
          onConfirm={swap}
          onClose={handleClose}
        />
      )}
    </>
  );
}
