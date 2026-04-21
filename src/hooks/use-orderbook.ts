"use client";

import { useEffect, useRef, useReducer, useCallback } from "react";

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  spreadPct: number;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface State {
  bids: Map<string, string>;
  asks: Map<string, string>;
  status: ConnectionStatus;
}

type Action =
  | { type: "SNAPSHOT"; bids: [string, string][]; asks: [string, string][] }
  | { type: "UPDATE"; changes: [string, string, string][] }
  | { type: "STATUS"; status: ConnectionStatus };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SNAPSHOT": {
      return {
        ...state,
        bids: new Map(action.bids),
        asks: new Map(action.asks),
      };
    }
    case "UPDATE": {
      const bids = new Map(state.bids);
      const asks = new Map(state.asks);
      for (const [side, price, size] of action.changes) {
        const map = side === "buy" ? bids : asks;
        if (size === "0") {
          map.delete(price);
        } else {
          map.set(price, size);
        }
      }
      return { ...state, bids, asks };
    }
    case "STATUS":
      return { ...state, status: action.status };
    default:
      return state;
  }
}

function toSortedEntries(
  map: Map<string, string>,
  side: "bid" | "ask",
  depth = 15
): OrderBookEntry[] {
  const entries = Array.from(map.entries())
    .map(([price, size]) => ({ price: parseFloat(price), size: parseFloat(size) }))
    .filter((e) => e.size > 0)
    .sort((a, b) => (side === "bid" ? b.price - a.price : a.price - b.price))
    .slice(0, depth);

  let running = 0;
  return entries.map((e) => {
    running += e.size;
    return { ...e, total: running };
  });
}

const WS_URL = "wss://advanced-trade-ws.coinbase.com";

export function useOrderBook(productId = "ETH-USDC") {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, dispatch] = useReducer(reducer, {
    bids: new Map(),
    asks: new Map(),
    status: "connecting",
  });

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    dispatch({ type: "STATUS", status: "connecting" });
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          product_ids: [productId],
          channel: "level2",
        })
      );
    };

    ws.onmessage = (ev: MessageEvent) => {
      const msg = JSON.parse(ev.data as string) as {
        channel: string;
        events?: {
          type: string;
          updates?: { side: string; price_level: string; new_quantity: string }[];
        }[];
      };

      if (msg.channel !== "l2_data" || !msg.events) return;

      for (const event of msg.events) {
        if (event.type === "snapshot" && event.updates) {
          const bids: [string, string][] = [];
          const asks: [string, string][] = [];
          for (const u of event.updates) {
            if (u.side === "bid") bids.push([u.price_level, u.new_quantity]);
            else asks.push([u.price_level, u.new_quantity]);
          }
          dispatch({ type: "SNAPSHOT", bids, asks });
          dispatch({ type: "STATUS", status: "connected" });
        } else if (event.type === "update" && event.updates) {
          const changes: [string, string, string][] = event.updates.map((u) => [
            u.side === "bid" ? "buy" : "sell",
            u.price_level,
            u.new_quantity,
          ]);
          dispatch({ type: "UPDATE", changes });
        }
      }
    };

    ws.onerror = () => dispatch({ type: "STATUS", status: "error" });
    ws.onclose = () => dispatch({ type: "STATUS", status: "disconnected" });
  }, [productId]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    connect();
  }, [connect]);

  const bids = toSortedEntries(state.bids, "bid");
  const asks = toSortedEntries(state.asks, "ask");

  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const spread = bestAsk - bestBid;
  const spreadPct = bestBid > 0 ? (spread / bestBid) * 100 : 0;

  const orderBook: OrderBook = { bids, asks, spread, spreadPct };

  return { orderBook, status: state.status, reconnect };
}
