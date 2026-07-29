import { zoom as createZoom, type Selection, select, type ZoomBehavior, zoomIdentity } from "d3";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

interface SvgZoomOptions {
  width: number;
  height: number;
  minScale?: number;
  maxScale?: number;
  contentWidth?: number;
  contentHeight?: number;
}

export function useSvgZoom(
  svgRef: RefObject<SVGSVGElement>,
  viewportRef: RefObject<SVGGElement>,
  {
    width,
    height,
    minScale = 0.85,
    maxScale = 9,
    contentWidth = width,
    contentHeight = height,
  }: SvgZoomOptions,
) {
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown>>();
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const svg = svgRef.current;
    const viewport = viewportRef.current;
    if (!svg || !viewport) return;

    const behavior = createZoom<SVGSVGElement, unknown>()
      .extent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([minScale, maxScale])
      .translateExtent([
        [-width * 0.65, -height * 0.65],
        [
          Math.max(width * 1.65, contentWidth + width * 0.65),
          Math.max(height * 1.65, contentHeight + height * 0.65),
        ],
      ])
      .wheelDelta((event) => {
        const unit = event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002;
        return -event.deltaY * unit * (event.ctrlKey ? 4 : 1);
      })
      .on("start", () => svg.classList.add("is-interacting"))
      .on("zoom", (event) => {
        viewport.setAttribute("transform", event.transform.toString());
        scaleRef.current = event.transform.k;
        setScale(event.transform.k);
      })
      .on("end", () => svg.classList.remove("is-interacting"));

    behaviorRef.current = behavior;
    select(svg).call(behavior);

    return () => {
      select(svg).on(".zoom", null);
      behaviorRef.current = undefined;
    };
  }, [contentHeight, contentWidth, height, maxScale, minScale, svgRef, viewportRef, width]);

  const animate = useCallback(
    (
      operation: (
        selection: Selection<SVGSVGElement, unknown, null, undefined>,
        behavior: ZoomBehavior<SVGSVGElement, unknown>,
      ) => void,
    ) => {
      const svg = svgRef.current;
      const behavior = behaviorRef.current;
      if (!svg || !behavior) return;
      operation(select(svg), behavior);
    },
    [svgRef],
  );

  const zoomBy = useCallback(
    (factor: number) =>
      animate((selection, behavior) => {
        selection.transition().duration(180).call(behavior.scaleBy, factor);
      }),
    [animate],
  );

  const panBy = useCallback(
    (x: number, y: number) =>
      animate((selection, behavior) => {
        selection.call(behavior.translateBy, x / scaleRef.current, y / scaleRef.current);
      }),
    [animate],
  );

  const resetZoom = useCallback(
    () =>
      animate((selection, behavior) => {
        selection.transition().duration(220).call(behavior.transform, zoomIdentity);
      }),
    [animate],
  );

  const focusAt = useCallback(
    (x: number, y: number, requestedScale = 2.8) =>
      animate((selection, behavior) => {
        const targetScale = Math.max(minScale, Math.min(maxScale, requestedScale));
        const transform = zoomIdentity
          .translate(width / 2, height / 2)
          .scale(targetScale)
          .translate(-x, -y);
        selection.transition().duration(320).call(behavior.transform, transform);
      }),
    [animate, height, maxScale, minScale, width],
  );

  return { scale, zoomBy, panBy, resetZoom, focusAt };
}
