export interface NewsHeadline {
  title: string;
  source: string;
  url: string;
  published_at: string;
}

export interface NewsPoint {
  id: string;
  lat: number;
  lon: number;
  place: string;
  article_count: number;
  top_topics: string[];
  last_updated: string;
  sample_headlines: NewsHeadline[];
}

export interface NewsData {
  points: NewsPoint[];
}

export interface SummaryData {
  id: string;
  summary: string;
  citations: Array<{ title: string; url: string }>;
  sentiment: {
    polarity: number; // -1 to 1
    subjectivity: number; // 0 to 1
  };
  diversity: {
    outlets: number;
    countries: number;
  };
  bias: Array<"left" | "lean_left" | "center" | "lean_right" | "right">;
}

export interface NewsFilters {
  query: string;
  topics: string[];
  language: string;
  timeWindow: string;
  sources: string[];
  minCount: number;
  verifiedOnly: boolean;
}

export const TOPIC_COLORS = {
  politics: '#ef4444', // red
  business: '#3b82f6', // blue
  tech: '#8b5cf6', // purple
  health: '#10b981', // emerald
  science: '#06b6d4', // cyan
  sports: '#f59e0b', // amber
  entertainment: '#ec4899', // pink
  conflict: '#dc2626', // red-600
  disaster: '#ea580c', // orange-600
  economy: '#059669', // emerald-600
  energy: '#7c3aed', // violet-600
  environment: '#16a34a', // green-600
} as const;

export const TIME_WINDOWS = [
  { value: '3h', label: 'Past 3 hours' },
  { value: '12h', label: 'Past 12 hours' },
  { value: '24h', label: 'Past 24 hours' },
  { value: '7d', label: 'Past 7 days' },
] as const;

export const LANGUAGES = [
  { value: 'all', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ar', label: 'Arabic' },
] as const;