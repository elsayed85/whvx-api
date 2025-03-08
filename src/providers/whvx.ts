import { fetcher } from "../utils/fetcher";
import { TokenService } from "../services/tokenService";

export const baseUrl = "https://api.whvx.net";

export const headers = {
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  accept: "*/*",
  "sec-fetch-site": "none",
  "sec-fetch-mode": "cors",
  "sec-fetch-dest": "empty",
  "sec-fetch-storage-access": "active",
  "accept-language": "en-US,en;q=0.9,ar;q=0.8",
  origin: "https://www.vidbinge.com",
  referer: "https://www.vidbinge.com",
  priority: "u=1, i",
};

export class WHVX {
  static id = "whvx";
  static name = "WHVX";

  // ✅ Check if the WHVX server is up
  static async check(): Promise<any[]> {
    try {
      const res = await fetcher(`${baseUrl}/status`, { headers });
      return res && res.providers ? res.providers : [];
    } catch (error) {
      console.error("[WHVX] Server check failed:", error);
      return [];
    }
  }

  // ✅ Search for a movie/show and get provider ID & URL
  static async search(payload: Record<string, any>, token?: string) {
    try {
      const queryParams = new URLSearchParams({
        query: JSON.stringify(payload),
        provider: "orion",
        token: token || "",
      });

      const res = await fetcher(`${baseUrl}/search?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          ...headers,
        },
      });

      if (!res || !res.embedId || !res.url) {
        console.warn("[WHVX] No providers found for:", payload);
        return null;
      }

      return {
        providerId: res.embedId,
        url: res.url,
      };
    } catch (error) {
      console.error("[WHVX] Search request failed:", error);
      return null;
    }
  }

  static async source(resourceId: string, provider: string) {
    try {
      const queryParams = new URLSearchParams({
        resourceId: resourceId,
        provider: provider,
      });

      const res = await fetcher(`${baseUrl}/source?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          ...headers,
        },
      });

      if (!res || !res.stream) {
        console.warn("[WHVX] No source found for:", resourceId);
        return null;
      }

      return res.stream;
    } catch (error) {
      console.error("[WHVX] Source request failed:", error);
      return null;
    }
  }

  static async scrape({
    title,
    year,
    season,
    episode,
    tmdbId,
    imdbId,
  }: {
    title: string;
    year: number;
    season?: number;
    episode?: number;
    tmdbId?: string;
    imdbId?: string;
  }) {
    const query: Record<string, any> = {
      title,
      releaseYear: year,
      tmdbId: tmdbId,
      imdbId: imdbId,
      type: season && episode ? "show" : "movie",
      ...(season &&
        episode && {
          season: season.toString(),
          episode: episode.toString(),
        }),
    };

    // 🔹 1. Check if WHVX is available
    const isServerUp = await WHVX.check();
    if (!isServerUp) return [];

    const { vbtk } = await TokenService.getSessionToken();

    // 🔹 2. Search and get provider ID & URL
    const searchResult = await WHVX.search(query, vbtk);
    if (!searchResult) return [];

    // now the sources
    const sources = await WHVX.source(
      searchResult.url,
      searchResult.providerId
    );

    return sources;
  }
}
