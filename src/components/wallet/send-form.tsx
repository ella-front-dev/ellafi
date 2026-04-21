"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendEth } from "@/hooks/use-send-transaction";

export function SendForm() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const { send, reset, status, txHash, errorMessage, isBusy } = useSendEth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await send({ to, amountEth: amount });
  }

  function handleReset() {
    setTo("");
    setAmount("");
    reset();
  }

  if (status === "success") {
    return (
      <div className="bg-surface border border-border rounded-lg p-5 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-gain" />
        <p className="text-text font-medium">Transaction Confirmed</p>
        {txHash && (
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-accent hover:underline break-all"
          >
            {txHash}
          </a>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 border border-border text-muted hover:text-text hover:bg-surface-2"
          onClick={handleReset}
        >
          Send Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <h2 className="text-sm font-medium text-text mb-4">Send ETH</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted uppercase tracking-wider font-medium">
            Recipient Address
          </label>
          <Input
            placeholder="0x..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={isBusy}
            className="font-mono text-sm bg-surface-2 border-border text-text placeholder:text-muted"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted uppercase tracking-wider font-medium">
            Amount (ETH)
          </label>
          <Input
            placeholder="0.0"
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isBusy}
            className="font-mono text-sm bg-surface-2 border-border text-text placeholder:text-muted"
          />
        </div>

        {status === "error" && errorMessage && (
          <div className="flex items-center gap-2 text-loss text-xs">
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {status === "pending" && txHash && (
          <div className="flex items-center gap-2 text-accent text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-mono truncate"
            >
              Confirming... {txHash.slice(0, 18)}…
            </a>
          </div>
        )}

        <Button
          type="submit"
          disabled={isBusy || !to || !amount}
          className="mt-1 h-9 bg-accent text-bg hover:bg-accent/90 gap-2 font-medium"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {status === "sending" ? "Waiting for approval…" : "Confirming…"}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
