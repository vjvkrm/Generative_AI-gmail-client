interface EmailPaginationParams {
  page: number;
  limit: number;
}

interface EmailResponse {
  emails: Email[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

class EmailService {
  async getEmails({
    page,
    limit,
  }: EmailPaginationParams): Promise<EmailResponse> {
    try {
      const response = await fetch(`/api/emails?page=${page}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching emails:", error);
      throw error;
    }
  }

  async deleteEmail(emailId: string): Promise<void> {
    try {
      await fetch(`/api/emails/${emailId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting email:", error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
