"use client";

import { Button } from "@/components/ui/button";
import type { Token } from "@/types/token";

const TOKEN_ICONS: Record<string, string> = {
  USDC: "🔵",
  WETH: "🔷",
  cbETH: "🟦",
};

interface TokenSelectorProps {
  tokens: Token[];
  selected: Token | null;
  exclude?: Token | null;
  onSelect: (token: Token) => void;
  label: string;
}

export function TokenSelector({ tokens, selected, exclude, onSelect, label }: TokenSelectorProps) {
  const available = tokens.filter((t) => t.address !== exclude?.address);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted uppercase tracking-wider font-medium">{label}</span>
      <div className="flex flex-wrap gap-2">
        {available.map((token) => {
          const isSelected = selected?.address === token.address;
          return (
            <Button
              key={token.address}
              variant="ghost"
              size="sm"
              onClick={() => onSelect(token)}
              className={[
                "h-9 px-3 gap-2 border font-medium text-sm transition-colors",
                isSelected
                  ? "border-accent bg-accent-bg text-accent"
                  : "border-border bg-surface-2 text-text hover:border-accent/50 hover:text-accent",
              ].join(" ")}
            >
              <span>{TOKEN_ICONS[token.symbol] ?? "•"}</span>
              {token.symbol}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
