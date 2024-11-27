import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:cristiandrestorres@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const sub = await req.json();

  await webpush.sendNotification(
    sub,
    JSON.stringify({
      title: "Palabra del día",
      body: "¡Hay un nuevo reto!",
      icon: "/icon-512x512.png",
    })
  );

  return new Response("Notification sent", { status: 200 });
}
