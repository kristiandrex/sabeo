"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { cache } from "react";

export const getDictionary = cache(async function getDictionary(): Promise<string[]> {
  try {
    const dictionaryPath = path.join(process.cwd(), "data", "es_CO.json");
    const content = await fs.readFile(dictionaryPath, "utf8");
    const words = JSON.parse(content);

    if (!Array.isArray(words)) {
      return [];
    }

    return words;
  } catch (error) {
    console.error(error);
    return [];
  }
});
