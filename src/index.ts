export * from './services/gmailService';
export * from './auth/googleAuth';
export * from './types';
export * from './config/config';

// Export a convenience function to create a new instance
import { GoogleAuth } from './auth/googleAuth';
import { GmailService } from './services/gmailService';
import { GmailClientConfig } from './types';

export function createGmailClient(config: GmailClientConfig) {
  const auth = new GoogleAuth(config);
  return {
    auth,
    createService: (tokens: any) => {
      const oauth2Client = auth.setCredentials(tokens);
      return new GmailService(oauth2Client);
    }
  };
} 