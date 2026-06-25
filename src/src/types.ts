export interface ComplaintDraft {
  category: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  priorityJustification: string;
  location: string;
  authorityName: string;
  authorityEmail: string;
  formalEmailSubject: string;
  formalEmailBody: string;
  estimatedTimeline: string;
  trackingId: string;
  hazardLevel?: "Red" | "Amber" | "Blue" | string;
}

export interface Complaint {
  id: string; // matches trackingId
  text: string;
  location: string;
  draft: ComplaintDraft;
  status: "LODGED" | "UNDER_REVIEW" | "DISPATCHED" | "RESOLVED";
  createdAt: string;
  timelineProgress: number; // percentage completed
  updates: Array<{
    timestamp: string;
    message: string;
    status: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  draft?: ComplaintDraft;
}
