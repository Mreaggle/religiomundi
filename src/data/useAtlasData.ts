import { useEffect, useState } from "react";
import type { AtlasData } from "../types/atlas";
import { assetUrl } from "../utils/assets";

interface AtlasLoadState {
  data?: AtlasData;
  error?: string;
}

export function useAtlasData(): AtlasLoadState {
  const [state, setState] = useState<AtlasLoadState>({});

  useEffect(() => {
    const controller = new AbortController();
    fetch(assetUrl("data/atlas.generated.json"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Falha ao carregar os dados (${response.status})`);
        return response.json() as Promise<AtlasData>;
      })
      .then((data) => setState({ data }))
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") {
          setState({ error: error instanceof Error ? error.message : "Falha desconhecida" });
        }
      });
    return () => controller.abort();
  }, []);

  return state;
}
