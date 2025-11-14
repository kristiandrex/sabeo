import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import readline from "node:readline";

function normalizeVowels(word: string) {
  return word
    .normalize("NFD")
    .replace(/([aeiou])\u0301/gi, "$1")
    .normalize("NFC");
}

async function download(url: string, outPath: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error downloading ${url}: ${res.statusText}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());

  fs.writeFileSync(outPath, buf);
}

async function main() {
  const tmp = os.tmpdir();

  const affURL =
    "https://raw.githubusercontent.com/LibreOffice/dictionaries/refs/heads/master/es/es_CO.aff";

  const dicURL =
    "https://raw.githubusercontent.com/LibreOffice/dictionaries/refs/heads/master/es/es_CO.dic";

  const affPath = path.join(tmp, "es_CO.aff");
  const dicPath = path.join(tmp, "es_CO.dic");

  await download(affURL, affPath);
  await download(dicURL, dicPath);

  const words = new Set<string>();

  const child = spawn("unmunch", [dicPath, affPath]);

  const rl = readline.createInterface({
    input: child.stdout,
    crlfDelay: Infinity,
  });

  rl.on("line", (word) => {
    if (word.length === 5) {
      const normalizedWord = normalizeVowels(word).toLowerCase();
      words.add(normalizedWord);
    }
  });

  const exitCode: number = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`unmunch exited with code ${exitCode}`);
  }

  const outPath = path.join(process.cwd(), "data", "es_CO.json");
  fs.writeFileSync(outPath, JSON.stringify(Array.from(words), null, 2), "utf8");

  console.log(`File "es_CO.json" saved with ${words.size} words`);
}

main().catch((err) => console.error(err));
