const transactions = [
  { type: "BUY", pair: "BTC/USDC", time: "2m ago", market: "Spot", amount: "+0.024 BTC" },
  { type: "SELL", pair: "ETH/USDC", time: "15m ago", market: "Spot", amount: "-1,200 USDC" },
  { type: "BUY", pair: "SOL/USDC", time: "1h ago", market: "Spot", amount: "+12.5 SOL" },
  { type: "SELL", pair: "ARB/USDC", time: "2h ago", market: "Perp", amount: "-500 USDC" },
  { type: "BUY", pair: "OP/USDC", time: "3h ago", market: "Spot", amount: "+150 OP" },
  { type: "SELL", pair: "BTC/USDC", time: "5h ago", market: "Perp", amount: "-0.015 BTC" },
  { type: "BUY", pair: "ETH/USDC", time: "8h ago", market: "Spot", amount: "+2.5 ETH" },
  { type: "SELL", pair: "SOL/USDC", time: "12h ago", market: "Spot", amount: "-25 SOL" },
];

export function RecentTransactions() {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden lg:sticky lg:top-4 self-start">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <h2 className="text-sm font-medium text-text">Recent Activity</h2>
        <span className="text-xs text-muted hover:text-neutral cursor-pointer transition-colors">
          View all
        </span>
      </div>

      {/* Transaction list */}
      <div className="max-h-[520px] overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm">
            No recent transactions
          </div>
        ) : (
          transactions.map((tx, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
            >
              {/* Type tag */}
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium font-mono uppercase ${
                  tx.type === "BUY"
                    ? "bg-gain-bg text-gain"
                    : "bg-loss-bg text-loss"
                }`}
              >
                {tx.type}
              </span>

              {/* Pair + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">{tx.pair}</p>
                <p className="text-[11px] text-muted">
                  {tx.time} · {tx.market}
                </p>
              </div>

              {/* Amount */}
              <span
                className={`font-mono text-sm whitespace-nowrap ${
                  tx.type === "BUY" ? "text-gain" : "text-loss"
                }`}
              >
                {tx.amount}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
