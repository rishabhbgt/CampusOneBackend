const http = require("http");
const { google } = require("googleapis");
const { URL } = require("url");
require("dotenv").config();

const PORT = 5000;
const REDIRECT_URI = `http://localhost:${PORT}/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.send"],
});

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for Google callback...\n");

const server = http.createServer(async (req, res) => {
    try {
        const requestUrl = new URL(
            req.url,
            `http://localhost:${PORT}`
        );

        if (requestUrl.pathname !== "/auth/google/callback") {
            res.writeHead(404);
            res.end("Not Found");
            return;
        }

        const code = requestUrl.searchParams.get("code");

        if (!code) {
            res.writeHead(400);
            res.end("Authorization code not found");
            return;
        }

        const { tokens } =
            await oauth2Client.getToken(code);

        console.log("\n===== TOKENS =====\n");
        console.log(tokens);
        console.log("\n==================\n");

        res.writeHead(200, {
            "Content-Type": "text/html",
        });

        res.end(`
            <h2>Google authorization successful ✅</h2>
            <p>You can close this tab now.</p>
            <p>Check your terminal for the refresh token.</p>
        `);

        setTimeout(() => {
            server.close();
        }, 1000);
    } catch (error) {
        console.error("OAuth Error:", error);

        res.writeHead(500);
        res.end("OAuth authorization failed");
    }
});

server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});