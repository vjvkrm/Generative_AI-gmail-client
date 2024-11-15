import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EmailAnalysis {
  classification: string;
  importance: boolean;
  summary: string;
}

interface DraftReply {
  suggestedReply: string;
}

class AIService {
  async analyzeEmail(subject: string, body: string): Promise<EmailAnalysis> {
    try {
      const prompt = `
        Analyze this email:
        Subject: ${subject}
        Body: ${body}

        Respond with a JSON object containing:
        1. classification (one of: "Business", "Personal", "Promotional", "Urgent", "Junk")
        2. importance (true/false based on content urgency and significance)
        3. summary (one-line summary of the email)
        
        Provide ONLY the JSON object, no markdown formatting or additional text.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || "{}";

      const cleanJson = content.replace(/```json\n?|\n?```/g, "").trim();

      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Error analyzing email:", error);
      return {
        classification: "Unknown",
        importance: false,
        summary: "Could not generate summary",
      };
    }
  }

  async generateReply(emailContent: string): Promise<DraftReply> {
    try {
      const prompt = `
        Generate a professional and concise reply to this email:
        ${emailContent}

        The reply should be:
        1. Professional and courteous
        2. Brief but comprehensive
        3. Address the main points
        
        Provide only the reply text, no additional formatting.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      return {
        suggestedReply: response.choices[0].message.content || "",
      };
    } catch (error) {
      console.error("Error generating reply:", error);
      return {
        suggestedReply: "Could not generate reply suggestion.",
      };
    }
  }
}

export const aiService = new AIService();
