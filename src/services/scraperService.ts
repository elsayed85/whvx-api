// src/services/scraperService.ts
import { providers } from "../providers";

export async function scrapeFromAllProviders(
  query: { title: string; year: number; season?: number; episode?: number , tmdbId?: string, imdbId?: string }
) {
  const results = await Promise.all(
    providers.map((provider) =>
      provider.scrape(query).then((data) => ({
        provider: provider.name,
        embeds: data,
      }))
    )
  );

  return results.filter((res) => res.embeds.length > 0);
}
