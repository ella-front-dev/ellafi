"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderBook, OrderBookEntry } from "@/hooks/use-orderbook";

interface OrderBookProps {
  orderBook: OrderBook;
  status: "connecting" | "connected" | "disconnected" | "error";
  reconnect: () => void;
}

const ROW_HEIGHT = 22;
const DEPTH = 15;

function OrderSide({
  entries,
  side,
  maxTotal,
}: {
  entries: OrderBookEntry[];
  side: "bid" | "ask";
  maxTotal: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const isAsk = side === "ask";
  const barColor = isAsk ? "bg-loss/15" : "bg-gain/15";
  const priceColor = isAsk ? "text-loss" : "text-gain";

  return (
    <div ref={parentRef} className="overflow-hidden" style={{ height: DEPTH * ROW_HEIGHT }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vi) => {
          const entry = entries[vi.index];
          if (!entry) return null;
          const pct = maxTotal > 0 ? (entry.total / maxTotal) * 100 : 0;
          return (
            <div
              key={vi.key}
              style={{
                position: "absolute",
                top: vi.start,
                height: ROW_HEIGHT,
                width: "100%",
              }}
              className="relative flex items-center px-3 text-xs font-mono"
            >
              {/* depth bar */}
              <div
                className={`absolute inset-y-0 ${isAsk ? "left-0" : "right-0"} ${barColor}`}
                style={{ width: `${pct}%` }}
              />
              <span className={`flex-1 z-10 ${priceColor}`}>
                {entry.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="flex-1 z-10 text-center text-text">
                {entry.size.toFixed(4)}
              </span>
              <span className="flex-1 z-10 text-right text-muted">
                {entry.total.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status, reconnect }: { status: OrderBookProps["status"]; reconnect: () => void }) {
  if (status === "connected") {
    return (
      <span className="flex items-center gap-1 text-gain text-xs">
        <Wifi className="h-3 w-3" />
        Live
      </span>
    );
  }
  if (status === "connecting") {
    return (
      <span className="flex items-center gap-1 text-muted text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        Connecting
      </span>
    );
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={reconnect}
      className="h-6 gap-1 text-xs text-loss hover:text-text px-2"
    >
      <WifiOff className="h-3 w-3" />
      Reconnect
    </Button>
  );
}

export function OrderBook({ orderBook, status, reconnect }: OrderBookProps) {
  const { bids, asks, spread, spreadPct } = orderBook;
  const maxTotal = Math.max(
    bids[bids.length - 1]?.total ?? 0,
    asks[asks.length - 1]?.total ?? 0
  );

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-text">Order Book</h2>
        <StatusBadge status={status} reconnect={reconnect} />
      </div>

      {/* Column labels */}
      <div className="px-3 py-1 flex text-xs text-muted font-mono border-b border-border">
        <span className="flex-1">Price (USDC)</span>
        <span className="flex-1 text-center">Size (ETH)</span>
        <span className="flex-1 text-right">Total</span>
      </div>

      {/* Asks (sell side) — reversed so best ask is at bottom */}
      <div className="flex flex-col-reverse">
        <OrderSide entries={asks} side="ask" maxTotal={maxTotal} />
      </div>

      {/* Spread */}
      <div className="px-3 py-1.5 border-y border-border bg-surface-2 flex items-center gap-2 text-xs font-mono">
        <span className="text-muted">Spread</span>
        <span className="text-text">
          {spread > 0 ? spread.toFixed(2) : "--"}
        </span>
        <span className="text-muted">
          {spreadPct > 0 ? `(${spreadPct.toFixed(3)}%)` : ""}
        </span>
      </div>

      {/* Bids (buy side) */}
      <OrderSide entries={bids} side="bid" maxTotal={maxTotal} />
    </div>
  );
}
