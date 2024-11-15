export interface EmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
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
      mimeType: string;
      body: {
        data?: string;
        size: number;
      };
    }>;
  };
  internalDate: string;
}

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
  email?: {
    defaultDays: number;
    defaultFetchLimit: number;
    includeConversations: boolean;
    maxConcurrentRequests: number;
  };
}

export class GmailError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "GmailError";
    this.code = code;
    this.status = status;
  }
}
