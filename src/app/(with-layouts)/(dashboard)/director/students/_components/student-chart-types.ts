export interface ChannelActivity {
  title: string;
  time?: string | null;
  description?: string | null;
}

export interface ChannelChartItem {
  channel: string;
  touches: number;
  response: number;
  fill?: string;
  effectiveness?: string | null;
  notes?: string | null;
  activities?: ChannelActivity[];
}

export interface TrendChartItem {
  date?: string;
  score?: number;
  touches?: number;
  eventTitle?: string | null;
  eventDetail?: string | null;
  channel?: string | null;
  note?: string;
}
