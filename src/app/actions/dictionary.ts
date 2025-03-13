"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { cache } from "react";

export const getDictionary = cache(async function getDictionary() {
  const dictionaryPath = path.join(
    process.cwd(),
    "src",
    "app",
    "assets",
    "dictionary.json"
  );

  const content = await fs.readFile(dictionaryPath, "utf8");
  const dictionary = JSON.parse(content);
  return dictionary;
});
