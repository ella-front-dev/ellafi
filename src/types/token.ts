export interface Token {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
}

export interface TokenPrice {
  usd: number;
  usd_24h_change: number;
}

export type PriceMap = Record<string, TokenPrice>;

export interface TokenHolding {
  token: Token;
  balanceRaw: bigint;
  balanceFormatted: string;
  price: number | undefined;
  value: number | undefined;
  change24h: number | undefined;
}

export interface DemoHolding {
  name: string;
  ticker: string;
  price: number;
  balance: number;
  value: number;
  change: number;
}
