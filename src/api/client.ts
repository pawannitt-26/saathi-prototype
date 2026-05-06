const raw = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE = raw.replace(/\/$/, '');

export function wsBaseUrl(): string {
  if (API_BASE.startsWith('https://')) {
    return API_BASE.replace('https://', 'wss://');
  }
  return API_BASE.replace('http://', 'ws://');
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json() as Promise<T>;
}

export type LeadDto = {
  id: string;
  name: string;
  phone: string;
  location: string;
  profession: string;
  score: number;
  status: 'HOT' | 'WARM' | 'COLD';
  last_interaction: string | null;
};

export type TranscriptRowDto = {
  speaker: string;
  time: string;
  text: string;
  type?: string | null;
};

export type LeadDetailDto = {
  lead: LeadDto;
  summary: string | null;
  recommended_opener: string | null;
  objections: Array<{ label?: string; text?: string; status?: string }>;
  transcript: TranscriptRowDto[];
};

export type DashboardMetricsDto = {
  conversion_rate: string;
  active_calls: number;
  hot_leads_today: number;
  funnel: Array<{ label: string; value: string; width: string }>;
  sentiment: Record<string, string>;
};

export type ActivityDto = {
  title: string;
  description: string;
  time: string;
  event_type: string;
};

export type HotLeadRmDto = {
  name: string;
  time: string;
  source: string;
  value: string;
  lead_id: string;
};

export type AnalyticsDto = {
  funnel_steps: Array<Record<string, string | boolean | undefined>>;
  attrition: Array<Record<string, string>>;
  objections: Array<{ label: string; value: string; width: string }>;
  language_split: Array<{ label: string; value: string; color: string }>;
};

export async function fetchLeads(): Promise<LeadDto[]> {
  const res = await fetch(`${API_BASE}/api/leads`);
  return parseJson(res);
}

export async function fetchLeadDetail(leadId: string): Promise<LeadDetailDto> {
  const res = await fetch(`${API_BASE}/api/leads/${leadId}`);
  return parseJson(res);
}

export async function fetchDashboardMetrics(): Promise<DashboardMetricsDto> {
  const res = await fetch(`${API_BASE}/api/dashboard/metrics`);
  return parseJson(res);
}

export async function fetchActivities(): Promise<ActivityDto[]> {
  const res = await fetch(`${API_BASE}/api/dashboard/activities`);
  return parseJson(res);
}

export async function fetchRmHot(): Promise<HotLeadRmDto[]> {
  const res = await fetch(`${API_BASE}/api/dashboard/rm/hot`);
  return parseJson(res);
}

export async function fetchAnalytics(): Promise<AnalyticsDto> {
  const res = await fetch(`${API_BASE}/api/analytics/summary`);
  return parseJson(res);
}
