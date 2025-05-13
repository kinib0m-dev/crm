/**
 * Formats a lead's contact information into a standardized display format
 */
export function formatLeadContact(lead: LeadWithTags) {
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
export function daysSinceLastContact(lead: LeadWithTags): number | null {
  if (!lead.lastContactedAt) return null;

  const lastContactDate = new Date(lead.lastContactedAt);
  const today = new Date();

  const diffTime = Math.abs(today.getTime() - lastContactDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates days until next follow-up
 */
export function daysUntilNextFollowUp(lead: LeadWithTags): number | null {
  if (!lead.nextFollowUpDate) return null;

  const followUpDate = new Date(lead.nextFollowUpDate);
  const today = new Date();

  const diffTime = Math.abs(followUpDate.getTime() - today.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determines the visual status indicator for a lead
 */
export function getLeadStatusIndicator(lead: LeadWithTags) {
  // Define status categories and their corresponding colors
  const statusColors = {
    nuevo: ["lead_entrante"],
    activo: ["en_conversacion", "opciones_enviadas"],
    cualificado: ["vehiculo_elegido"],
    asesor: ["asesor"],
    inactivo: ["sin_opcion"],
    no_cualificado: ["no_cualificado"],
    cerrado: ["venta_realizada"],
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
    case "nuevo":
      return "blue";
    case "activo":
      return "indigo";
    case "cualificado":
      return "purple";
    case "asesor":
      return "violet";
    case "inactivo":
      return "amber";
    case "no_cualificado":
      return "gray";
    case "cerrado":
      return "green";
    default:
      return "gray";
  }
}
