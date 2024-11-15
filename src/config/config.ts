import dotenv from "dotenv";
dotenv.config();

export const config = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  redirectUri:
    process.env.REDIRECT_URI || "http://localhost:3000/auth/google/callback",
  scopes: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://mail.google.com/",
  ],
  email: {
    defaultFetchLimit: 100,
    defaultDays: 60,
    includeConversations: true,
    maxConcurrentRequests: 10,
  },
};
