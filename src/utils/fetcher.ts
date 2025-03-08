// src/utils/fetcher.ts
import axios from 'axios';

export async function fetcher(url: string, options?: object) {
  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error) {
    console.error(`Fetcher error: ${error}`);
    return null;
  }
}
