import { Resend } from "resend";
import { toast } from "sonner";

const resend = new Resend(process.env.RESEND_API_KEY);

type LeadData = {
  id: string;
  email: string | null;
  name: string | null;
};

type TemplateData = {
  id: string;
  name: string;
  subject: string;
  content: string;
  description?: string | null;
};

type SendEmailParams = {
  userId: string;
  template: TemplateData;
  leadsData: LeadData[];
};

function replaceVariables(text: string, lead: LeadData): string {
  if (!text) return "";

  // Create a map of variables and their values with fallbacks
  const variables: Record<string, string> = {
    name: lead.name || "there",
    email: lead.email || "",
    lead_id: lead.id || "",
    first_name: lead.name ? lead.name.split(" ")[0] : "there",
  };

  // Replace all variables in the text
  let result = text;
  for (const [variable, value] of Object.entries(variables)) {
    // Use regular expression to find variables with optional whitespace inside braces
    const regex = new RegExp(`{{\\s*${variable}\\s*}}`, "g");
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Main function to send emails to leads with proper variable replacement
 */
export async function sendEmailToLeads({
  template,
  leadsData,
}: SendEmailParams): Promise<number> {
  // Filter out leads without email addresses
  const validLeads = leadsData.filter(
    (lead): lead is LeadData & { email: string } =>
      Boolean(lead.email && lead.email.trim())
  );

  if (validLeads.length === 0) {
    toast.error("No valid leads with email addresses found");
    return 0;
  }

  // Track successful sends
  let successCount = 0;

  // Process each lead individually
  for (const lead of validLeads) {
    try {
      // Replace variables in the template
      const personalizedSubject = replaceVariables(template.subject, lead);
      const personalizedContent = replaceVariables(template.content, lead);

      // Format the email using HTML template
      const htmlContent = formatEmailContent(personalizedContent);

      // Send the email
      const result = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: lead.email,
        subject: personalizedSubject,
        html: htmlContent,
      });

      if (result) {
        successCount++;
      }
    } catch (error) {
      console.error(`Error sending email to ${lead.email}:`, error);
    }
  }
  return successCount;
}

/**
 * Formats the email content with HTML
 */
function formatEmailContent(content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      ${content}
      <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
        If you wish to unsubscribe, please contact us directly.
      </p>
    </div>
  `;
}
