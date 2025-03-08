// src/routes/scraper.ts
import express from "express";
import { scrapeFromAllProviders } from "../services/scraperService";

const router = express.Router();

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
    const results = await scrapeFromAllProviders(query);
    res.json({ results });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred';
    
    res.status(500).json({ error: errorMessage });
  }
});

export default router;