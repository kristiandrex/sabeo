type TelegramMessageResult =
  | { status: "sent" }
  | { status: "disabled" }
  | { status: "failed"; error: string };

export async function sendTelegramMessage(text: string): Promise<TelegramMessageResult> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { status: "disabled" };
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
        status: "failed",
        error: `Telegram API error: ${response.status} ${body}`.trim(),
      };
    }

    return { status: "sent" };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown Telegram error",
    };
  }
}
