"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetcher = fetcher;
// src/utils/fetcher.ts
const axios_1 = __importDefault(require("axios"));
async function fetcher(url, options) {
    try {
        const response = await axios_1.default.get(url, options);
        return response.data;
    }
    catch (error) {
        console.error(`Fetcher error: ${error}`);
        return null;
    }
}
