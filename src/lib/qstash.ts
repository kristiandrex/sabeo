import { Client } from "@upstash/qstash";

let client: Client | undefined;

export function getQStashClient() {
  if (!client) {
    if (!process.env.QSTASH_TOKEN) {
      throw new Error("QSTASH_TOKEN is not configured");
    }

    client = new Client({
      token: process.env.QSTASH_TOKEN,
      baseUrl: process.env.QSTASH_URL,
    });
  }

  return client;
}
