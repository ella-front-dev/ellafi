"use client";

import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SwapStatus } from "@/hooks/use-swap";
import type { Token } from "@/types/token";

interface TxConfirmModalProps {
  open: boolean;
  status: SwapStatus;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  slippageBps: number;
  txHash?: `0x${string}`;
  errorMessage?: string;
  needsApproval: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function TxConfirmModal({
  open,
  status,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  slippageBps,
  txHash,
  errorMessage,
  needsApproval,
  onConfirm,
  onClose,
}: TxConfirmModalProps) {
  if (!open) return null;

  const isBusy = status === "approving" || status === "swapping" || status === "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={!isBusy ? onClose : undefined} />
      <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-5 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">Confirm Swap</h2>
          {!isBusy && (
            <button
              onClick={onClose}
              className="text-muted hover:text-text transition-colors text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Swap summary */}
        {status === "idle" || status === "error" ? (
          <div className="bg-surface-2 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">You pay</span>
              <span className="font-mono text-sm font-medium text-text">
                {amountIn} {tokenIn.symbol}
              </span>
            </div>
            <div className="border-t border-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">You receive</span>
              <span className="font-mono text-sm font-medium text-gain">
                ~{amountOut} {tokenOut.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Slippage</span>
              <span className="text-xs text-muted">{slippageBps / 100}%</span>
            </div>
            {needsApproval && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted">Steps</span>
                <span className="text-xs text-accent">Approve → Swap</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Progress states */}
        {status === "approving" && (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-text font-medium">Approve {tokenIn.symbol}</p>
            <p className="text-xs text-muted text-center">
              Allow the Uniswap router to spend your {tokenIn.symbol}
            </p>
          </div>
        )}

        {status === "swapping" && (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-text font-medium">Confirm in wallet</p>
            <p className="text-xs text-muted text-center">
              Swapping {amountIn} {tokenIn.symbol} → ~{amountOut} {tokenOut.symbol}
            </p>
          </div>
        )}

        {status === "pending" && txHash && (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-text font-medium">Transaction submitted</p>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-accent hover:underline font-mono"
            >
              {txHash.slice(0, 20)}…
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {status === "success" && txHash && (
          <div className="flex flex-col items-center gap-3 py-2">
            <CheckCircle2 className="h-8 w-8 text-gain" />
            <p className="text-sm text-text font-medium">Swap confirmed!</p>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-accent hover:underline font-mono"
            >
              View on Basescan
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {status === "error" && errorMessage && (
          <div className="flex items-start gap-2 text-loss text-xs bg-loss-bg rounded-lg p-3">
            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        {(status === "idle" || status === "error") && (
          <Button
            onClick={onConfirm}
            className="h-10 bg-accent text-bg hover:bg-accent/90 font-medium"
          >
            {status === "error" ? "Try Again" : needsApproval ? "Approve & Swap" : "Confirm Swap"}
          </Button>
        )}

        {status === "success" && (
          <Button
            onClick={onClose}
            variant="ghost"
            className="h-10 border border-border text-text hover:bg-surface-2"
          >
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
