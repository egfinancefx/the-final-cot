
export interface HistoricalCotRecord {
  commodity: string;
  weeks: {
    date: string;
    value: string;
    numValue: number;
  }[];
}

export interface CotRecord {
  commodity: string;
  netPositions: string;
  netChange: string;
  longPositions: string;
  longChange: string;
  shortPositions: string;
  shortChange: string;
  numNetPos: number;
  numLong: number;
  numShort: number;
  numNetChange: number;
}
