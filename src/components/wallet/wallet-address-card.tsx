"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

interface WalletAddressCardProps {
  address: `0x${string}`;
}

export function WalletAddressCard({ address }: WalletAddressCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const basescanUrl = `https://basescan.org/address/${address}`;

  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      {/* QR Code */}
      <div className="shrink-0 p-3 bg-white rounded-lg">
        <QRCodeSVG value={address} size={120} />
      </div>

      {/* Address info */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider font-medium mb-1">
            Wallet Address
          </p>
          <p className="font-mono text-sm text-text break-all">{address}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 border border-border text-muted hover:text-text hover:bg-surface-2 gap-1.5 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-gain" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : "Copy Address"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 border border-border text-muted hover:text-text hover:bg-surface-2 gap-1.5 text-xs"
            asChild
          >
            <a href={basescanUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Basescan
            </a>
          </Button>
        </div>

        <p className="text-muted text-xs">
          Base network only. Sending other assets may result in permanent loss.
        </p>
      </div>
    </div>
  );
}
