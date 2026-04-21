"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";

interface TradingChartProps {
  productId?: string;
}

interface CoinbaseCandle {
  start: string;
  low: string;
  high: string;
  open: string;
  close: string;
  volume: string;
}

async function fetchCandles(productId: string): Promise<CandlestickData<Time>[]> {
  const end = Math.floor(Date.now() / 1000);
  const start = end - 60 * 60 * 24 * 7; // 7 days
  const res = await fetch(
    `https://api.coinbase.com/api/v3/brokerage/market/products/${productId}/candles?start=${start}&end=${end}&granularity=ONE_HOUR`
  );
  if (!res.ok) throw new Error("Failed to fetch candles");
  const data = (await res.json()) as { candles: CoinbaseCandle[] };
  return data.candles
    .map((c) => ({
      time: parseInt(c.start) as Time,
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
    }))
    .sort((a, b) => (a.time as number) - (b.time as number));
}

export function TradingChart({ productId = "ETH-USDC" }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick", Time> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "hsl(var(--muted-foreground, 35 15% 55%))",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderVisible: false,
        textColor: "#8a7a6a",
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: number) => {
          const d = new Date(time * 1000);
          return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
        },
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#5a8f5a",
      downColor: "#8f3a3a",
      borderUpColor: "#5a8f5a",
      borderDownColor: "#8f3a3a",
      wickUpColor: "#5a8f5a",
      wickDownColor: "#8f3a3a",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    fetchCandles(productId)
      .then((candles) => {
        series.setData(candles);
        chart.timeScale().fitContent();
      })
      .catch(console.error);

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [productId]);

  return <div ref={containerRef} className="w-full h-full" />;
}
