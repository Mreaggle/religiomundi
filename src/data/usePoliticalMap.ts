import { useEffect, useMemo, useState } from "react";
import type {
  PoliticalMapIndex,
  PoliticalSnapshot,
  PoliticalSnapshotIndex,
} from "../types/polities";
import { assetUrl } from "../utils/assets";

const snapshotCache = new Map<string, Promise<PoliticalSnapshot>>();
let indexPromise: Promise<PoliticalMapIndex> | undefined;

function loadJson<T>(path: string): Promise<T> {
  return fetch(assetUrl(path)).then((response) => {
    if (!response.ok) throw new Error(`Falha ao carregar ${path} (${response.status})`);
    return response.json() as Promise<T>;
  });
}

function loadIndex(): Promise<PoliticalMapIndex> {
  indexPromise ??= loadJson<PoliticalMapIndex>("data/polities/index.json");
  return indexPromise;
}

function loadSnapshot(entry: PoliticalSnapshotIndex): Promise<PoliticalSnapshot> {
  let request = snapshotCache.get(entry.file);
  if (!request) {
    request = loadJson<PoliticalSnapshot>(`data/polities/${entry.file}`);
    snapshotCache.set(entry.file, request);
  }
  return request;
}

export function selectPoliticalSnapshot(
  snapshots: PoliticalSnapshotIndex[],
  selectedYear: number,
): PoliticalSnapshotIndex | undefined {
  let selected: PoliticalSnapshotIndex | undefined;
  for (const snapshot of snapshots) {
    if (snapshot.year > selectedYear) break;
    selected = snapshot;
  }
  return selected;
}

interface PoliticalMapState {
  index?: PoliticalMapIndex;
  requested?: PoliticalSnapshotIndex;
  snapshot?: PoliticalSnapshot;
  loading: boolean;
  stale: boolean;
  error?: string;
}

export function usePoliticalMap(selectedYear: number, enabled = true): PoliticalMapState {
  const [index, setIndex] = useState<PoliticalMapIndex>();
  const [snapshot, setSnapshot] = useState<PoliticalSnapshot>();
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    loadIndex()
      .then((value) => {
        if (active) setIndex(value);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Falha cartográfica");
      });
    return () => {
      active = false;
    };
  }, []);

  const requested = useMemo(
    () => (index ? selectPoliticalSnapshot(index.snapshots, selectedYear) : undefined),
    [index, selectedYear],
  );

  useEffect(() => {
    if (!enabled || !requested) {
      setLoading(false);
      if (!requested) setSnapshot(undefined);
      return;
    }

    let active = true;
    setLoading(true);
    setError(undefined);
    loadSnapshot(requested)
      .then((value) => {
        if (!active) return;
        setSnapshot(value);
        setLoading(false);

        const currentIndex =
          index?.snapshots.findIndex((item) => item.file === requested.file) ?? -1;
        const adjacent = [
          index?.snapshots[currentIndex - 1],
          index?.snapshots[currentIndex + 1],
        ].filter((item): item is PoliticalSnapshotIndex => Boolean(item));
        const prefetch = () => {
          for (const entry of adjacent) void loadSnapshot(entry).catch(() => undefined);
        };
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(prefetch, { timeout: 1800 });
        } else {
          globalThis.setTimeout(prefetch, 400);
        }
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setLoading(false);
        setError(reason instanceof Error ? reason.message : "Falha cartográfica");
      });

    return () => {
      active = false;
    };
  }, [enabled, index, requested]);

  return {
    index,
    requested,
    snapshot,
    loading,
    stale: Boolean(snapshot && requested && snapshot.snapshotYear !== requested.year),
    error,
  };
}
