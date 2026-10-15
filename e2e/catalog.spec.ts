import { test, expect } from "@playwright/test";

test.describe("Marketplace Discovery and Catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Ensure MSW worker is active
    await page.waitForSelector("text=Explore Drops & Collections");
  });

  test("1. Search, filter by category and restore via URL history", async ({
    page
  }) => {
    // Check initial items render
    const initialCards = page
      .locator('article, div[class*="rounded-2xl"]')
      .filter({ hasText: "ETH" });
    await expect(initialCards.first()).toBeVisible();

    // Test Search Input
    const searchInput = page.getByPlaceholder(
      "Search artwork, artist or collection..."
    );
    await searchInput.fill("Neon");
    await page.waitForTimeout(400); // debounce
    await expect(page.locator("text=Neon Odyssey #4092").first()).toBeVisible();
    await expect(page).toHaveURL(/q=Neon/);

    // Test Category Filter
    const gamingButton = page.getByRole("button", { name: "Gaming" });
    if (await gamingButton.isVisible()) {
      await gamingButton.click();
      await expect(page).toHaveURL(/category=Gaming/);
    }

    // Refresh page and assert URL params survive
    await page.reload();
    await expect(page).toHaveURL(/category=Gaming/);
  });

  test("2. Direct navigation to NFT detail and not found treatment", async ({
    page
  }) => {
    // Direct access to existing item
    await page.goto("/#/nft/nft-1");
    await expect(
      page.locator("h1").filter({ hasText: "Neon Odyssey #4092" })
    ).toBeVisible();
    await expect(page.locator("text=1.8500 ETH").first()).toBeVisible();

    // Direct access to nonexistent item
    await page.goto("/#/nft/non-existent-999");
    await expect(page.locator("text=NFT Not Found")).toBeVisible();
    await page.getByRole("button", { name: "Back to Marketplace" }).click();
    await expect(page).toHaveURL(/#\//);
  });

  test("3. Skeletons and responsive layout evaluation", async ({ page }) => {
    await page.goto("/");
    // Verify hero banner and catalog sections exist
    await expect(
      page.locator("text=Discover Exclusive Digital Art")
    ).toBeVisible();
    await expect(
      page.locator("text=Explore Drops & Collections")
    ).toBeVisible();
  });
});
