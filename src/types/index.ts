export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  chain: "ethereum" | "polygon" | "arbitrum" | "optimism";
  label: string;
  isPrimary: boolean;
  balanceEth: string;
}

export type NFTCategory =
  | "Art"
  | "Collectibles"
  | "Gaming"
  | "Photography"
  | "Music"
  | "Virtual Worlds"
  | "Animation"
  | "Domains"
  | "Sports";

export interface NFT {
  id: string;
  tokenId: string;
  title: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatarUrl: string;
    verified: boolean;
  };
  collection: {
    id: string;
    name: string;
    floorPrice: string;
  };
  category: NFTCategory;
  imageUrl: string;
  mediaUrl?: string;
  priceEth: string;
  editionsTotal: number;
  editionsAvailable: number;
  likesCount: number;
  featured?: boolean;
  version: number;
  updatedAt: string;
}

export interface CartItem {
  nftId: string;
  quantity: number;
  unitPriceEth: string;
  nft: NFT;
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  discountEth: string;
  subtotalEth: string;
  networkFeeEth: string;
  totalEth: string;
  version: number;
}

export interface Quote {
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  couponApplied?: {
    code: string;
    discountPercentage: number;
  };
  items: {
    nftId: string;
    quantity: number;
    priceEth: string;
    available: number;
  }[];
  validUntil: string;
}

export type OrderStatus = "pending" | "confirmed" | "rejected";

export interface OrderItemSnapshot {
  nftId: string;
  tokenId: string;
  title: string;
  imageUrl: string;
  quantity: number;
  unitPriceEth: string;
}

export interface Order {
  id: string;
  idempotencyKey: string;
  userId: string;
  collector: {
    name: string;
    email: string;
    walletAddress: string;
    chain: string;
  };
  items: OrderItemSnapshot[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  couponCode?: string;
  transactionHash: string;
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: string;
  version: number;
}

// Real-time Socket Event Types
export interface NFTUpdatedEvent {
  eventId: string;
  nftId: string;
  version: number;
  priceEth: string;
  editionsAvailable: number;
  timestamp: string;
}

export interface OrderUpdatedEvent {
  eventId: string;
  orderId: string;
  userId: string;
  version: number;
  status: OrderStatus;
  transactionHash?: string;
  rejectionReason?: string;
  timestamp: string;
}
