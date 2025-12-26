import {
  DEFAULT_Y_AXIS_WIDTH,
  MAX_CONTENT_WIDTH,
  MAX_Y_AXIS_WIDTH,
  MIN_Y_AXIS_WIDTH,
  Y_AXIS_LINE_WIDTH,
  Y_AXIS_WIDTH_CSS_VAR,
} from "../constants.ts";
import { Orientation } from "../types";

export function noop() {}
export function echo<T extends string | number>(value: T): T {
  return value;
}

/**
 * Checks whether the dataset contains both positive and negative values.
 * @param {number[]} values - Array of numeric values to analyze.
 * @returns {[boolean, boolean]} Both true if at least one value is positive and one is negative.
 */
export function checkIfSomePositiveAndNegative(
  values: number[] = [],
): [boolean, boolean] {
  const hasPositive = values.some((value) => value > 0);
  const hasNegative = values.some((value) => value < 0);
  return [hasPositive, hasNegative];
}

/**
 * Checks whether all values in the dataset are either entirely positive or entirely negative.
 * @param {number[]} values - Array of numeric values to check.
 * @returns {[boolean, boolean]} Both true if all values have the same sign (all >= 0 or all <= 0).
 */
export function checkIfAllPositiveOrNegative(
  values: number[] = [],
): [boolean, boolean] {
  if (!values.length) {
    return [false, false];
  }
  const allPositive = values.every((value) => value >= 0);
  const allNegative = values.every((value) => value <= 0);
  return [allPositive, allNegative];
}

/**
 * Use label formatter if it exists, or return the original label.
 * @param {string | number} label - Axis or bar label
 * @param [formatter=echo] - Axis or bar label formatter
 */
export function formatLabel<T extends string | number>(
  label: T,
  formatter: (value: T) => string | number = echo,
): string | number {
  return formatter(label);
}

/**
 * Computes the minimum and maximum values from the dataset
 * and returns them expressed as percentages.
 * @param {number[]} values - Array of numeric values.
 * @param {number} numOfTicks - Number of ticks for y-axis.
 * @returns {[number, number]} Min and max values in percentage form (0–100).
 */
export function getMinAndMaxInPercentages(
  values: number[] = [],
  numOfTicks: number = 5,
): [number, number] {
  if (!values.length) {
    return [0, 0];
  }

  const [hasPositive, hasNegative] = checkIfSomePositiveAndNegative(values);

  // TODO: check if correct
  // calculate the next positive value divisible by the number of ticks
  const maxValue = Math.abs(
    (numOfTicks - 1) *
      Math.ceil(
        Math.max(
          ...values.map((value) => Math.round(Math.abs(value) * 10) / 10),
        ) /
          (numOfTicks - 1),
      ),
  );

  return [hasNegative ? -Math.abs(maxValue) : 0, hasPositive ? maxValue : 0];
}

/**
 * Generates a list of tick values for the value axis based on
 * all the values and desired tick count.
 * @param {number} min - Minimum bar value.
 * @param {number} max - Maximum bar value.
 * @param {number} numOfTicks - Number of ticks for the axis.
 * @param {number} granularity - Force the rough tick step to the next available increment.
 * @returns {number[]} An array of tick values evenly distributed across the range.
 */
export function generateTicks(
  min: number = 0,
  max: number = 100,
  numOfTicks: number = 5,
  granularity: number = 0.5,
): number[] {
  if (numOfTicks <= 1) {
    return [];
  }

  let start = min;
  let stop = max;

  if (min === max) {
    // expand the range equally by 10%
    let offset = 1;
    if (min !== 0) {
      const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(min))));
      offset = magnitude * 0.1;
    }
    start = min - offset;
    stop = min + offset;
  }

  let step = (stop - start) / (numOfTicks - 1);
  if (step === 0) {
    step = 1;
  }
  const power = Math.floor(Math.log10(step));
  const magnitude = Math.pow(10, power);
  const normalizedStep = step / magnitude;
  const factor = Math.ceil(normalizedStep / granularity) * granularity;
  const increment = parseFloat((factor * magnitude).toPrecision(12));

  const decimalIndex = increment.toString().indexOf(".");
  const decimals =
    decimalIndex >= 0 ? increment.toString().length - decimalIndex - 1 : 0;

  let axisMin;
  if (start < 0 && stop > 0) {
    axisMin = -Math.floor(numOfTicks / 2) * increment;
  } else if (stop <= 0) {
    axisMin = stop - increment * (numOfTicks - 1);
  } else {
    axisMin = start;
  }

  return Array.from({ length: numOfTicks }, (_, index) => {
    const factor = Math.pow(10, decimals);
    return Math.round((axisMin + index * increment) * factor) / factor;
  });
}

/**
 * Converts a given numeric value into a percentage of a reference size.
 * @param {number} value - The value to convert.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} The value expressed as a percentage of the total.
 */
export function getSizeInPercentages(
  value: number = 0,
  min: number = 0,
  max: number = 100,
): number {
  if (value > 0) {
    return (value * 100) / max;
  }
  if (value < 0) {
    return -(Math.abs(value) * 100) / Math.abs(min);
  }
  return 0;
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
 * Calculates the width of the y-axis based on label content,
 * label formatting, tick labels, and any additional spacing.
 * @param {HTMLElement} textSizeDiv - Existing element used to measure text size.
 * @param {HTMLElement} wrapper - Chart wrapper element.
 * @param {HTMLElement} yAxis - Y-axis element.
 * @param {(string | number)[]} values - Either ticks or labels depending on the orientation.
 * @param formatter - Axis label formatter.
 * @returns {number} Y-axis width in pixels.
 */
export function calculateYAxisWidths(
  textSizeDiv: HTMLElement,
  wrapper: HTMLElement,
  yAxis: HTMLElement,
  values: (string | number)[] = [],
  formatter: (value: number | string) => string | number = echo,
): number[] {
  const result = new Map<string, number>([
    ["min", MIN_Y_AXIS_WIDTH],
    ["width", DEFAULT_Y_AXIS_WIDTH],
    ["max", MAX_Y_AXIS_WIDTH],
  ]);

  if (values.length && !!textSizeDiv && !!wrapper && !!yAxis) {
    // reset width when values change so that the new one is calculated correctly
    yAxis.style.removeProperty("width");

    const sortedValues = [...values].sort((a, b) => {
      const strA = a.toString();
      const strB = b.toString();
      if (strB.length !== strA.length) {
        return strB.length - strA.length;
      }
      return strB.localeCompare(strA);
    });
    const longestLabelWidth = getTextWidth(
      textSizeDiv,
      formatter(sortedValues[0]).toString(),
    );
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

/**
 * Returns the new y-axis width based on min, max and current width in percentages.
 * @param {Object} params - Configuration options.
 * @param {number} [params.currentPercentage=0] - Previously applied y-axis width (in %).
 * @param {number} [params.minWidth=0] - Minimum allowed width (in #).
 * @param {number} [params.maxWidth=100] - Maximum allowed width (in #).
 * @param {number} params.widthPercentage - Newly calculated required width (in %).
 * @returns {number | null} Updated y-axis width in pixels or null if current and new are the same.
 */
export function getUpdatedYAxisWidth({
  currentPercentage = 0,
  minWidth = 0,
  maxWidth = 100,
  widthPercentage,
}: {
  currentPercentage?: number;
  minWidth?: number;
  maxWidth?: number;
  widthPercentage: number;
}): number | null {
  if (currentPercentage === widthPercentage) {
    return null;
  }
  const max = maxWidth - minWidth;
  const absolute = (max * widthPercentage) / 100;
  return absolute + minWidth;
}
