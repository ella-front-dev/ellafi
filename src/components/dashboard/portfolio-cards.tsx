"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export function PortfolioCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      {/* Card 1 - Total Portfolio Value */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">
            Portfolio Value
          </p>
          <Wallet className="h-4 w-4 text-muted" />
        </div>
        <p className="font-mono text-2xl font-semibold text-text tracking-tight">
          $124,580.00
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <TrendingUp className="h-3.5 w-3.5 text-gain" />
          <span className="text-gain text-xs font-medium">+$5,203 today</span>
        </div>
      </div>

      {/* Card 2 - 24h PnL */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:border-gain/50 transition-colors duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">
            24h PnL
          </p>
          <TrendingUp className="h-4 w-4 text-gain" />
        </div>
        <p className="font-mono text-2xl font-semibold text-gain tracking-tight">
          +$5,203.40
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-gain-bg text-gain text-xs font-medium px-2 py-0.5 rounded">
            +4.35%
          </span>
          <span className="bg-loss-bg text-loss text-xs font-medium px-2 py-0.5 rounded">
            2 losing
          </span>
        </div>
      </div>

      {/* Card 3 - Open Positions */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">
            Open Positions
          </p>
          <div className="h-2 w-2 rounded-full bg-gain animate-pulse" />
        </div>
        <p className="font-mono text-2xl font-semibold text-text tracking-tight">
          7
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-accent-bg text-accent text-xs font-medium px-2 py-0.5 rounded">
            5 long
          </span>
          <span className="bg-surface-2 text-muted text-xs font-medium px-2 py-0.5 rounded">
            2 short
          </span>
        </div>
      </div>
    </div>
  );
}
