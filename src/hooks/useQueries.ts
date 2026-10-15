import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Cart, NFT, Order, Quote, Wallet } from "@/types";

export interface NFTQueryParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useNFTs(params: NFTQueryParams = {}) {
  return useQuery({
    queryKey: ["nfts", params],
    queryFn: async () => {
      const res = await api.get<{
        items: NFT[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>("/nfts", { params });
      return res.data;
    }
  });
}

export function useNFT(id: string) {
  return useQuery({
    queryKey: ["nft", id],
    queryFn: async () => {
      const res = await api.get<{ nft: NFT }>(`/nfts/${id}`);
      return res.data.nft;
    },
    enabled: !!id
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await api.get<{ favorites: NFT[]; favoriteIds: string[] }>(
        "/favorites"
      );
      return res.data;
    }
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nftId: string) => {
      const res = await api.post<{
        isFavorited: boolean;
        favoriteIds: string[];
      }>(`/favorites/${nftId}/toggle`);
      return res.data;
    },
    // Optimistic update
    onMutate: async (nftId: string) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previous = queryClient.getQueryData<{
        favorites: NFT[];
        favoriteIds: string[];
      }>(["favorites"]);

      if (previous) {
        const isFav = previous.favoriteIds.includes(nftId);
        const updatedIds = isFav
          ? previous.favoriteIds.filter((id) => id !== nftId)
          : [...previous.favoriteIds, nftId];

        queryClient.setQueryData(["favorites"], {
          ...previous,
          favoriteIds: updatedIds
        });
      }
      return { previous };
    },
    onError: (_err, _nftId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["favorites"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    }
  });
}

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get<{ cart: Cart }>("/cart");
      return res.data.cart;
    }
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      nftId,
      quantity
    }: {
      nftId: string;
      quantity: number;
    }) => {
      const res = await api.post<{ cart: Cart }>("/cart/add", {
        nftId,
        quantity
      });
      return res.data.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    }
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      nftId,
      quantity
    }: {
      nftId: string;
      quantity: number;
    }) => {
      const res = await api.patch<{ cart: Cart }>(`/cart/items/${nftId}`, {
        quantity
      });
      return res.data.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    }
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nftId: string) => {
      const res = await api.delete<{ cart: Cart }>(`/cart/items/${nftId}`);
      return res.data.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    }
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post<{ cart: Cart }>("/cart/coupon", { code });
      return res.data.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    }
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete<{ cart: Cart }>("/cart/coupon");
      return res.data.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    }
  });
}

export function useWallets() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const res = await api.get<{ wallets: Wallet[] }>("/wallets");
      return res.data.wallets;
    }
  });
}

export function useAddWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Wallet, "id" | "userId">) => {
      const res = await api.post<{ wallet: Wallet }>("/wallets", data);
      return res.data.wallet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    }
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: string;
      updates: Partial<Wallet>;
    }) => {
      const res = await api.patch<{ wallet: Wallet }>(
        `/wallets/${id}`,
        updates
      );
      return res.data.wallet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    }
  });
}

export function useCreateQuote() {
  return useMutation({
    mutationFn: async (data: {
      items: { nftId: string; quantity: number }[];
      couponCode?: string;
    }) => {
      const res = await api.post<Quote>("/quote", data);
      return res.data;
    }
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      idempotencyKey,
      collector,
      items,
      couponCode
    }: {
      idempotencyKey: string;
      collector: {
        name: string;
        email: string;
        walletAddress: string;
        chain: string;
      };
      items: { nftId: string; quantity: number }[];
      couponCode?: string;
    }) => {
      const res = await api.post<{ order: Order }>(
        "/orders",
        { collector, items, couponCode },
        { headers: { "Idempotency-Key": idempotencyKey } }
      );
      return res.data.order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["nfts"] });
      queryClient.setQueryData(["order", order.id], order);
    }
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await api.get<{ order: Order }>(`/orders/${orderId}`);
      return res.data.order;
    },
    enabled: !!orderId
  });
}
