export type IncidentCategory = 'Facilities' | 'Security' | 'Academic' | 'IT Systems' | 'Health & Safety' | 'Other';

export type IncidentStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  reporterName?: string;
  reporterEmail?: string;
  media: string[]; // Base64 encoding or local mocked URLs
  createdAt: string;
  chatAccessCode: string; // Unique token for anonymous correspondence
}

export interface ChatMessage {
  id: string;
  incidentId: string;
  sender: 'STAKEHOLDER' | 'ADMIN';
  text: string;
  timestamp: string;
}

export type UserRole = 'STAKEHOLDER' | 'ADMIN';
