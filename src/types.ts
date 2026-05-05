export type View = 'dashboard' | 'pipeline' | 'active-call' | 'rm-view' | 'lead-detail' | 'analytics';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  location: string;
  profession: string;
  score: number;
  status: 'HOT' | 'WARM' | 'COLD';
  lastInteraction: string;
}

export interface Metric {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface Transcript {
  speaker: string;
  time: string;
  text: string;
  type?: 'ai' | 'user' | 'status';
}
