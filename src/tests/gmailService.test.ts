import { GmailService } from "../services/gmailService";
import { OAuth2Client } from "google-auth-library";
import { GmailError } from "../types";

jest.mock("google-auth-library");
jest.mock("googleapis");

describe("GmailService", () => {
  let gmailService: GmailService;
  let mockAuth: OAuth2Client;

  beforeEach(() => {
    mockAuth = new OAuth2Client();
    gmailService = new GmailService(mockAuth);
  });

  describe("listEmails", () => {
    it("should throw error for invalid days parameter", async () => {
      await expect(gmailService.listEmails(0)).rejects.toThrow(GmailError);
    });
  });

  describe("sendEmail", () => {
    it("should throw error for missing parameters", async () => {
      await expect(
        gmailService.sendEmail({ to: "", subject: "", body: "" })
      ).rejects.toThrow(GmailError);
    });
  });
});
