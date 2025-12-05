import { Orientation, TooltipPosition } from "../types";

export function positionTooltip(
  orientation: Orientation,
  entries: IntersectionObserverEntry[],
): void {
  (function () {
    entries.forEach(
      ({
        intersectionRatio,
        boundingClientRect,
        rootBounds,
        target,
      }: IntersectionObserverEntry) => {
        if (!(target instanceof HTMLElement)) {
          return;
        }

        if (intersectionRatio >= 1) {
          target.style.opacity = "1";
          return;
        }

        const { top = 0, right = 0, bottom = 0, left = 0 } = rootBounds || {};
        const collisions = {
          top: boundingClientRect.top < top,
          right: boundingClientRect.right > right,
          bottom: boundingClientRect.bottom > bottom,
          left: boundingClientRect.left < left,
        };
        const currentPosition = target.getAttribute("position");

        if (orientation === Orientation.Vertical) {
          if (currentPosition === "right" && collisions.right) {
            target.setAttribute("position", TooltipPosition.Left);
          }
          if (currentPosition === "left" && collisions.left) {
            target.setAttribute("position", TooltipPosition.Right);
          }
        } else {
          if (currentPosition === "bottom" && collisions.bottom) {
            target.setAttribute("position", TooltipPosition.Top);
          }
          if (currentPosition === "top" && collisions.top) {
            target.setAttribute("position", TooltipPosition.Bottom);
          }
        }

        target.style.opacity = "1";
      },
    );
  })();
}
