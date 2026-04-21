"use client";

import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useTokenPrices } from "@/hooks/use-token-prices";
import { formatCurrency } from "@/lib/tokens";
import { useWalletData } from "@/hooks/use-wallet-data";

export function TokenBalanceList() {
  const { ethBalance, ethBalanceRaw, isLoading: ethLoading } = useWalletData();
  const { holdings, isLoading: balancesLoading, isError, refetch } = useTokenBalances();
  const { prices, isLoading: pricesLoading } = useTokenPrices();

  const isLoading = ethLoading || balancesLoading || pricesLoading;

  const ethPrice = prices?.["ethereum"]?.usd;
  const ethValue =
    ethBalanceRaw !== undefined && ethPrice
      ? (Number(ethBalanceRaw) / 1e18) * ethPrice
      : undefined;

  const holdingsWithPrices = holdings
    .map((h) => {
      const priceData = prices?.[h.token.coingeckoId];
      const balanceNum = Number(h.balanceRaw) / 10 ** h.token.decimals;
      return {
        ...h,
        price: priceData?.usd,
        value: priceData ? balanceNum * priceData.usd : undefined,
      };
    })
    .filter((h) => h.balanceRaw > BigInt(0));

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-text">Balances</h2>
        {isError && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted hover:text-text"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="divide-y divide-border">
        {/* ETH row */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-mono text-neutral">E</span>
            </div>
            <div>
              <p className="text-text text-sm font-medium">Ethereum</p>
              <p className="text-muted text-xs font-mono">ETH</p>
            </div>
          </div>
          <div className="text-right">
            {isLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            ) : (
              <>
                <p className="font-mono text-sm text-neutral">{ethBalance ?? "--"} ETH</p>
                <p className="font-mono text-xs text-muted">
                  {ethValue !== undefined ? formatCurrency(ethValue) : "--"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ERC-20 rows */}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="px-4 py-6 text-center text-loss text-sm">
            Failed to load token balances
          </div>
        ) : holdingsWithPrices.length === 0 ? (
          <div className="px-4 py-6 text-center text-muted text-sm">
            No ERC-20 tokens on Base
          </div>
        ) : (
          holdingsWithPrices.map((h) => (
            <div key={h.token.address} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-neutral">
                    {h.token.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-text text-sm font-medium">{h.token.name}</p>
                  <p className="text-muted text-xs font-mono">{h.token.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-neutral">{h.balanceFormatted} {h.token.symbol}</p>
                <p className="font-mono text-xs text-muted">
                  {h.value !== undefined ? formatCurrency(h.value) : "--"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
