"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WalletConnectPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-2 border border-border flex items-center justify-center">
        <Wallet className="h-6 w-6 text-muted" />
      </div>
      <div>
        <p className="text-text font-medium mb-1">No wallet connected</p>
        <p className="text-muted text-sm">Connect your wallet to view balances and send tokens</p>
      </div>
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <Button
            onClick={openConnectModal}
            disabled={!mounted}
            className="h-9 bg-accent text-bg hover:bg-accent/90 font-medium"
          >
            Connect Wallet
          </Button>
        )}
      </ConnectButton.Custom>
    </div>
  );
}
