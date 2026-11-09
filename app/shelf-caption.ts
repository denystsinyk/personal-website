export type Bounds = { left: number; top: number; right: number; bottom: number };
type Side = "left" | "right" | "top" | "bottom";

export type CaptionPosition = {
  left: number;
  top: number;
  side: Side;
  arrowOffset: number;
};

/** Place a caption near its object, clear of the artwork at that height. */
export function positionShelfCaption(
  scene: Bounds,
  item: Bounds,
  caption: { width: number; height: number },
  viewport: { width: number; height: number },
  silhouette: readonly Bounds[] = [scene],
): CaptionPosition {
  const gap = 12;
  const padding = 12;
  const { width, height } = caption;
  const centerX = (item.left + item.right) / 2;
  const centerY = (item.top + item.bottom) / 2;
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
  const alignedLeft = clamp(centerX - width / 2, padding, viewport.width - width - padding);
  const alignedTop = clamp(centerY - height / 2, padding, viewport.height - height - padding);
  const horizontalCandidates = (side: "left" | "right") => {
    // A lower offset can clear a neighboring object while the arrow still points
    // toward the selected object's lower edge (for example, cleats below a bag).
    const tops = [alignedTop, item.top, item.bottom - height, item.bottom - height / 4].map(
      (top) => clamp(top, padding, viewport.height - height - padding),
    );
    return tops.map((top) => {
      const rows = silhouette.filter(
        (row) => row.bottom > top - gap && row.top < top + height + gap,
      );
      const edge =
        side === "left"
          ? Math.min(...rows.map((row) => row.left), item.left)
          : Math.max(...rows.map((row) => row.right), item.right);
      return { left: side === "left" ? edge - width - gap : edge + gap, top };
    });
  };
  const candidates = {
    left: horizontalCandidates("left"),
    right: horizontalCandidates("right"),
    top: [{ left: alignedLeft, top: scene.top - height - gap }],
    bottom: [{ left: alignedLeft, top: scene.bottom + gap }],
  };
  const horizontal: Side = centerX < (scene.left + scene.right) / 2 ? "left" : "right";
  const vertical: Side = centerY < (scene.top + scene.bottom) / 2 ? "top" : "bottom";
  const order: Side[] = [
    horizontal,
    vertical,
    vertical === "top" ? "bottom" : "top",
    horizontal === "left" ? "right" : "left",
  ];
  const fits = (candidate: { left: number; top: number }) => {
    return (
      candidate.left >= padding &&
      candidate.top >= padding &&
      candidate.left + width <= viewport.width - padding &&
      candidate.top + height <= viewport.height - padding
    );
  };
  const distance = (candidate: { left: number; top: number }) => {
    const horizontalGap = Math.max(
      item.left - candidate.left - width,
      candidate.left - item.right,
      0,
    );
    return horizontalGap + Math.abs(candidate.top + height / 2 - centerY) * 0.25;
  };
  const available = order.flatMap((side) =>
    candidates[side]
      .filter(fits)
      .sort((a, b) => distance(a) - distance(b))
      .map((candidate) => ({ ...candidate, side })),
  );
  // When the scene fills the viewport, still keep the caption outside the art.
  const fallback: Side = scene.top > viewport.height - scene.bottom ? "top" : "bottom";
  const { left, top, side } = available[0] ?? { ...candidates[fallback][0], side: fallback };
  const arrowOffset =
    side === "left" || side === "right"
      ? clamp(centerY - top, 12, height - 12)
      : clamp(centerX - left, 12, width - 12);
  return { left, top, side, arrowOffset };
}
