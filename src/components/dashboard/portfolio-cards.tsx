"use client";

import { TrendingUp, Wallet, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWalletData } from "@/hooks/use-wallet-data";

export function PortfolioCards() {
  const { isConnected, ethBalance, isLoading, isError, refetch } =
    useWalletData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      {/* Card 1 - ETH Balance */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">
            ETH Balance
          </p>
          <Wallet className="h-4 w-4 text-muted" />
        </div>

        {isLoading ? (
          <Skeleton className="h-8 w-36 mt-1" />
        ) : isError ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-loss text-sm">Failed to load</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted hover:text-text"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="font-mono text-2xl font-semibold text-text tracking-tight">
            {isConnected && ethBalance ? `${ethBalance} ETH` : "--"}
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted" />
          <span className="text-muted text-xs font-medium">Portfolio Value</span>
        </div>
      </div>

      {/* Card 2 - 24h PnL (Phase 2에서 실데이터 연결 예정) */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:border-gain/50 transition-colors duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">
            24h PnL
          </p>
          <TrendingUp className="h-4 w-4 text-muted" />
        </div>
        <p className="font-mono text-2xl font-semibold text-text tracking-tight">
          {isConnected ? "--" : "--"}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-muted text-xs">Available in Phase 2</span>
        </div>
      </div>

      {/* Card 3 - Open Positions (Phase 2에서 실데이터 연결 예정) */}
      <div className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors duration-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-muted text-xs uppercase tracking-wider font-medium">
            Open Positions
          </p>
          <div className="h-2 w-2 rounded-full bg-muted" />
        </div>
        <p className="font-mono text-2xl font-semibold text-text tracking-tight">
          {isConnected ? "--" : "--"}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-muted text-xs">Available in Phase 2</span>
        </div>
      </div>
    </div>
  );
}
