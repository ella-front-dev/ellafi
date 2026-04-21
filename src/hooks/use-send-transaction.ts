import { useState } from "react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";

export interface SendTxParams {
  to: string;
  amountEth: string;
}

export type SendTxStatus = "idle" | "sending" | "pending" | "success" | "error";

export function useSendEth() {
  const [status, setStatus] = useState<SendTxStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const { sendTransactionAsync } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  async function send({ to, amountEth }: SendTxParams) {
    if (!isAddress(to)) {
      setErrorMessage("Invalid recipient address");
      setStatus("error");
      return;
    }

    const trimmed = amountEth.trim();
    if (!trimmed || isNaN(Number(trimmed)) || Number(trimmed) <= 0) {
      setErrorMessage("Invalid amount");
      setStatus("error");
      return;
    }

    try {
      setErrorMessage(undefined);
      setStatus("sending");
      const hash = await sendTransactionAsync({
        to: to as `0x${string}`,
        value: parseEther(trimmed),
      });
      setTxHash(hash);
      setStatus("pending");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      // user rejection → shorter message
      setErrorMessage(msg.includes("User rejected") ? "Transaction rejected" : msg);
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setTxHash(undefined);
    setErrorMessage(undefined);
  }

  return {
    send,
    reset,
    status: isConfirmed ? ("success" as const) : isConfirming ? ("pending" as const) : status,
    txHash,
    errorMessage,
    isBusy: status === "sending" || isConfirming,
  };
}
