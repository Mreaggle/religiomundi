import type { ChronologyPeriod, TemporalMode, Tradition } from "../types/atlas";

export const TIMELINE_SEGMENTS = [
  { start: -180000, end: -100000, from: 0, to: 70 },
  { start: -100000, end: -3200, from: 70, to: 180 },
  { start: -3200, end: -1200, from: 180, to: 320 },
  { start: -1200, end: -200, from: 320, to: 430 },
  { start: -200, end: 600, from: 430, to: 550 },
  { start: 600, end: 1450, from: 550, to: 670 },
  { start: 1450, end: 1800, from: 670, to: 770 },
  { start: 1800, end: 1945, from: 770, to: 870 },
  { start: 1945, end: 2026, from: 870, to: 1000 },
];

export function yearToPosition(year: number): number {
  const segment =
    TIMELINE_SEGMENTS.find((item) => year >= item.start && year <= item.end) ??
    (year < TIMELINE_SEGMENTS[0].start
      ? TIMELINE_SEGMENTS[0]
      : TIMELINE_SEGMENTS[TIMELINE_SEGMENTS.length - 1]);
  const ratio = (year - segment.start) / (segment.end - segment.start);
  return segment.from + Math.max(0, Math.min(1, ratio)) * (segment.to - segment.from);
}

export function positionToYear(position: number): number {
  const segment =
    TIMELINE_SEGMENTS.find((item) => position >= item.from && position <= item.to) ??
    TIMELINE_SEGMENTS[TIMELINE_SEGMENTS.length - 1];
  const ratio = (position - segment.from) / (segment.to - segment.from);
  return Math.round(
    segment.start + Math.max(0, Math.min(1, ratio)) * (segment.end - segment.start),
  );
}

export function formatYear(year: number): string {
  if (year < 0) return `${new Intl.NumberFormat("pt-BR").format(Math.abs(year))} a.C.`;
  if (year === 0) return "transição a.C./d.C.";
  return `${new Intl.NumberFormat("pt-BR").format(year)} d.C.`;
}

export function chronologyForYear(chronology: ChronologyPeriod[], year: number): ChronologyPeriod {
  return (
    chronology.find((period) => year >= period.startYear && year <= period.endYear) ??
    chronology[chronology.length - 1]
  );
}

export function emergenceWindow(year: number): number {
  if (year < -20000) return 12000;
  if (year < -3200) return 2500;
  if (year < -1200) return 450;
  if (year < 600) return 180;
  if (year < 1450) return 120;
  if (year < 1800) return 60;
  if (year < 1945) return 24;
  return 8;
}

export function traditionIsVisible(
  tradition: Tradition,
  year: number,
  mode: TemporalMode,
): boolean {
  if (mode === "catalog") return true;
  if (tradition.startYear === undefined) {
    return mode === "panorama" && tradition.isStillActive && year === (tradition.endYear ?? 2026);
  }
  const start = tradition.startYear;
  const end = tradition.endYear ?? start;
  if (mode === "panorama") return year >= start && year <= end;
  if (tradition.temporalPrecision === "unknown") return false;
  return Math.abs(start - year) <= emergenceWindow(year);
}
