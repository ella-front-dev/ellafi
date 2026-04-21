"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { label: "0.1%", bps: 10 },
  { label: "0.5%", bps: 50 },
  { label: "1%", bps: 100 },
];

interface SlippageSettingProps {
  value: number; // bps
  onChange: (bps: number) => void;
}

export function SlippageSetting({ value, onChange }: SlippageSettingProps) {
  const [custom, setCustom] = useState("");

  const isPreset = PRESETS.some((p) => p.bps === value);

  function handleCustomChange(v: string) {
    setCustom(v);
    const num = parseFloat(v);
    if (!isNaN(num) && num > 0 && num <= 50) {
      onChange(Math.round(num * 100));
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted uppercase tracking-wider font-medium">Slippage Tolerance</span>
      <div className="flex items-center gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.bps}
            variant="ghost"
            size="sm"
            onClick={() => { onChange(p.bps); setCustom(""); }}
            className={[
              "h-8 px-3 border text-xs font-medium transition-colors",
              value === p.bps
                ? "border-accent bg-accent-bg text-accent"
                : "border-border bg-surface-2 text-muted hover:text-text",
            ].join(" ")}
          >
            {p.label}
          </Button>
        ))}
        <div className="relative flex items-center">
          <Input
            value={isPreset ? "" : custom || (value / 100).toString()}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Custom"
            className="h-8 w-24 text-xs bg-surface-2 border-border text-text placeholder:text-muted pr-6"
          />
          <span className="absolute right-2 text-xs text-muted pointer-events-none">%</span>
        </div>
      </div>
    </div>
  );
}
