import type { Token, DemoHolding } from "@/types/token";

export const BASE_TOKENS: Token[] = [
  {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    coingeckoId: "usd-coin",
  },
  {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    coingeckoId: "weth",
  },
  {
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
    decimals: 18,
    coingeckoId: "coinbase-wrapped-staked-eth",
  },
];

export const DEMO_HOLDINGS: DemoHolding[] = [
  { name: "Bitcoin", ticker: "BTC", price: 67432.5, balance: 0.8542, value: 57621.89, change: 2.34 },
  { name: "Ethereum", ticker: "ETH", price: 3521.8, balance: 12.5, value: 44022.5, change: -1.22 },
  { name: "Solana", ticker: "SOL", price: 178.45, balance: 85.2, value: 15203.94, change: 5.67 },
  { name: "Arbitrum", ticker: "ARB", price: 1.24, balance: 4500, value: 5580.0, change: -3.45 },
  { name: "Optimism", ticker: "OP", price: 2.85, balance: 750, value: 2137.5, change: 1.89 },
];

export function formatTokenBalance(balance: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const remainder = balance % divisor;
  const remainderStr = remainder.toString().padStart(decimals, "0").slice(0, 4);
  return `${whole.toLocaleString("en-US")}.${remainderStr}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}
