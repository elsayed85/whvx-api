import puppeteer from "puppeteer";

class TokenService {
  private static cache: { vbtk: string; vbtk_timestamp: string } | null = null;
  private static cacheTime: number = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration
  private static MAX_RETRIES = 3;
  private static RETRY_DELAY = 1000; // 1 second

  static async getSessionToken(): Promise<{
    vbtk: string;
    vbtk_timestamp: string;
  }> {
    console.log("[TokenService] Checking cache...");

    // Return cached tokens if they're still valid
    if (
      TokenService.cache &&
      Date.now() - TokenService.cacheTime < TokenService.CACHE_DURATION
    ) {
      console.log("[TokenService] Returning cached tokens");
      return TokenService.cache;
    }

    // Try to get new tokens with retries
    for (let i = 0; i < TokenService.MAX_RETRIES; i++) {
      try {
        const browser = await puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        // Set a reasonable timeout
        await page.setDefaultNavigationTimeout(30000);

        // Navigate to the website
        await page.goto("https://www.vidbinge.com/", {
          waitUntil: "networkidle0",
        });

        // Get session storage data
        const sessionData = await page.evaluate(() => {
          const vbtk = sessionStorage.getItem("vbtk");
          const vbtk_timestamp = sessionStorage.getItem("vbtk_timestamp");
          return {
            vbtk: vbtk || "",
            vbtk_timestamp: vbtk_timestamp || "",
          };
        });

        // Clean up
        await browser.close();

        // Validate the data
        if (!sessionData.vbtk || !sessionData.vbtk_timestamp) {
          throw new Error("Token or timestamp not found in session storage");
        }

        // Update cache
        TokenService.cache = sessionData;
        TokenService.cacheTime = Date.now();

        console.log("[TokenService] Successfully retrieved tokens");
        return sessionData;
      } catch (error) {
        console.error(`[TokenService] Attempt ${i + 1} failed:`, error);

        // If this was the last retry, throw the error
        if (i === TokenService.MAX_RETRIES - 1) {
          throw new Error(
            `Failed to get tokens after ${TokenService.MAX_RETRIES} attempts: ${error.message}`
          );
        }

        // Wait before retrying, with exponential backoff
        const delay = TokenService.RETRY_DELAY * Math.pow(2, i);
        console.log(
          `[TokenService] Waiting ${delay}ms before retry ${i + 2}...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // This should never be reached due to the error throwing above, but TypeScript needs it
    throw new Error("Unexpected error in getSessionToken");
  }

  // Helper method to clear cache if needed
  static clearCache(): void {
    TokenService.cache = null;
    TokenService.cacheTime = 0;
    console.log("[TokenService] Cache cleared");
  }
}

export { TokenService };
