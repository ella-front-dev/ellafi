import { useQuery } from "@tanstack/react-query";
import { BASE_TOKENS } from "@/lib/tokens";
import type { PriceMap } from "@/types/token";

async function fetchTokenPrices(ids: string[]): Promise<PriceMap> {
  const params = new URLSearchParams({
    ids: ids.join(","),
    vs_currencies: "usd",
    include_24hr_change: "true",
  });
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?${params}`
  );
  if (!res.ok) throw new Error("Failed to fetch token prices");
  return res.json() as Promise<PriceMap>;
}

export function useTokenPrices() {
  const ids = ["ethereum", ...BASE_TOKENS.map((t) => t.coingeckoId)];

  const { data: prices, isLoading, isError } = useQuery({
    queryKey: ["token-prices", ids],
    queryFn: () => fetchTokenPrices(ids),
    refetchInterval: 30_000,
    staleTime: 25_000,
  });

  return { prices, isLoading, isError };
}
