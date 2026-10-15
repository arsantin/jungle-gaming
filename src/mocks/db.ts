import type { Cart, NFT, Order, OrderStatus, User, Wallet } from "../types";
import { MOCK_COUPONS, MOCK_NFTS, MOCK_USERS, MOCK_WALLETS } from "./fixtures";

export interface ScenarioConfig {
  latencyMs: number;
  simulatedError:
    | "none"
    | "network"
    | "500"
    | "session_expired"
    | "price_changed"
    | "payment_declined"
    | "timeout";
}

class MockDatabase {
  private users: User[] = [];
  private nfts: NFT[] = [];
  private wallets: Wallet[] = [];
  private favorites: Record<string, string[]> = {}; // userId -> nftIds[]
  private cart: Record<string, Cart> = {}; // userIdOrSession -> Cart
  private orders: Order[] = [];
  private passwords: Record<string, string> = {}; // userId -> password
  public scenario: ScenarioConfig = {
    latencyMs: 150,
    simulatedError: "none"
  };

  constructor() {
    this.reset();
  }

  public reset() {
    this.users = JSON.parse(JSON.stringify(MOCK_USERS));
    this.nfts = JSON.parse(JSON.stringify(MOCK_NFTS));
    this.wallets = JSON.parse(JSON.stringify(MOCK_WALLETS));
    this.favorites = {
      "user-1": ["nft-1", "nft-3"],
      "user-2": ["nft-2"]
    };
    this.cart = {
      guest: {
        items: [],
        discountEth: "0.00",
        subtotalEth: "0.00",
        networkFeeEth: "0.005",
        totalEth: "0.005",
        version: 1
      },
      "user-1": {
        items: [],
        discountEth: "0.00",
        subtotalEth: "0.00",
        networkFeeEth: "0.005",
        totalEth: "0.005",
        version: 1
      },
      "user-2": {
        items: [],
        discountEth: "0.00",
        subtotalEth: "0.00",
        networkFeeEth: "0.005",
        totalEth: "0.005",
        version: 1
      }
    };
    this.orders = [];
    this.passwords = {
      "alex.rivera@example.com": "password123",
      "elena.rostova@example.com": "password123"
    };
    this.scenario = {
      latencyMs: 100,
      simulatedError: "none"
    };
  }

  public getUsers() {
    return this.users;
  }

