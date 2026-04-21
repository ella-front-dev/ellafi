import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrderBook } from "./use-orderbook";

const instances: MockWebSocket[] = [];

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  sentMessages: string[] = [];

  constructor(public url: string) {
    instances.push(this);
  }

  send(data: string) { this.sentMessages.push(data); }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  triggerOpen() { this.onopen?.(); }
  triggerMessage(data: object) { this.onmessage?.({ data: JSON.stringify(data) }); }
  triggerError() { this.onerror?.(); }
}

vi.stubGlobal("WebSocket", MockWebSocket);

const SNAPSHOT_EVENT = {
  channel: "l2_data",
  events: [
    {
      type: "snapshot",
      updates: [
        { side: "bid", price_level: "3000.00", new_quantity: "1.5" },
        { side: "bid", price_level: "2999.00", new_quantity: "2.0" },
        { side: "ask", price_level: "3001.00", new_quantity: "0.8" },
        { side: "ask", price_level: "3002.00", new_quantity: "1.2" },
      ],
    },
  ],
};

beforeEach(() => {
  instances.length = 0;
});

function setup() {
  const { result, unmount } = renderHook(() => useOrderBook("ETH-USDC"));
  const ws = instances[instances.length - 1] as MockWebSocket;
  return { result, unmount, ws };
}

describe("useOrderBook", () => {
  it("starts with connecting status", () => {
    const { result } = setup();
    expect(result.current.status).toBe("connecting");
  });

  it("sends subscribe message on open", () => {
    const { ws } = setup();
    act(() => ws.triggerOpen());
    expect(ws.sentMessages).toHaveLength(1);
    const msg = JSON.parse(ws.sentMessages[0]);
    expect(msg.type).toBe("subscribe");
    expect(msg.product_ids).toContain("ETH-USDC");
    expect(msg.channel).toBe("level2");
  });

  it("populates order book from snapshot", () => {
    const { result, ws } = setup();
    act(() => ws.triggerOpen());
    act(() => ws.triggerMessage(SNAPSHOT_EVENT));

    expect(result.current.status).toBe("connected");
    expect(result.current.orderBook.bids).toHaveLength(2);
    expect(result.current.orderBook.asks).toHaveLength(2);

    expect(result.current.orderBook.bids[0].price).toBe(3000);
    expect(result.current.orderBook.bids[1].price).toBe(2999);
    expect(result.current.orderBook.asks[0].price).toBe(3001);
    expect(result.current.orderBook.asks[1].price).toBe(3002);
  });

  it("calculates spread correctly", () => {
    const { result, ws } = setup();
    act(() => ws.triggerOpen());
    act(() => ws.triggerMessage(SNAPSHOT_EVENT));

    expect(result.current.orderBook.spread).toBeCloseTo(1.0);
    expect(result.current.orderBook.spreadPct).toBeCloseTo((1 / 3000) * 100, 3);
  });

  it("removes price level on update with size 0", () => {
    const { result, ws } = setup();
    act(() => ws.triggerOpen());
    act(() => ws.triggerMessage(SNAPSHOT_EVENT));

    act(() =>
      ws.triggerMessage({
        channel: "l2_data",
        events: [
          {
            type: "update",
            updates: [{ side: "bid", price_level: "3000.00", new_quantity: "0" }],
          },
        ],
      })
    );

    expect(result.current.orderBook.bids).toHaveLength(1);
    expect(result.current.orderBook.bids[0].price).toBe(2999);
  });

  it("updates existing price level size", () => {
    const { result, ws } = setup();
    act(() => ws.triggerOpen());
    act(() => ws.triggerMessage(SNAPSHOT_EVENT));

    act(() =>
      ws.triggerMessage({
        channel: "l2_data",
        events: [
          {
            type: "update",
            updates: [{ side: "ask", price_level: "3001.00", new_quantity: "5.0" }],
          },
        ],
      })
    );

    expect(result.current.orderBook.asks[0].size).toBe(5.0);
  });

  it("sets error status on WebSocket error", () => {
    const { result, ws } = setup();
    act(() => ws.triggerError());
    expect(result.current.status).toBe("error");
  });

  it("ignores messages from non-l2_data channels", () => {
    const { result, ws } = setup();
    act(() => ws.triggerOpen());
    act(() => ws.triggerMessage({ channel: "subscriptions", events: [] }));

    expect(result.current.orderBook.bids).toHaveLength(0);
    expect(result.current.orderBook.asks).toHaveLength(0);
  });

  it("reconnect closes old socket and opens new one", () => {
    const { result, ws: firstWs } = setup();
    act(() => firstWs.triggerOpen());
    act(() => firstWs.triggerMessage(SNAPSHOT_EVENT));

    act(() => result.current.reconnect());

    expect(result.current.status).toBe("connecting");
    expect(instances).toHaveLength(2);
  });
});
