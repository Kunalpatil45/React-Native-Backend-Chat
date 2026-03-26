

export async function sendPushNotification(tokens: string[], message: any) {
  const messages = tokens.map(token => ({
    to: token,
    sound: "default",
    title: message.senderName,
    body: message.text,
    data: {
      chatId: message.chatId,
    },
  }));

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const data = await res.json();
    console.log("Expo Response:", data);
  } catch (err) {
    console.log("Push error:", err);
  }
}