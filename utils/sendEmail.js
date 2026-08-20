const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
});

const sendEmail = async (to, subject, html) => {
    try {
        const message = [
            `From: CampusOne Administration <${process.env.SMTP_EMAIL}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8",
            "",
            html,
        ].join("\r\n");

        const encodedMessage = Buffer.from(message).toString("base64url");

        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });

        return true;
    } catch (error) {
        console.error("Gmail API Email Error:", error);
        throw error;
    }
};

module.exports = sendEmail;