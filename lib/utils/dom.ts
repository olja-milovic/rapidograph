import {
  DEFAULT_Y_AXIS_WIDTH,
  MAX_CONTENT_WIDTH,
  MAX_Y_AXIS_WIDTH,
  MIN_Y_AXIS_WIDTH,
  Orientation,
  Y_AXIS_LINE_WIDTH,
  Y_AXIS_WIDTH_CSS_VAR,
} from "../shared";

/**
 * Measures the rendered width of a given text string in a specific font.
 * @param {HTMLElement} textSizeDiv - Existing element used to measure text size.
 * @param {string} text - The text to measure.
 * @returns {number} The width of the text in pixels.
 */
export function getTextWidth(
  textSizeDiv: HTMLElement,
  text: string = "",
): number {
  if (!text || !textSizeDiv) {
    return 0;
  }

  const content = document.createTextNode(text);
  textSizeDiv.appendChild(content);
  const width = Math.ceil(textSizeDiv.getBoundingClientRect().width);
  textSizeDiv.replaceChildren();

  return width;
}

/**
 * Calculates the size of the browser's scrollbar.
 * Useful for layout adjustments when dragging y-axis.
 * @param {Orientation} orientation - Chart orientation.
 * @param {HTMLElement} scrollableElement - Chart element that can be scrolled.
 * @returns {number} The scrollbar size in pixels.
 */
export function getScrollbarSize(
  orientation: Orientation,
  scrollableElement: HTMLElement,
): number {
  let width = 0;
  if (orientation === Orientation.Vertical) {
    width = scrollableElement.offsetHeight - scrollableElement.clientHeight;
  }
  if (orientation === Orientation.Horizontal) {
    width = scrollableElement.offsetWidth - scrollableElement.clientWidth;
  }
  return width;
}

/**
 * Calculates the width of the y-axis based on label content,
 * label formatting, tick labels, and any additional spacing.
 * @param {HTMLElement} textSizeDiv - Existing element used to measure text size.
 * @param {HTMLElement} wrapper - Chart wrapper element.
 * @param {HTMLElement} yAxis - Y-axis element.
 * @param {(string | number)[]} formattedValues - Formatted ticks or labels (depending on the orientation).
 * @returns {number} Y-axis width in pixels.
 */
export function calculateYAxisWidths<T extends string | number>(
  textSizeDiv: HTMLElement,
  wrapper: HTMLElement,
  yAxis: HTMLElement,
  formattedValues: T[] = [],
): number[] {
  const result = new Map<string, number>([
    ["min", MIN_Y_AXIS_WIDTH],
    ["width", DEFAULT_Y_AXIS_WIDTH],
    ["max", MAX_Y_AXIS_WIDTH],
  ]);

  if (formattedValues.length && !!textSizeDiv && !!wrapper && !!yAxis) {
    // reset width when values change so that the new one is calculated correctly
    yAxis.style.removeProperty("width");

    let longestLabel = "";
    formattedValues.forEach((value) => {
      const label = value.toString();
      if (label.length > longestLabel.length) {
        longestLabel = label;
      }
    });
    const longestLabelWidth = getTextWidth(textSizeDiv, longestLabel);
    // margin 8px + 2px to avoid ellipsis = 6
    let newWidth = longestLabelWidth + Y_AXIS_LINE_WIDTH + 6;
    result.set("min", Math.min(newWidth, MIN_Y_AXIS_WIDTH));
    result.set("max", Math.max(newWidth, MAX_Y_AXIS_WIDTH));

    if (newWidth > DEFAULT_Y_AXIS_WIDTH) {
      newWidth = DEFAULT_Y_AXIS_WIDTH;
    }
    if (newWidth > wrapper.offsetWidth - MAX_CONTENT_WIDTH) {
      newWidth = wrapper.offsetWidth - MAX_CONTENT_WIDTH;
    }

    result.set("width", newWidth);
    wrapper.style.setProperty(Y_AXIS_WIDTH_CSS_VAR, `${newWidth}px`);
    yAxis.style.setProperty("width", `var(${Y_AXIS_WIDTH_CSS_VAR})`);
  }

  return Array.from(result.values());
}
