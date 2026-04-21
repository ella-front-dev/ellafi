"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TRADE_PAIRS = [
  { id: "ETH-USDC", label: "ETH / USDC" },
  { id: "BTC-USDC", label: "BTC / USDC" },
  { id: "USDC-USDT", label: "USDC / USDT" },
] as const;

export type TradePairId = (typeof TRADE_PAIRS)[number]["id"];

interface PairSelectorProps {
  value: TradePairId;
  onChange: (pair: TradePairId) => void;
}

export function PairSelector({ value, onChange }: PairSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TradePairId)}>
      <SelectTrigger className="w-44 h-9 bg-surface border-border text-text font-mono text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-surface border-border">
        {TRADE_PAIRS.map((pair) => (
          <SelectItem
            key={pair.id}
            value={pair.id}
            className="font-mono text-sm text-text focus:bg-surface-2"
          >
            {pair.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
