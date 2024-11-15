import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import {
  EmailMessage,
  SendEmailOptions,
  GmailError,
  GmailMessage,
} from "../types";
import { config } from "../config/config";

export class GmailService {
  private gmail: any;
  private fetchLimit: number;
  private includeConversations: boolean;
  private maxConcurrentRequests: number;

  constructor(
    auth: OAuth2Client,
    options = {
      fetchLimit: config.email.defaultFetchLimit,
      includeConversations: config.email.includeConversations,
      maxConcurrentRequests: config.email.maxConcurrentRequests,
    }
  ) {
    this.gmail = google.gmail({ version: "v1", auth });
    this.fetchLimit = options.fetchLimit;
    this.includeConversations = options.includeConversations;
    this.maxConcurrentRequests = options.maxConcurrentRequests;
  }

  private async getFullThread(threadId: string): Promise<EmailMessage[]> {
    try {
      const thread = await this.gmail.users.threads.get({
        userId: "me",
        id: threadId,
        format: "full",
      });

      return thread.data.messages;
    } catch (error) {
      console.error(`Error fetching thread ${threadId}:`, error);
      return [];
    }
  }

  private async processInBatches<T>(
    items: T[],
    batchSize: number,
    processor: (item: T) => Promise<any>
  ) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    return results;
  }

  async listEmails(
    days: number,
    pageToken?: string
  ): Promise<{
    emails: EmailMessage[];
    nextPageToken?: string;
  }> {
    if (days < 1) {
      throw new GmailError(
        "Days parameter must be greater than 0",
        "INVALID_PARAMETER",
        400
      );
    }

    const date = new Date();
    date.setDate(date.getDate() - days);

    try {
      console.log("Fetching emails...");
      const response = await this.gmail.users.messages.list({
        userId: "me",
        maxResults: Math.min(this.fetchLimit, 100),
        pageToken,
        labelIds: ["INBOX"],
      });

      if (!response.data.messages) {
        console.log("No messages found");
        return { emails: [] };
      }

      console.log(`Found ${response.data.messages.length} messages`);

      let emails: EmailMessage[] = [];

      if (this.includeConversations) {
        // Group messages by threadId
        const threadMap = new Map<string, GmailMessage>();
        response.data.messages.forEach((msg: GmailMessage) => {
          if (!threadMap.has(msg.threadId)) {
            threadMap.set(msg.threadId, msg);
          }
        });

        // Fetch full threads in batches
        const threads = await this.processInBatches(
          Array.from(threadMap.keys()),
          this.maxConcurrentRequests,
          (threadId) => this.getFullThread(threadId)
        );

        // Flatten thread messages into emails array
        emails = threads
          .flat()
          .filter((email): email is EmailMessage => email !== null);
      } else {
        // Fetch individual messages in batches
        emails = await this.processInBatches(
          response.data.messages,
          this.maxConcurrentRequests,
          async (message: GmailMessage) => {
            try {
              const email = await this.gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: "full",
              });
              return email.data;
            } catch (error) {
              console.error(`Error fetching email ${message.id}:`, error);
              return null;
            }
          }
        );

        emails = emails.filter(
          (email): email is EmailMessage => email !== null
        );
      }

      console.log(`Successfully fetched ${emails.length} emails`);

      return {
        emails,
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error: any) {
      console.error("Error in listEmails:", error);
      throw new GmailError(
        error.message || "Failed to fetch emails",
        error.code,
        error.status
      );
    }
  }

  async sendEmail({
    to,
    subject,
    body,
    html = true,
  }: SendEmailOptions): Promise<void> {
    if (!to || !subject || !body) {
      throw new GmailError(
        "Missing required email parameters",
        "INVALID_PARAMETERS",
        400
      );
    }

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const contentType = html ? "text/html" : "text/plain";

    const messageParts = [
      `To: ${to}`,
      `Content-Type: ${contentType}; charset=utf-8`,
      "MIME-Version: 1.0",
      `Subject: ${utf8Subject}`,
      "",
      body,
    ];

    const message = messageParts.join("\n");
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    try {
      await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });
    } catch (error: any) {
      throw new GmailError(
        error.message || "Failed to send email",
        error.code,
        error.status
      );
    }
  }

  async deleteEmail(id: string): Promise<void> {
    try {
      await this.gmail.users.messages.trash({
        userId: "me",
        id,
      });
    } catch (error: any) {
      throw new GmailError(
        error.message || "Failed to delete email",
        error.code,
        error.status
      );
    }
  }

  async replyToEmail(
    originalEmailId: string,
    { to, subject, body, html = true }: SendEmailOptions
  ): Promise<void> {
    try {
      const originalEmail = await this.gmail.users.messages.get({
        userId: "me",
        id: originalEmailId,
      });

      const threadId = originalEmail.data.threadId;
      const references = originalEmail.data.payload.headers
        .filter((h: any) => ["Message-ID", "References"].includes(h.name))
        .map((h: any) => h.value)
        .join(" ");

      const messageParts = [
        `To: ${to}`,
        `Content-Type: ${html ? "text/html" : "text/plain"}; charset=utf-8`,
        "MIME-Version: 1.0",
        `Subject: Re: ${subject}`,
        `References: ${references}`,
        `In-Reply-To: ${originalEmail.data.payload.headers.find((h: any) => h.name === "Message-ID")?.value}`,
        "",
        body,
      ];

      const message = messageParts.join("\n");
      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
          threadId,
        },
      });
    } catch (error: any) {
      throw new GmailError(
        error.message || "Failed to reply to email",
        error.code,
        error.status
      );
    }
  }

  async getEmail(emailId: string): Promise<EmailMessage> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: "me",
        id: emailId,
        format: "full",
      });

      return response.data as EmailMessage;
    } catch (error) {
      console.error("Error fetching email:", error);
      throw new Error("Failed to fetch email");
    }
  }
}
