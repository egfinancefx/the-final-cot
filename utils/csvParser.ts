
import { HistoricalCotRecord, CotRecord } from '../types';

export const parseValue = (val: string): number => {
  if (!val) return 0;
  // Handle currencies ($), percent (%), commas, spaces, plus signs, and accounting parentheses
  let cleaned = val.toString().trim().replace(/["+,\s$%]/g, '');
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const splitLine = (line: string): string[] => {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else current += char;
  }
  parts.push(current.trim());
  return parts;
};

const findHeaderRowIndex = (lines: string[], keywordGroups: string[][]): number => {
  let maxScore = -1;
  let headerIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const row = splitLine(lines[i]).map(h => h.toLowerCase().replace(/["\s._-]/g, ''));
    let score = 0;
    keywordGroups.forEach(group => {
      if (group.some(k => row.some(h => h.includes(k)))) score++;
    });
    if (score > maxScore) {
      maxScore = score;
      headerIndex = i;
    }
  }
  return headerIndex;
};

export const parsePositionsCSV = (csv: string): CotRecord[] => {
  if (!csv) return [];
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  
  const aliases = {
    commodity: ['commodity', 'asset', 'market', 'contract', 'instrument', 'symbol'],
    netPos: ['netposition', 'netpos', 'totalnet', 'commercialnet'],
    netChg: ['netchange', 'netchg', 'changeinnet'],
    longPos: ['longposition', 'longs', 'buypos', 'long'],
    longChg: ['longchange', 'longchg', 'chginlong', 'changeinlong'],
    shortPos: ['shortposition', 'shorts', 'sellpos', 'short'],
    shortChg: ['shortchange', 'shortchg', 'chginshort', 'changeinshort']
  };

  const headerRowIdx = findHeaderRowIndex(lines, Object.values(aliases));
  const rawHeaders = splitLine(lines[headerRowIdx]);
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/["\s._-]/g, ''));
  
  const changeIndices = headers.reduce((acc: number[], h, i) => {
    if (h.includes('chg') || h.includes('change')) acc.push(i);
    return acc;
  }, []);

  const findColIdx = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const idx = {
    commodity: findColIdx(aliases.commodity),
    netPos: findColIdx(aliases.netPos),
    netChg: findColIdx(aliases.netChg),
    longPos: findColIdx(aliases.longPos),
    longChg: findColIdx(aliases.longChg),
    shortPos: findColIdx(aliases.shortPos),
    shortChg: findColIdx(aliases.shortChg)
  };

  if (idx.commodity === -1) idx.commodity = 0;
  
  // Positional logic: If "Long Chg" specifically isn't found, 
  // check if the column immediately after "Long Pos" is a "Change" column.
  if (idx.longPos !== -1 && (idx.longChg === -1 || idx.longChg === idx.netChg)) {
    const nextCol = idx.longPos + 1;
    if (changeIndices.includes(nextCol)) idx.longChg = nextCol;
  }
  
  if (idx.shortPos !== -1 && (idx.shortChg === -1 || idx.shortChg === idx.netChg || idx.shortChg === idx.longChg)) {
    const nextCol = idx.shortPos + 1;
    if (changeIndices.includes(nextCol)) idx.shortChg = nextCol;
  }

  const results: CotRecord[] = [];
  for (let i = headerRowIdx + 1; i < lines.length; i++) {
    const parts = splitLine(lines[i]);
    if (parts.length <= idx.commodity) continue;

    const commodity = parts[idx.commodity]?.replace(/"/g, '') || 'Unknown';
    if (commodity.toLowerCase().includes('downloaded') || commodity.toLowerCase().includes('barchart') || commodity.length < 2) continue;

    const netVal = idx.netPos !== -1 ? (parts[idx.netPos] || '0') : '0';
    const netChgVal = idx.netChg !== -1 ? (parts[idx.netChg] || '0') : '0';
    const longVal = idx.longPos !== -1 ? (parts[idx.longPos] || '0') : '0';
    const longChgVal = idx.longChg !== -1 ? (parts[idx.longChg] || '0') : '0';
    const shortVal = idx.shortPos !== -1 ? (parts[idx.shortPos] || '0') : '0';
    const shortChgVal = idx.shortChg !== -1 ? (parts[idx.shortChg] || '0') : '0';

    results.push({
      commodity,
      netPositions: netVal,
      netChange: netChgVal,
      longPositions: longVal,
      longChange: longChgVal,
      shortPositions: shortVal,
      shortChange: shortChgVal,
      numNetPos: parseValue(netVal),
      numNetChange: parseValue(netChgVal),
      numLong: parseValue(longVal),
      numShort: parseValue(shortVal)
    });
  }
  return results;
};

export const parseHistoricalCSV = (csv: string): HistoricalCotRecord[] => {
  if (!csv) return [];
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headerRowIdx = findHeaderRowIndex(lines, [['commodity', 'asset', 'market']]);
  const rawHeaders = splitLine(lines[headerRowIdx]);
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/["\s._-]/g, ''));
  
  const commodityIdx = headers.findIndex(h => ['commodity', 'asset', 'market', 'instrument', 'name'].some(k => h.includes(k)));
  const finalCommIdx = commodityIdx === -1 ? 0 : commodityIdx;

  const dateIndices: number[] = [];
  rawHeaders.forEach((h, i) => {
    if (i === finalCommIdx) return;
    const cleanH = h.toLowerCase();
    const isMetadata = ['high', 'low', 'range', 'average', 'change', '%', 'chg', 'volatility', 'openinterest'].some(k => cleanH.includes(k));
    if (!isMetadata && h.length > 2) dateIndices.push(i);
  });

  const results: HistoricalCotRecord[] = [];
  for (let i = headerRowIdx + 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.length <= finalCommIdx) continue;
    const commodity = cells[finalCommIdx].replace(/"/g, '');
    if (commodity.toLowerCase().includes('downloaded') || commodity.toLowerCase().includes('barchart') || commodity.length < 2) continue;
    const weeks = dateIndices.map(idx => ({
      date: rawHeaders[idx].replace(/"/g, ''),
      value: cells[idx] || '0',
      numValue: parseValue(cells[idx] || '0')
    })).filter(w => w.date && w.date.trim() !== '');
    results.push({ commodity, weeks });
  }
  return results;
};
