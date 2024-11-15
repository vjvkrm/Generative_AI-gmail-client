export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface GmailMessage {
  id: string;
  threadId: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body: {
      data?: string;
      size: number;
    };
    parts?: Array<{
      body: {
        data?: string;
        size: number;
      };
      mimeType: string;
    }>;
  };
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: boolean;
}

export interface GmailClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export class GmailError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'GmailError';
  }
} 