type TelegramMessageResult = { ok: true } | { ok: false; error: string };

export async function sendTelegramMessage(text: string): Promise<TelegramMessageResult> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { ok: false, error: "Missing Telegram configuration" };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        ok: false,
        error: `Telegram API error: ${response.status} ${body}`.trim(),
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Telegram error",
    };
  }
}
