"use client";

import { ChevronUp, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const holdings = [
  { name: "Bitcoin", ticker: "BTC", price: 67432.5, balance: 0.8542, value: 57621.89, change: 2.34 },
  { name: "Ethereum", ticker: "ETH", price: 3521.8, balance: 12.5, value: 44022.5, change: -1.22 },
  { name: "Solana", ticker: "SOL", price: 178.45, balance: 85.2, value: 15203.94, change: 5.67 },
  { name: "Arbitrum", ticker: "ARB", price: 1.24, balance: 4500, value: 5580.0, change: -3.45 },
  { name: "Optimism", ticker: "OP", price: 2.85, balance: 750, value: 2137.5, change: 1.89 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number, decimals = 4) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function TokenHoldings() {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <h2 className="text-sm font-medium text-text">Holdings</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
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
            <th className="w-[40%] px-4 py-2 text-left text-muted text-[10px] uppercase tracking-widest font-medium">
              <span className="flex items-center gap-1">
                Asset
                <ChevronUp className="h-3.5 w-3.5" />
              </span>
            </th>
            <th className="w-[18%] px-4 py-2 text-right text-muted text-[10px] uppercase tracking-widest font-medium">
              <span className="flex items-center justify-end gap-1">
                Price
                <ChevronDown className="h-3.5 w-3.5" />
              </span>
            </th>
            <th className="w-[18%] px-4 py-2 text-right text-muted text-[10px] uppercase tracking-widest font-medium">
              Balance
            </th>
            <th className="w-[14%] px-4 py-2 text-right text-muted text-[10px] uppercase tracking-widest font-medium">
              Value
            </th>
            <th className="w-[10%] px-4 py-2 text-right text-muted text-[10px] uppercase tracking-widest font-medium">
              24h %
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((token, index) => (
            <tr
              key={token.ticker}
              className={`h-[42px] border-b border-border last:border-0 hover:bg-surface-2 transition-colors duration-150 cursor-default ${
                index % 2 === 0 ? "bg-surface" : "bg-surface-2"
              }`}
            >
              <td className="px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral/20 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-neutral">
                      {token.ticker.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-text font-medium text-sm">{token.name}</p>
                    <p className="text-muted text-xs font-mono">{token.ticker}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 text-right font-mono text-neutral text-sm">
                {formatCurrency(token.price)}
              </td>
              <td className="px-4 py-2 text-right font-mono text-neutral text-sm">
                {formatNumber(token.balance)}
              </td>
              <td className="px-4 py-2 text-right font-mono text-neutral text-sm">
                {formatCurrency(token.value)}
              </td>
              <td
                className={`px-4 py-2 text-right font-mono font-medium text-sm ${
                  token.change >= 0 ? "text-gain" : "text-loss"
                }`}
              >
                {token.change >= 0 ? "+" : ""}
                {token.change.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
