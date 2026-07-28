import { type GeoProjection, geoGraticule10, geoNaturalEarth1, geoPath } from "d3";
import { useMemo } from "react";
import { feature } from "topojson-client";
import worldTopology from "world-atlas/countries-110m.json";

export function useWorldGeometry(extent: [[number, number], [number, number]]): {
  projection: GeoProjection;
  countriesPath: string;
  graticulePath: string;
  spherePath: string;
} {
  return useMemo(() => {
    const topology = worldTopology as unknown as {
      objects: { countries: Parameters<typeof feature>[1] };
    };
    const countries = feature(topology as never, topology.objects.countries) as never;
    const projection = geoNaturalEarth1().fitExtent(extent, { type: "Sphere" });
    const path = geoPath(projection);
    return {
      projection,
      countriesPath: path(countries) ?? "",
      graticulePath: path(geoGraticule10()) ?? "",
      spherePath: path({ type: "Sphere" }) ?? "",
    };
  }, [extent]);
}

export function MapGeometry({
  extent,
  className = "",
}: {
  extent: [[number, number], [number, number]];
  className?: string;
}) {
  const geometry = useWorldGeometry(extent);
  return (
    <g className={`world-geometry ${className}`}>
      <path className="map-sphere" d={geometry.spherePath} />
      <path className="map-graticule" d={geometry.graticulePath} />
      <path className="map-countries" d={geometry.countriesPath} />
    </g>
  );
}