  public getUserById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string) {
    return this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public checkPassword(email: string, pass: string) {
    return this.passwords[email.toLowerCase()] === pass;
  }

  public createUser(name: string, email: string, pass: string): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bio: "",
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.passwords[email.toLowerCase()] = pass;
    this.cart[newUser.id] = {
      items: [],
      discountEth: "0.00",
      subtotalEth: "0.00",
      networkFeeEth: "0.005",
      totalEth: "0.005",
      version: 1
    };
    // Create initial wallet
    this.wallets.push({
      id: `wallet-${Date.now()}`,
      userId: newUser.id,
      address: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
      chain: "ethereum",
      label: "Main Ethereum Wallet",
      isPrimary: true,
      balanceEth: "10.00"
    });
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User {
    const user = this.getUserById(id);
    if (!user) throw new Error("User not found");
    Object.assign(user, updates);
    return user;
  }

  public updatePassword(email: string, oldPass: string, newPass: string) {
    if (!this.checkPassword(email, oldPass)) {
      throw new Error("Current password does not match");
    }
    this.passwords[email.toLowerCase()] = newPass;
  }

  public getNFTs() {
    return this.nfts;
  }

  public getNFTById(id: string) {
    return this.nfts.find((n) => n.id === id);
  }

  public updateNFT(id: string, updates: Partial<NFT>): NFT {
    const nft = this.getNFTById(id);
    if (!nft) throw new Error("NFT not found");
    Object.assign(nft, updates);
    nft.version += 1;
    nft.updatedAt = new Date().toISOString();
    return nft;
  }

  public getFavorites(userId: string): string[] {
    return this.favorites[userId] || [];
  }

  public toggleFavorite(userId: string, nftId: string): string[] {
    if (!this.favorites[userId]) {
      this.favorites[userId] = [];
    }
    const idx = this.favorites[userId].indexOf(nftId);
    if (idx >= 0) {
      this.favorites[userId].splice(idx, 1);
    } else {
      this.favorites[userId].push(nftId);
    }
    return this.favorites[userId];
  }

  public getWallets(userId: string): Wallet[] {
    return this.wallets.filter((w) => w.userId === userId);
  }

  public addWallet(
    userId: string,
    data: Omit<Wallet, "id" | "userId">
  ): Wallet {
    if (data.isPrimary) {
      this.wallets.forEach((w) => {
        if (w.userId === userId) w.isPrimary = false;
      });
    }
    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      userId,
      ...data
    };
    this.wallets.push(newWallet);
    return newWallet;
  }

  public updateWallet(
    userId: string,
    walletId: string,
    updates: Partial<Wallet>
  ): Wallet {
    const wallet = this.wallets.find(
      (w) => w.id === walletId && w.userId === userId
    );
    if (!wallet) throw new Error("Wallet not found");
    if (updates.isPrimary) {
      this.wallets.forEach((w) => {
        if (w.userId === userId) w.isPrimary = false;
      });
    }
    Object.assign(wallet, updates);
    return wallet;
  }

  public getCart(ownerKey: string): Cart {
    if (!this.cart[ownerKey]) {
      this.cart[ownerKey] = {
        items: [],
        discountEth: "0.00",
        subtotalEth: "0.00",
        networkFeeEth: "0.005",
        totalEth: "0.005",
        version: 1
      };
    }
    this.recalculateCart(ownerKey);
    return this.cart[ownerKey];
  }

  public mergeCart(fromGuestKey: string, toUserKey: string) {
    const guestCart = this.getCart(fromGuestKey);
    const userCart = this.getCart(toUserKey);

    guestCart.items.forEach((gItem) => {
      const existing = userCart.items.find((u) => u.nftId === gItem.nftId);
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + gItem.quantity,
          existing.nft.editionsAvailable
        );
      } else {
        userCart.items.push(gItem);
      }
    });

    guestCart.items = [];
    this.recalculateCart(toUserKey);
    this.recalculateCart(fromGuestKey);
  }

  public addToCart(ownerKey: string, nftId: string, quantity: number): Cart {
    const cart = this.getCart(ownerKey);
    const nft = this.getNFTById(nftId);
    if (!nft) throw new Error("NFT not found");
    if (nft.editionsAvailable <= 0) throw new Error("NFT is sold out");

    const existing = cart.items.find((i) => i.nftId === nftId);
    const maxAllowed = nft.editionsAvailable;

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, maxAllowed);
      existing.unitPriceEth = nft.priceEth;
      existing.nft = nft;
    } else {
      cart.items.push({
        nftId,
        quantity: Math.min(quantity, maxAllowed),
        unitPriceEth: nft.priceEth,
        nft
      });
    }

    cart.version += 1;
    this.recalculateCart(ownerKey);
    return cart;
  }

  public updateCartItem(
    ownerKey: string,
    nftId: string,
    quantity: number
  ): Cart {
    const cart = this.getCart(ownerKey);
    const item = cart.items.find((i) => i.nftId === nftId);
    if (!item) throw new Error("Item not in cart");

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.nftId !== nftId);
    } else {
      const nft = this.getNFTById(nftId) || item.nft;
      item.quantity = Math.min(quantity, nft.editionsAvailable);
      item.unitPriceEth = nft.priceEth;
      item.nft = nft;
    }

    cart.version += 1;
    this.recalculateCart(ownerKey);
    return cart;
  }

  public removeFromCart(ownerKey: string, nftId: string): Cart {
    const cart = this.getCart(ownerKey);
    cart.items = cart.items.filter((i) => i.nftId !== nftId);
    cart.version += 1;
    this.recalculateCart(ownerKey);
    return cart;
  }

  public applyCoupon(ownerKey: string, code: string): Cart {
    const cart = this.getCart(ownerKey);
    const upper = code.trim().toUpperCase();
    if (!MOCK_COUPONS[upper]) {
      throw new Error("Invalid or expired coupon code");
    }
    cart.couponCode = upper;
    cart.version += 1;
    this.recalculateCart(ownerKey);
    return cart;
  }

  public removeCoupon(ownerKey: string): Cart {
    const cart = this.getCart(ownerKey);
    cart.couponCode = undefined;
    cart.version += 1;
    this.recalculateCart(ownerKey);
    return cart;
  }

  private recalculateCart(ownerKey: string) {
    const cart = this.cart[ownerKey];
    if (!cart) return;

    let subtotal = 0;
    cart.items.forEach((item) => {
      // Sync unit price with live NFT price if changed
      const live = this.getNFTById(item.nftId);
      if (live) {
        item.unitPriceEth = live.priceEth;
        item.nft = live;
      }
      subtotal += parseFloat(item.unitPriceEth) * item.quantity;
    });

    let discount = 0;
    if (cart.couponCode && MOCK_COUPONS[cart.couponCode]) {
      const pct = MOCK_COUPONS[cart.couponCode];
      discount = (subtotal * pct) / 100;
    }

    const networkFee = cart.items.length > 0 ? 0.005 : 0;
    const total = Math.max(0, subtotal - discount + networkFee);

    cart.subtotalEth = subtotal.toFixed(4);
    cart.discountEth = discount.toFixed(4);
    cart.networkFeeEth = networkFee.toFixed(4);
    cart.totalEth = total.toFixed(4);
  }

  public createOrder(
    userId: string,
    idempotencyKey: string,
    collector: {
      name: string;
      email: string;
      walletAddress: string;
      chain: string;
    },
    items: { nftId: string; quantity: number }[],
    couponCode?: string
  ): Order {
    // Check idempotency
    const existing = this.orders.find(
      (o) => o.idempotencyKey === idempotencyKey
    );
    if (existing) {
      return existing;
    }

    let subtotal = 0;
    const orderItems: Order["items"] = [];

    for (const item of items) {
      const nft = this.getNFTById(item.nftId);
      if (!nft) throw new Error(`NFT not found: ${item.nftId}`);
      if (nft.editionsAvailable < item.quantity) {
        throw new Error(
          `Insufficient editions for "${nft.title}". Requested: ${item.quantity}, Available: ${nft.editionsAvailable}`
        );
      }
      const itemSubtotal = parseFloat(nft.priceEth) * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        nftId: nft.id,
        tokenId: nft.tokenId,
        title: nft.title,
        imageUrl: nft.imageUrl,
        quantity: item.quantity,
        unitPriceEth: nft.priceEth
      });
    }

    let discount = 0;
    if (couponCode && MOCK_COUPONS[couponCode.toUpperCase()]) {
      const pct = MOCK_COUPONS[couponCode.toUpperCase()];
      discount = (subtotal * pct) / 100;
    }

    const networkFee = 0.005;
    const total = Math.max(0, subtotal - discount + networkFee);

    // Deduct inventory
    for (const item of items) {
      const nft = this.getNFTById(item.nftId);
      if (nft) {
        nft.editionsAvailable = Math.max(
          0,
          nft.editionsAvailable - item.quantity
        );
        nft.version += 1;
      }
    }

    // Remove purchased items from user's cart
    const userCart = this.getCart(userId);
    userCart.items = userCart.items.filter(
      (cItem) => !items.some((pur) => pur.nftId === cItem.nftId)
    );
    userCart.version += 1;
    this.recalculateCart(userId);

    const order: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      idempotencyKey,
      userId,
      collector,
      items: orderItems,
      subtotalEth: subtotal.toFixed(4),
      discountEth: discount.toFixed(4),
      networkFeeEth: networkFee.toFixed(4),
      totalEth: total.toFixed(4),
      couponCode,
      transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      version: 1
    };

    this.orders.push(order);
    return order;
  }

  public getOrders(userId: string): Order[] {
    return this.orders.filter((o) => o.userId === userId);
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  public updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    reason?: string
  ) {
    const order = this.getOrderById(orderId);
    if (!order) return;
    order.status = status;
    if (reason) order.rejectionReason = reason;
    order.version += 1;
  }
}

export const mockDb = new MockDatabase();
