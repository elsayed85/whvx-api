"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class TokenService {
    static cache = null;
    static cacheTime = 0;
    static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration
    static MAX_RETRIES = 3;
    static RETRY_DELAY = 1000; // 1 second
    static async getSessionToken() {
        console.log("[TokenService] Checking cache...");
        if (TokenService.cache &&
            Date.now() - TokenService.cacheTime < TokenService.CACHE_DURATION) {
            console.log("[TokenService] Returning cached tokens");
            return TokenService.cache;
        }
        for (let i = 0; i < TokenService.MAX_RETRIES; i++) {
            try {
                const browser = await puppeteer_1.default.launch({
                    headless: true, // Changed from 'new' to true
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                const page = await browser.newPage();
                await page.setDefaultNavigationTimeout(30000);
                await page.goto('https://www.vidbinge.com/', {
                    waitUntil: 'networkidle0',
                });
                const sessionData = await page.evaluate(() => {
                    const vbtk = sessionStorage.getItem('vbtk');
                    const vbtk_timestamp = sessionStorage.getItem('vbtk_timestamp');
                    return {
                        vbtk: vbtk || '',
                        vbtk_timestamp: vbtk_timestamp || '',
                    };
                });
                await browser.close();
                if (!sessionData.vbtk || !sessionData.vbtk_timestamp) {
                    throw new Error('Token or timestamp not found in session storage');
                }
                TokenService.cache = sessionData;
                TokenService.cacheTime = Date.now();
                console.log("[TokenService] Successfully retrieved tokens");
                return sessionData;
            }
            catch (error) {
                console.error(`[TokenService] Attempt ${i + 1} failed:`, error);
                if (i === TokenService.MAX_RETRIES - 1) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : 'Unknown error occurred';
                    throw new Error(`Failed to get tokens after ${TokenService.MAX_RETRIES} attempts: ${errorMessage}`);
                }
                const delay = TokenService.RETRY_DELAY * Math.pow(2, i);
                console.log(`[TokenService] Waiting ${delay}ms before retry ${i + 2}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Unexpected error in getSessionToken');
    }
    static clearCache() {
        TokenService.cache = null;
        TokenService.cacheTime = 0;
        console.log("[TokenService] Cache cleared");
    }
}
exports.TokenService = TokenService;
