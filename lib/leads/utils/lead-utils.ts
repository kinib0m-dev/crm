/**
 * Formats a lead's contact information into a standardized display format
 */
export function formatLeadContact(lead: Lead) {
  const contact = [];

  if (lead.email) {
    contact.push({ type: "email", value: lead.email });
  }

  if (lead.phone) {
    contact.push({ type: "phone", value: lead.phone });
  }

  return contact;
}

/**
 * Calculates days since last contact
 */
export function daysSinceLastContact(lead: Lead): number | null {
  if (!lead.lastContactedAt) return null;

  const lastContactDate = new Date(lead.lastContactedAt);
  const today = new Date();

  const diffTime = Math.abs(today.getTime() - lastContactDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates days until next follow-up
 */
export function daysUntilNextFollowUp(lead: Lead): number | null {
  if (!lead.nextFollowUpDate) return null;

  const followUpDate = new Date(lead.nextFollowUpDate);
  const today = new Date();

  const diffTime = Math.abs(followUpDate.getTime() - today.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determines the visual status indicator for a lead
 */
export function getLeadStatusIndicator(lead: Lead) {
  // Define status categories and their corresponding colors
  const statusColors = {
    new: ["new_lead", "initial_contact"],
    active: ["awaiting_response", "engaged", "information_gathering"],
    qualified: ["high_interest", "qualified", "appointment_scheduled"],
    converting: ["proposal_sent", "negotiation"],
    converted: ["converted"],
    dormant: ["purchased_elsewhere", "future_opportunity", "periodic_nurture"],
    reactivated: ["reactivated"],
    closed: ["unsubscribed", "invalid"],
  };

  // Find which category the lead's status belongs to
  for (const [category, statuses] of Object.entries(statusColors)) {
    if (statuses.includes(lead.status)) {
      return { category, color: getCategoryColor(category) };
    }
  }

  return { category: "unknown", color: "gray" };
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "new":
      return "blue";
    case "active":
      return "emerald";
    case "qualified":
      return "purple";
    case "converting":
      return "amber";
    case "converted":
      return "green";
    case "dormant":
      return "gray";
    case "reactivated":
      return "indigo";
    case "closed":
      return "red";
    default:
      return "gray";
  }
}
