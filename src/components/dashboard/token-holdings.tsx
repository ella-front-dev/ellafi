"use client";

import { ChevronUp, ChevronDown, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useTokenPrices } from "@/hooks/use-token-prices";
import { DEMO_HOLDINGS, formatCurrency } from "@/lib/tokens";
import type { DemoHolding, TokenHolding } from "@/types/token";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(value: number, decimals = 4): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function ChangeCell({ change }: { change: number | undefined }) {
  if (change === undefined) return <span className="text-muted">--</span>;
  return (
    <span className={change >= 0 ? "text-gain" : "text-loss"}>
      {change >= 0 ? "+" : ""}
      {change.toFixed(2)}%
    </span>
  );
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <tr key={i} className="border-b border-border last:border-0 bg-surface h-[52px]">
          <td className="px-4 py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </td>
          <td className="px-4 py-2 text-right"><Skeleton className="h-3.5 w-20 ml-auto" /></td>
          <td className="hidden sm:table-cell px-4 py-2 text-right"><Skeleton className="h-3.5 w-16 ml-auto" /></td>
          <td className="hidden sm:table-cell px-4 py-2 text-right"><Skeleton className="h-3.5 w-20 ml-auto" /></td>
          <td className="px-4 py-2 text-right"><Skeleton className="h-3.5 w-12 ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

// ── Real holding row ──────────────────────────────────────────────────────────

function RealHoldingRow({
  holding,
  index,
}: {
  holding: TokenHolding;
  index: number;
}) {
  const { token, balanceFormatted, balanceRaw, price, value, change24h } = holding;
  const balanceAsNumber = Number(balanceRaw) / 10 ** token.decimals;

  return (
    <tr
      className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors duration-150 cursor-default ${
        index % 2 === 0 ? "bg-surface" : "bg-surface-2"
      }`}
    >
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-neutral/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-mono text-neutral">
              {token.symbol.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-text font-medium text-sm">{token.name}</p>
            <p className="text-muted text-xs font-mono">{token.symbol}</p>
            <p className="text-muted text-xs font-mono sm:hidden">
              {balanceFormatted}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-2 text-right font-mono text-neutral text-sm">
        <p>{price !== undefined ? formatCurrency(price) : "--"}</p>
        <p className="text-xs text-muted sm:hidden">
          {value !== undefined ? formatCurrency(value) : "--"}
        </p>
      </td>
      <td className="hidden sm:table-cell px-4 py-2 text-right font-mono text-neutral text-sm">
        {formatNumber(balanceAsNumber)}
      </td>
      <td className="hidden sm:table-cell px-4 py-2 text-right font-mono text-neutral text-sm">
        {value !== undefined ? formatCurrency(value) : "--"}
      </td>
      <td className="px-4 py-2 text-right font-mono font-medium text-sm">
        <ChangeCell change={change24h} />
      </td>
    </tr>
  );
}

// ── Demo holding row ──────────────────────────────────────────────────────────

function DemoHoldingRow({
  holding,
  index,
}: {
  holding: DemoHolding;
  index: number;
}) {
  return (
    <tr
      className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors duration-150 cursor-default ${
        index % 2 === 0 ? "bg-surface" : "bg-surface-2"
      }`}
    >
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-neutral/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-mono text-neutral">
              {holding.ticker.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-text font-medium text-sm">{holding.name}</p>
            <p className="text-muted text-xs font-mono">{holding.ticker}</p>
            <p className="text-muted text-xs font-mono sm:hidden">
              {formatNumber(holding.balance)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-2 text-right font-mono text-neutral text-sm">
        <p>{formatCurrency(holding.price)}</p>
        <p className="text-xs text-muted sm:hidden">{formatCurrency(holding.value)}</p>
      </td>
      <td className="hidden sm:table-cell px-4 py-2 text-right font-mono text-neutral text-sm">
        {formatNumber(holding.balance)}
      </td>
      <td className="hidden sm:table-cell px-4 py-2 text-right font-mono text-neutral text-sm">
        {formatCurrency(holding.value)}
      </td>
      <td className="px-4 py-2 text-right font-mono font-medium text-sm">
        <ChangeCell change={holding.change} />
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TokenHoldings() {
  const {
    holdings,
    isConnected,
    isLoading: balancesLoading,
    isError: balancesError,
    refetch,
  } = useTokenBalances();

  const { prices, isLoading: pricesLoading } = useTokenPrices();

  const isLoading = balancesLoading || pricesLoading;

  // Merge prices into holdings
  const holdingsWithPrices: TokenHolding[] = holdings.map((h) => {
    const priceData = prices?.[h.token.coingeckoId];
    const balanceAsNumber = Number(h.balanceRaw) / 10 ** h.token.decimals;
    return {
      ...h,
      price: priceData?.usd,
      value: priceData ? balanceAsNumber * priceData.usd : undefined,
      change24h: priceData?.usd_24h_change,
    };
  });

  const nonZeroHoldings = holdingsWithPrices.filter((h) => h.balanceRaw > BigInt(0));

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-text">Holdings</h2>
          {!isConnected && (
            <span className="text-[10px] text-muted bg-surface-2 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
              demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <Input
              placeholder="Search..."
              className="w-48 h-8 pl-7 text-sm bg-surface-2 border-border text-text placeholder:text-muted"
            />
          </div>
          <Select defaultValue="value">
            <SelectTrigger className="w-28 h-8 text-sm bg-surface-2 border-border text-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              <SelectItem value="value" className="text-text">By Value</SelectItem>
              <SelectItem value="change" className="text-text">By Change</SelectItem>
              <SelectItem value="name" className="text-text">By Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-border bg-surface sticky top-0">
            <th className="w-[45%] sm:w-[40%] px-4 py-2 text-left text-muted text-[10px] uppercase tracking-widest font-medium">
              <span className="flex items-center gap-1">
                Asset
                <ChevronUp className="h-3.5 w-3.5" />
              </span>
            </th>
            <th className="w-[35%] sm:w-[18%] px-4 py-2 text-right text-muted text-[10px] uppercase tracking-widest font-medium">
              <span className="flex items-center justify-end gap-1">
                Price
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            </th>
            <th className="hidden sm:table-cell w-[18%] px-4 py-2 text-right text-muted text-[10px] uppercase tracking-widest font-medium">
              Balance
            </th>
            <th className="hidden sm:table-cell w-[14%] px-4 py-2 text-right text-muted text-[10px] uppercase tracking-widest font-medium">
              Value
            </th>
            <th className="w-[20%] sm:w-[10%] px-4 py-2 text-right text-muted text-[10px] uppercase tracking-widest font-medium">
              24h %
            </th>
          </tr>
        </thead>
        <tbody>
          {/* 로딩 */}
          {isLoading && <SkeletonRows />}

          {/* 에러 */}
          {!isLoading && balancesError && (
            <tr>
              <td colSpan={5} className="py-12 text-center">
                <p className="text-loss text-sm mb-2">Failed to load balances</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted hover:text-text gap-1.5"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              </td>
            </tr>
          )}

          {/* 연결됨 + 잔고 없음 */}
          {!isLoading && !balancesError && isConnected && nonZeroHoldings.length === 0 && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-muted text-sm">
                No token holdings on Base
              </td>
            </tr>
          )}

          {/* 연결됨 + 실데이터 */}
          {!isLoading && !balancesError && isConnected &&
            nonZeroHoldings.map((holding, index) => (
              <RealHoldingRow key={holding.token.address} holding={holding} index={index} />
            ))}

          {/* 미연결: demo 데이터 */}
          {!isConnected &&
            DEMO_HOLDINGS.map((holding, index) => (
              <DemoHoldingRow key={holding.ticker} holding={holding} index={index} />
            ))}
        </tbody>
      </table>
    </div>
  );
}
