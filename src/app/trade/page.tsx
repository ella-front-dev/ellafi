"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { TradingChart } from "@/components/trade/trading-chart";
import { OrderBook } from "@/components/trade/order-book";
import { PairSelector, type TradePairId } from "@/components/trade/pair-selector";
import { useOrderBook } from "@/hooks/use-orderbook";

export default function TradePage() {
  const [pair, setPair] = useState<TradePairId>("ETH-USDC");
  const { orderBook, status, reconnect } = useOrderBook(pair);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-text">Trade</h1>
          <PairSelector value={pair} onChange={setPair} />
        </div>

        {/* Main grid: chart left, order book right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          {/* Chart */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-sm font-medium text-text font-mono">{pair}</p>
            </div>
            <div className="h-[480px]">
              <TradingChart productId={pair} />
            </div>
          </div>

          {/* Order Book */}
          <OrderBook orderBook={orderBook} status={status} reconnect={reconnect} />
        </div>
      </main>
    </div>
  );
}
