import { Router } from "express";
import { GoogleAuth } from "../auth/googleAuth";
import { GmailService } from "../services/gmailService";
import { StorageService } from "../services/storageService";
import { config } from "../config/config";
import { GoogleTokens } from "../types";
import fs from "fs/promises";
import path from "path";
import { aiService } from "../services/aiService";

const router = Router();
const googleAuth = new GoogleAuth(config);
const storageService = new StorageService();

async function getEmailById(emailId: string) {
  try {
    // First try to get from storage
    const email = await storageService.getEmailById(emailId);
    if (email) {
      return {
        id: email.id,
        subject: getEmailSubject(email),
        body: getEmailBody(email),
      };
    }

    // If not in storage, fetch from Gmail API
    const tokens = await getStoredTokens();
    const auth = googleAuth.setCredentials(tokens);
    const gmailService = new GmailService(auth);
    const fetchedEmail = await gmailService.getEmail(emailId);

    return {
      id: fetchedEmail.id,
      subject: getEmailSubject(fetchedEmail),
      body: getEmailBody(fetchedEmail),
    };
  } catch (error) {
    console.error("Error getting email:", error);
    throw new Error("Failed to get email details");
  }
}

// Helper functions to extract email parts
function getEmailSubject(email: any): string {
  return (
    email.payload.headers.find((h: any) => h.name === "Subject")?.value ||
    "No Subject"
  );
}

function getEmailBody(email: any): string {
  let body = "";

  if (email.payload.body.data) {
    body = Buffer.from(email.payload.body.data, "base64").toString();
  } else if (email.payload.parts) {
    const textPart = email.payload.parts.find(
      (part: any) => part.mimeType === "text/plain"
    );
    if (textPart && textPart.body.data) {
      body = Buffer.from(textPart.body.data, "base64").toString();
    }
  }

  return body;
}

router.get("/auth/google", (req, res) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

router.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const tokens = await googleAuth.getTokens(code as string);
    await fs.writeFile(
      path.join(__dirname, "..", "tokens.json"),
      JSON.stringify(tokens, null, 2)
    );

    // Perform initial sync after authentication
    const auth = googleAuth.setCredentials(tokens);
    const gmailService = new GmailService(auth);

    // Fetch emails using default days from config
    const { emails } = await gmailService.listEmails(config.email.defaultDays);
    await storageService.saveEmails(emails);

    res.redirect("/dashboard.html");
  } catch (error) {
    console.error("Auth Error:", error);
    res.redirect("/error.html");
  }
});

const getStoredTokens = async (): Promise<GoogleTokens> => {
  try {
    const tokensFile = await fs.readFile(
      path.join(__dirname, "..", "tokens.json"),
      "utf-8"
    );
    return JSON.parse(tokensFile);
  } catch (error) {
    throw new Error("No stored tokens found. Please authenticate first.");
  }
};

router.get("/emails/:days", async (req, res) => {
  const { days } = req.params;
  const { pageToken } = req.query;

  try {
    const tokens = await getStoredTokens();
    const auth = googleAuth.setCredentials(tokens);
    const gmailService = new GmailService(auth);

    // First try to get emails from local storage
    let localEmails = await storageService.getEmails();

    // If we have pageToken, fetch from Gmail API
    if (pageToken) {
      const { emails, nextPageToken } = await gmailService.listEmails(
        parseInt(days),
        pageToken as string
      );
      await storageService.saveEmails(emails);
      res.json({ emails, nextPageToken });
      return;
    }

    // If no local emails or requesting fresh data, fetch from Gmail API
    if (localEmails.length === 0) {
      const { emails, nextPageToken } = await gmailService.listEmails(
        parseInt(days)
      );
      await storageService.saveEmails(emails);
      res.json({ emails, nextPageToken });
      return;
    }

    // Filter local emails by date
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    localEmails = localEmails.filter((email) => {
      // Gmail's internalDate is in milliseconds
      const emailDate = new Date(parseInt(email.internalDate));
      return !isNaN(emailDate.getTime()) && emailDate >= daysAgo;
    });

    res.json({ emails: localEmails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

router.get("/emails/search", async (req, res) => {
  const { query } = req.query;
  try {
    const results = await storageService.searchEmails(query as string);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to search emails" });
  }
});

router.delete("/emails/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tokens = await getStoredTokens();
    const auth = googleAuth.setCredentials(tokens);
    const gmailService = new GmailService(auth);

    await gmailService.deleteEmail(id);
    res.json({ message: "Email deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete email" });
  }
});

router.post("/emails/:id/reply", async (req, res) => {
  const { id } = req.params;
  const { to, subject, body, html } = req.body;

  try {
    const tokens = await getStoredTokens();
    const auth = googleAuth.setCredentials(tokens);
    const gmailService = new GmailService(auth);

    await gmailService.replyToEmail(id, { to, subject, body, html });
    res.json({ message: "Reply sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send reply" });
  }
});

router.post("/send-email", async (req, res) => {
  const { to, subject, body, html } = req.body;
  // Get tokens from session or database
  const tokens = await getStoredTokens();
  const auth = googleAuth.setCredentials(tokens);
  const gmailService = new GmailService(auth);

  try {
    await gmailService.sendEmail({ to, subject, body, html });
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

router.get("/emails/:id/analyze", async (req, res) => {
  try {
    const email = await getEmailById(req.params.id); // Implement this based on your setup
    const analysis = await aiService.analyzeEmail(email.subject, email.body);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze email" });
  }
});

router.get("/emails/:id/generate-reply", async (req, res) => {
  try {
    const email = await getEmailById(req.params.id);
    const reply = await aiService.generateReply(email.body);
    res.json(reply);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate reply" });
  }
});

export default router;
