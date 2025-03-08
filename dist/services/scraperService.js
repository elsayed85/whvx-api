"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeFromAllProviders = scrapeFromAllProviders;
// src/services/scraperService.ts
const providers_1 = require("../providers");
async function scrapeFromAllProviders(query) {
    const results = await Promise.all(providers_1.providers.map((provider) => provider.scrape(query).then((data) => ({
        provider: provider.name,
        embeds: data,
    }))));
    return results.filter((res) => res.embeds.length > 0);
}
