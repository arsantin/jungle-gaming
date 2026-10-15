import { test, expect } from "@playwright/test";

test.describe("Cart and Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage and navigate
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("Add to cart, apply coupon and calculate totals", async ({ page }) => {
    await page.goto("/#/nft/nft-1");
    await expect(
      page.locator("h1").filter({ hasText: "Neon Odyssey #4092" })
    ).toBeVisible();

    // Add to cart
    const addToCartBtn = page.getByRole("button", { name: "Add to Cart" });
    await addToCartBtn.click();

    // Open Cart from Header
    const cartHeaderBtn = page.locator('button[aria-label="Shopping Cart"]');
    await cartHeaderBtn.click();
    await expect(page.locator("text=Your Bag")).toBeVisible();
    await expect(page.locator("text=Neon Odyssey #4092").first()).toBeVisible();

    // Apply Coupon
    const couponInput = page.getByPlaceholder("Promo or invite code");
    await couponInput.fill("SAVE10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.locator("text=SAVE10 (10% OFF)").first()).toBeVisible();
  });

  test("Complete purchase flow: Login, Checkout, Confirmation", async ({
    page
  }) => {
    // Login first
    await page.goto("/#/login");
    await page
      .getByPlaceholder("alex@domain.eth")
      .fill("alex.rivera@example.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page
      .getByRole("button", { name: "Sign In to Collector Account" })
      .click();
    await expect(page.locator("text=Alex Rivera").first()).toBeVisible({
      timeout: 10000
    });

    // Add NFT to cart
    await page.goto("/#/nft/nft-2");
    await page.getByRole("button", { name: "Add to Cart" }).click();

    // Navigate to checkout
    await page.goto("/#/checkout");
    await expect(page.locator("text=Checkout & Settlement")).toBeVisible();

    // Confirm purchase
    const confirmBtn = page.getByRole("button", {
      name: /Confirm & Transact/i
    });
    await confirmBtn.click();

    // Check Order Confirmation view
    await expect(page.locator("text=Transaction Settled")).toBeVisible({
      timeout: 15000
    });
    await expect(page.locator("text=0x").first()).toBeVisible();
  });
});
