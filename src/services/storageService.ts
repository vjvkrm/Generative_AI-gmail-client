import fs from "fs/promises";
import path from "path";
import { EmailMessage } from "../types";

export class StorageService {
  private dataDir: string;
  private emailsFile: string;

  constructor() {
    this.dataDir = path.join(__dirname, "..", "..", "data");
    this.emailsFile = path.join(this.dataDir, "emails.json");
    this.initStorage();
  }

  private async initStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      try {
        await fs.access(this.emailsFile);
      } catch {
        await fs.writeFile(this.emailsFile, JSON.stringify([], null, 2));
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  async saveEmails(emails: EmailMessage[]): Promise<void> {
    try {
      const existingEmails = await this.getEmails();
      const newEmails = emails.filter(
        (newEmail) =>
          !existingEmails.some((existing) => existing.id === newEmail.id)
      );

      await fs.writeFile(
        this.emailsFile,
        JSON.stringify([...existingEmails, ...newEmails], null, 2)
      );
    } catch (error) {
      console.error("Failed to save emails:", error);
      throw error;
    }
  }

  async getEmails(): Promise<EmailMessage[]> {
    try {
      const data = await fs.readFile(this.emailsFile, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to read emails:", error);
      return [];
    }
  }

  async searchEmails(query: string): Promise<EmailMessage[]> {
    const emails = await this.getEmails();
    const lowerQuery = query.toLowerCase();

    return emails.filter((email) => {
      const subject =
        email.payload.headers.find((h) => h.name === "Subject")?.value || "";
      const from =
        email.payload.headers.find((h) => h.name === "From")?.value || "";
      return (
        subject.toLowerCase().includes(lowerQuery) ||
        from.toLowerCase().includes(lowerQuery) ||
        email.snippet.toLowerCase().includes(lowerQuery)
      );
    });
  }

  async getEmailById(emailId: string) {
    try {
      const emails = await this.getEmails();
      return emails.find((email) => email.id === emailId);
    } catch (error) {
      console.error("Error getting email by ID:", error);
      return null;
    }
  }
}
