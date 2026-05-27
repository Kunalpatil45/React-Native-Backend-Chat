export const notificationTemplates = {

    loginGreeting: (username: any) => ({
        title: `👋 Welcome ${username}`,
        body: "Glad to see you back!"
    }),

    newMessage: (
        sender :any,
        message :any,
        conversationId :any
    ) => ({

        title: sender,
        body: message,

        conversationId
    }),

    profileUpdate: () => ({
        title: "Profile Updated",
        body: "Your profile information has been successfully updated."
    }),

};