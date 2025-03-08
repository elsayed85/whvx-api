"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/scraper.ts
const express_1 = __importDefault(require("express"));
const scraperService_1 = require("../services/scraperService");
const router = express_1.default.Router();
router.get("/scrape", async (req, res) => {
    const { title, year, season, episode, tmdbId, imdbId } = req.query;
    if (!title || !year) {
        return res.status(400).json({ error: "Title and year are required" });
    }
    const query = {
        title: String(title),
        year: Number(year),
        season: season ? Number(season) : undefined,
        episode: episode ? Number(episode) : undefined,
        tmdbId: tmdbId ? String(tmdbId) : undefined,
        imdbId: imdbId ? String(imdbId) : undefined,
    };
    try {
        const results = await (0, scraperService_1.scrapeFromAllProviders)(query);
        res.json({ results });
    }
    catch (error) {
        const errorMessage = error instanceof Error
            ? error.message
            : 'An unknown error occurred';
        res.status(500).json({ error: errorMessage });
    }
});
exports.default = router;
