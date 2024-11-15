import { OAuth2Client } from "google-auth-library";
import { GmailClientConfig, GoogleTokens } from "../types";

export class GoogleAuth {
  private oauth2Client: OAuth2Client;
  private config: GmailClientConfig;

  constructor(config: GmailClientConfig) {
    this.config = config;
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.config.scopes,
      prompt: "consent",
    });
  }

  async getTokens(code: string): Promise<GoogleTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens as GoogleTokens;
  }

  setCredentials(tokens: GoogleTokens): OAuth2Client {
    this.oauth2Client.setCredentials(tokens);
    return this.oauth2Client;
  }
}
