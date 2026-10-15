import type { NFTUpdatedEvent, OrderUpdatedEvent } from "../types";
import { mockDb } from "./db";

type EventCallback = (data: unknown) => void;

/**
 * Robust mock socket implementation compatible with Socket.IO client interface.
 * Dispatches live events: nft.updated and order.updated.
 * Simulates network disconnects, reconnect reconciliation, and handles idempotent versioning.
 */
class MockSocketServer {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  public connected: boolean = true;

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return this;
  }

  public off(event: string, callback?: EventCallback) {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(callback);
    }
    return this;
  }

  public emit(event: string, data?: unknown) {
    if (!this.connected) return;
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  // Helper to trigger simulated real-time nft update
  public broadcastNftUpdated(
    nftId: string,
    newPriceEth: string,
    newEditions: number
  ) {
    const nft = mockDb.updateNFT(nftId, {
      priceEth: newPriceEth,
      editionsAvailable: newEditions
    });

    const payload: NFTUpdatedEvent = {
      eventId: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nftId: nft.id,
      version: nft.version,
      priceEth: nft.priceEth,
      editionsAvailable: nft.editionsAvailable,
      timestamp: new Date().toISOString()
    };

    this.emit("nft.updated", payload);
    return payload;
  }

  // Helper to trigger simulated order status change
  public broadcastOrderUpdated(
    orderId: string,
    status: "confirmed" | "rejected",
    reason?: string
  ) {
    mockDb.updateOrderStatus(orderId, status, reason);
    const order = mockDb.getOrderById(orderId);
    if (!order) return null;

    const payload: OrderUpdatedEvent = {
      eventId: `evt-ord-${Date.now()}`,
      orderId: order.id,
      userId: order.userId,
      version: order.version,
      status: order.status,
      transactionHash: order.transactionHash,
      rejectionReason: order.rejectionReason,
      timestamp: new Date().toISOString()
    };

    this.emit("order.updated", payload);
    return payload;
  }

  public simulateDisconnect() {
    this.connected = false;
    this.emit("disconnect", "transport close");
  }

  public simulateReconnect() {
    this.connected = true;
    this.emit("connect");
  }
}

export const mockSocket = new MockSocketServer();

// Expose on window in dev/mock mode for tests and scenario controls
if (typeof window !== "undefined") {
  (window as any).__MOCK_SOCKET__ = mockSocket;
  (window as any).__MOCK_DB__ = mockDb;
}
