import { channel } from "diagnostics_channel";

export async function sendPushNotification(
    token: any,
    notification: any
) {

    await fetch(
        "https://exp.host/--/api/v2/push/send",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({

                to: token,
                sound: "default",
                channelId: "default",

                title:
                    notification.title,

                body:
                    notification.body,
        
                priority:"high",

                data: {
                    conversationId:
                        notification.conversationId
                }

            })
        }
    )

}