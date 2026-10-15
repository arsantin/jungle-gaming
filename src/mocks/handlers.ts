import { http, HttpResponse, delay } from "msw";
import { mockDb } from "./db";
import { MOCK_COUPONS } from "./fixtures";

function getSessionUserId(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  // In our mock system, the token can simply be the userId, or format: "token-<userId>"
  if (token.startsWith("token-")) {
    return token.replace("token-", "");
  }
  return token;
}

export const handlers = [
  // --- Scenario & Latency simulation hook ---
  http.all("/api/*", async () => {
    if (mockDb.scenario.latencyMs > 0) {
      await delay(mockDb.scenario.latencyMs);
    }
    if (mockDb.scenario.simulatedError === "500") {
      return HttpResponse.json(
        { error: "Internal Server Error (Simulated 500)" },
        { status: 500 }
      );
    }
    if (mockDb.scenario.simulatedError === "network") {
      return HttpResponse.error();
    }
    return undefined; // continue to specific handler
  }),

  // Scenario Admin Endpoints
  http.get("/api/scenario", () => {
    return HttpResponse.json(mockDb.scenario);
  }),

  http.post("/api/scenario", async ({ request }) => {
    const body = (await request.json()) as any;
    if (body.latencyMs !== undefined)
      mockDb.scenario.latencyMs = body.latencyMs;
    if (body.simulatedError !== undefined)
      mockDb.scenario.simulatedError = body.simulatedError;
    return HttpResponse.json(mockDb.scenario);
  }),

  http.post("/api/scenario/reset", () => {
    mockDb.reset();
    return HttpResponse.json({
      success: true,
      message: "Database reset to initial fixtures"
    });
  }),

  // --- Auth & Session ---
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = (await request.json()) as any;
    const user = mockDb.getUserByEmail(email);
    if (!user || !mockDb.checkPassword(email, password)) {
      return HttpResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = `token-${user.id}`;
    return HttpResponse.json({
      user,
      token
    });
  }),

  http.post("/api/auth/register", async ({ request }) => {
    const { name, email, password } = (await request.json()) as any;
    if (!name || !email || !password) {
      return HttpResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = mockDb.getUserByEmail(email);
    if (existing) {
      return HttpResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const user = mockDb.createUser(name, email, password);
    const token = `token-${user.id}`;
    return HttpResponse.json({ user, token }, { status: 201 });
  }),

  http.get("/api/auth/me", ({ request }) => {
    if (mockDb.scenario.simulatedError === "session_expired") {
      return HttpResponse.json({ error: "Session expired" }, { status: 401 });
    }
    const userId = getSessionUserId(request);
    if (!userId) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = mockDb.getUserById(userId);
    if (!user) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }
    return HttpResponse.json({ user });
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ success: true });
  }),

  // --- Profile ---
  http.patch("/api/profile", async ({ request }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updates = (await request.json()) as any;
    try {
      const user = mockDb.updateUser(userId, updates);
      return HttpResponse.json({ user });
    } catch (err: any) {
      return HttpResponse.json({ error: err.message }, { status: 400 });
    }
  }),

  http.post("/api/profile/change-password", async ({ request }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = mockDb.getUserById(userId);
    if (!user)
      return HttpResponse.json({ error: "User not found" }, { status: 404 });

    const { currentPassword, newPassword } = (await request.json()) as any;
    try {
      mockDb.updatePassword(user.email, currentPassword, newPassword);
      return HttpResponse.json({
        success: true,
        message: "Password updated successfully"
      });
    } catch (err: any) {
      return HttpResponse.json({ error: err.message }, { status: 400 });
    }
  }),

  // --- Wallets ---
  http.get("/api/wallets", ({ request }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    const wallets = mockDb.getWallets(userId);
    return HttpResponse.json({ wallets });
  }),

  http.post("/api/wallets", async ({ request }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = (await request.json()) as any;
    const wallet = mockDb.addWallet(userId, body);
    return HttpResponse.json({ wallet }, { status: 201 });
  }),

  http.patch("/api/wallets/:id", async ({ request, params }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = (await request.json()) as any;
    try {
      const wallet = mockDb.updateWallet(userId, params.id as string, body);
      return HttpResponse.json({ wallet });
    } catch (err: any) {
      return HttpResponse.json({ error: err.message }, { status: 404 });
    }
  }),

  // --- NFTs (Catalog & Detail) ---
  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("q")?.toLowerCase() || "";
    const category = url.searchParams.get("category") || "";
    const minPrice = parseFloat(url.searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(url.searchParams.get("maxPrice") || "999999");
    const status = url.searchParams.get("status"); // 'all', 'available', 'sold_out'
    const sort = url.searchParams.get("sort") || "recommended";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "8", 10);

    let results = [...mockDb.getNFTs()];

    if (search) {
      results = results.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.creator.name.toLowerCase().includes(search) ||
          n.collection.name.toLowerCase().includes(search)
      );
    }

    if (category && category !== "All") {
      results = results.filter(
        (n) => n.category.toLowerCase() === category.toLowerCase()
      );
    }

    results = results.filter((n) => {
      const price = parseFloat(n.priceEth);
      return price >= minPrice && price <= maxPrice;
    });

    if (status === "available") {
      results = results.filter((n) => n.editionsAvailable > 0);
    } else if (status === "sold_out") {
      results = results.filter((n) => n.editionsAvailable === 0);
    }

    if (sort === "price_asc") {
      results.sort((a, b) => parseFloat(a.priceEth) - parseFloat(b.priceEth));
    } else if (sort === "price_desc") {
      results.sort((a, b) => parseFloat(b.priceEth) - parseFloat(a.priceEth));
    } else if (sort === "most_popular") {
      results.sort((a, b) => b.likesCount - a.likesCount);
    } else if (sort === "newest") {
      results.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    const total = results.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const items = results.slice(offset, offset + limit);

    return HttpResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  }),

  http.get("/api/nfts/:id", ({ params }) => {
    const nft = mockDb.getNFTById(params.id as string);
    if (!nft) {
      return HttpResponse.json({ error: "NFT not found" }, { status: 404 });
    }
    return HttpResponse.json({ nft });
  }),

  // --- Favorites ---
  http.get("/api/favorites", ({ request }) => {
    const userId = getSessionUserId(request);
    if (!userId) {
      return HttpResponse.json({ favorites: [], favoriteIds: [] });
    }
    const favIds = mockDb.getFavorites(userId);
    const nfts = favIds
      .map((id) => mockDb.getNFTById(id))
      .filter((n): n is NonNullable<typeof n> => !!n);
    return HttpResponse.json({ favorites: nfts, favoriteIds: favIds });
  }),

  http.post("/api/favorites/:id/toggle", ({ request, params }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    const nftId = params.id as string;
    const updated = mockDb.toggleFavorite(userId, nftId);
    const isFavorited = updated.includes(nftId);
    return HttpResponse.json({ isFavorited, favoriteIds: updated });
  }),

  // --- Cart ---
  http.get("/api/cart", ({ request }) => {
    const userId = getSessionUserId(request) || "guest";
    const cart = mockDb.getCart(userId);
    return HttpResponse.json({ cart });
  }),

  http.post("/api/cart/add", async ({ request }) => {
    const userId = getSessionUserId(request) || "guest";
    const { nftId, quantity } = (await request.json()) as any;
    try {
      const cart = mockDb.addToCart(userId, nftId, quantity || 1);
      return HttpResponse.json({ cart });
    } catch (err: any) {
      return HttpResponse.json({ error: err.message }, { status: 400 });
    }
  }),

  http.patch("/api/cart/items/:id", async ({ request, params }) => {
    const userId = getSessionUserId(request) || "guest";
    const { quantity } = (await request.json()) as any;
    try {
      const cart = mockDb.updateCartItem(userId, params.id as string, quantity);
      return HttpResponse.json({ cart });
    } catch (err: any) {
      return HttpResponse.json({ error: err.message }, { status: 400 });
    }
  }),

  http.delete("/api/cart/items/:id", ({ request, params }) => {
    const userId = getSessionUserId(request) || "guest";
    const cart = mockDb.removeFromCart(userId, params.id as string);
    return HttpResponse.json({ cart });
  }),

  http.post("/api/cart/coupon", async ({ request }) => {
    const userId = getSessionUserId(request) || "guest";
    const { code } = (await request.json()) as any;
    try {
      const cart = mockDb.applyCoupon(userId, code);
      return HttpResponse.json({ cart });
    } catch (err: any) {
      return HttpResponse.json({ error: err.message }, { status: 400 });
    }
  }),

  http.delete("/api/cart/coupon", ({ request }) => {
    const userId = getSessionUserId(request) || "guest";
    const cart = mockDb.removeCoupon(userId);
    return HttpResponse.json({ cart });
  }),

  http.post("/api/cart/merge", async ({ request }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { guestKey = "guest" } = (await request.json()) as any;
    mockDb.mergeCart(guestKey, userId);
    const cart = mockDb.getCart(userId);
    return HttpResponse.json({ cart });
  }),

  // --- Quote (Cotação) ---
  http.post("/api/quote", async ({ request }) => {
    const { items, couponCode } = (await request.json()) as any;
    if (!items || !Array.isArray(items)) {
      return HttpResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const quoteItems: any[] = [];

    for (const item of items) {
      const nft = mockDb.getNFTById(item.nftId);
      if (!nft) {
        return HttpResponse.json(
          { error: `NFT ${item.nftId} not found` },
          { status: 404 }
        );
      }
      if (nft.editionsAvailable < item.quantity) {
        return HttpResponse.json(
          {
            error: `Requested quantity exceeds available editions for ${nft.title}`,
            code: "INSUFFICIENT_EDITIONS",
            available: nft.editionsAvailable
          },
          { status: 409 }
        );
      }
      subtotal += parseFloat(nft.priceEth) * item.quantity;
      quoteItems.push({
        nftId: nft.id,
        quantity: item.quantity,
        priceEth: nft.priceEth,
        available: nft.editionsAvailable
      });
    }

    let discount = 0;
    if (couponCode) {
      const upper = couponCode.trim().toUpperCase();
      if (!MOCK_COUPONS[upper]) {
        return HttpResponse.json({ error: "Invalid coupon" }, { status: 400 });
      }
      discount = (subtotal * MOCK_COUPONS[upper]) / 100;
    }

    const networkFee = items.length > 0 ? 0.005 : 0;
    const total = Math.max(0, subtotal - discount + networkFee);

    return HttpResponse.json({
      subtotalEth: subtotal.toFixed(4),
      discountEth: discount.toFixed(4),
      networkFeeEth: networkFee.toFixed(4),
      totalEth: total.toFixed(4),
      items: quoteItems,
      couponApplied: couponCode
        ? {
            code: couponCode,
            discountPercentage: MOCK_COUPONS[couponCode.toUpperCase()]
          }
        : undefined,
      validUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });
  }),

  // --- Orders ---
  http.post("/api/orders", async ({ request }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });

    const idempotencyKey = request.headers.get("Idempotency-Key");
    if (!idempotencyKey) {
      return HttpResponse.json(
        { error: "Missing Idempotency-Key header" },
        { status: 400 }
      );
    }

    if (mockDb.scenario.simulatedError === "payment_declined") {
      return HttpResponse.json(
        {
          error: "Payment declined by simulated network or wallet provider",
          code: "PAYMENT_DECLINED"
        },
        { status: 402 }
      );
    }

    const body = (await request.json()) as any;
    const { collector, items, couponCode } = body;

    try {
      const order = mockDb.createOrder(
        userId,
        idempotencyKey,
        collector,
        items,
        couponCode
      );
      return HttpResponse.json({ order }, { status: 201 });
    } catch (err: any) {
      return HttpResponse.json({ error: err.message }, { status: 400 });
    }
  }),

  http.get("/api/orders", ({ request }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orders = mockDb.getOrders(userId);
    return HttpResponse.json({ orders });
  }),

  http.get("/api/orders/:id", ({ request, params }) => {
    const userId = getSessionUserId(request);
    if (!userId)
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    const order = mockDb.getOrderById(params.id as string);
    if (!order)
      return HttpResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.userId !== userId) {
      return HttpResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return HttpResponse.json({ order });
  })
];
