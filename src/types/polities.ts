import type { GeoGeometryObjects } from "d3";

export interface PoliticalMapSource {
  title: string;
  institution: string;
  url: string;
  role: string;
}

export interface PoliticalSnapshotIndex {
  year: number;
  label: string;
  file: string;
  featureCount: number;
  source: "historical-basemaps" | "natural-earth";
  precision: "varies" | "contemporary-reference";
}

export interface PoliticalMapIndex {
  title: string;
  generatedAt: string;
  selectionRule: "latest-snapshot-not-after-selected-year";
  interpolation: false;
  coordinatePrecision: number;
  simplificationToleranceDegrees: number;
  caveat: string;
  sources: PoliticalMapSource[];
  snapshots: PoliticalSnapshotIndex[];
}

export interface PolityProperties {
  name: string;
  subject: string;
  partOf: string;
  polityType: string;
  borderPrecision: 1 | 2 | 3;
  sourceUrl?: string;
}

export interface PolityFeature {
  type: "Feature";
  id: string;
  properties: PolityProperties;
  geometry: GeoGeometryObjects;
}

export interface PoliticalSnapshot {
  type: "FeatureCollection";
  snapshotYear: number;
  source: "historical-basemaps" | "natural-earth";
  sourceCommit?: string;
  sourceVersion?: string;
  features: PolityFeature[];
}
