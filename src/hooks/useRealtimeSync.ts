import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mockSocket } from "@/mocks/socket";
import type { NFTUpdatedEvent, OrderUpdatedEvent } from "@/types";

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(mockSocket.connected);
  const processedEventIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      // On reconnect, reconcile stale data from REST API
      queryClient.invalidateQueries({ queryKey: ["nfts"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNftUpdated = (data: unknown) => {
      const evt = data as NFTUpdatedEvent;
      if (!evt || !evt.eventId) return;
      // Idempotency check: ignore duplicate events
      if (processedEventIds.current.has(evt.eventId)) return;
      processedEventIds.current.add(evt.eventId);

      // Invalidate queries so TanStack Query gets the newest verified state
      queryClient.invalidateQueries({ queryKey: ["nfts"] });
      queryClient.invalidateQueries({ queryKey: ["nft", evt.nftId] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      window.dispatchEvent(
        new CustomEvent("toast:notification", {
          detail: {
            title: "Real-Time Update",
            message: `NFT details updated live: ${evt.priceEth} ETH (${evt.editionsAvailable} available)`,
            type: "info"
          }
        })
      );
    };

    const handleOrderUpdated = (data: unknown) => {
      const evt = data as OrderUpdatedEvent;
      if (!evt || !evt.eventId) return;
      if (processedEventIds.current.has(evt.eventId)) return;
      processedEventIds.current.add(evt.eventId);

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", evt.orderId] });

      window.dispatchEvent(
        new CustomEvent("toast:notification", {
          detail: {
            title: "Order Status Update",
            message: `Order #${evt.orderId} status changed to ${evt.status.toUpperCase()}`,
            type: evt.status === "confirmed" ? "success" : "error"
          }
        })
      );
    };

    mockSocket.on("connect", handleConnect);
    mockSocket.on("disconnect", handleDisconnect);
    mockSocket.on("nft.updated", handleNftUpdated);
    mockSocket.on("order.updated", handleOrderUpdated);

    return () => {
      mockSocket.off("connect", handleConnect);
      mockSocket.off("disconnect", handleDisconnect);
      mockSocket.off("nft.updated", handleNftUpdated);
      mockSocket.off("order.updated", handleOrderUpdated);
    };
  }, [queryClient]);

  return {
    isConnected
  };
}
