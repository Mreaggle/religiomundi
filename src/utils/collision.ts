export interface LabelCandidate {
  key: string;
  x: number;
  y: number;
  label: string;
  priority: number;
}

interface LabelBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function overlaps(a: LabelBox, b: LabelBox): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function selectCollisionFreeLabels(
  candidates: LabelCandidate[],
  scale: number,
  placement: "below" | "center" = "below",
): Set<string> {
  const accepted = new Set<string>();
  const boxes: LabelBox[] = [];
  const visualGrowth = Math.sqrt(Math.max(1, scale));
  const ordered = [...candidates].sort(
    (a, b) => b.priority - a.priority || a.label.localeCompare(b.label, "pt-BR"),
  );

  for (const candidate of ordered) {
    const width = Math.min(310, Math.max(54, candidate.label.length * 6.2) * visualGrowth);
    const screenX = candidate.x * scale;
    const screenY = candidate.y * scale;
    const vertical =
      placement === "center"
        ? {
            top: screenY - 10 * visualGrowth,
            bottom: screenY + 10 * visualGrowth,
          }
        : {
            top: screenY + 9 * visualGrowth,
            bottom: screenY + 36 * visualGrowth,
          };
    const box = {
      left: screenX - width / 2 - 8,
      right: screenX + width / 2 + 8,
      ...vertical,
    };
    if (boxes.some((existing) => overlaps(existing, box))) continue;
    accepted.add(candidate.key);
    boxes.push(box);
  }
  return accepted;
}

export function semanticZoomScale(scale: number): number {
  return 1 / Math.sqrt(Math.max(1, scale));
}

export function expandedTraditionPosition(
  center: [number, number],
  index: number,
  total: number,
  width = 1200,
  height = 700,
  limit = 48,
): [number, number] {
  const visible = Math.max(1, Math.min(limit, total));
  const columns = Math.ceil(visible / 10);
  const rows = Math.ceil(visible / columns);
  const column = Math.floor(index / rows);
  const row = index % rows;
  const columnGap = 190;
  const rowGap = 24;
  const horizontalSpan = (columns - 1) * columnGap;
  const verticalSpan = (rows - 1) * rowGap;
  const layoutCenterX = Math.min(
    width - 180 - horizontalSpan / 2,
    Math.max(100 + horizontalSpan / 2, center[0]),
  );
  const layoutCenterY = Math.min(
    height - 80 - verticalSpan / 2,
    Math.max(110 + verticalSpan / 2, center[1]),
  );
  return [
    layoutCenterX + (column - (columns - 1) / 2) * columnGap,
    layoutCenterY + (row - (rows - 1) / 2) * rowGap,
  ];
}
