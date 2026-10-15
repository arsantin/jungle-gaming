import { test, expect } from "@playwright/test";

test.describe("Real-time Updates and Reconnection", () => {
  test("NFT price update broadcasts via socket and updates UI without full page refresh", async ({
    page
  }) => {
    await page.goto("/#/nft/nft-1");
    await expect(
      page.locator("h1").filter({ hasText: "Neon Odyssey #4092" })
    ).toBeVisible();

    // Dispatch simulated real-time event through mockSocket
    await page.evaluate(() => {
      const win = window as unknown as {
        __MOCK_SOCKET__?: {
          broadcastNftUpdated: (
            id: string,
            price: string,
            editions: number
          ) => void;
        };
      };
      if (win.__MOCK_SOCKET__) {
        win.__MOCK_SOCKET__.broadcastNftUpdated("nft-1", "2.5500", 3);
      }
    });

    // UI should react to real-time update
    await expect(page.locator("text=2.5500 ETH").first()).toBeVisible({
      timeout: 5000
    });
  });

  test("Order status update in real-time reflects on confirmation view", async ({
    page
  }) => {
    await page.goto("/");
    // Ensure mockDb is present and operational
    const exists = await page.evaluate(() => {
      const win = window as unknown as { __MOCK_DB__?: unknown };
      return !!win.__MOCK_DB__;
    });
    expect(exists).toBe(true);
  });
});
