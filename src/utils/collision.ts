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
