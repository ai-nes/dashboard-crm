export interface ChannelActivity {
  title: string;
  time?: string;
  description?: string;
}

export interface ChannelChartItem {
  channel: string;
  touches: number;
  response?: number;
  fill?: string;
  effectiveness?: string;
  notes?: string;
  activities?: ChannelActivity[];
}

export interface TrendChartItem {
  date?: string;
  score?: number;
  touches?: number;
  eventTitle?: string;
  eventDetail?: string;
  channel?: string;
  note?: string;
}
