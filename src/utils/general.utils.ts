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

export function checkIfSomePositiveAndNegative(
  values: number[] = [],
): [boolean, boolean] {
  const hasPositive = values.some((value) => value > 0);
  const hasNegative = values.some((value) => value < 0);
  return [hasPositive, hasNegative];
}

export function checkIfAllPositiveOrNegative(
  values: number[] = [],
): [boolean, boolean] {
  const allPositive = values.every((value) => value >= 0);
  const allNegative = values.every((value) => value <= 0);
  return [allPositive, allNegative];
}

export function getMinAndMax(
  values: number[] = [],
  noOfTicks = 2,
): [number, number] {
  const [hasPositive, hasNegative] = checkIfSomePositiveAndNegative(values);

  // TODO: check if correct
  // calculate the next positive value divisible by the number of ticks
  const maxValue = Math.abs(
    (noOfTicks - 1) *
      Math.ceil(
        Math.max(
          ...values.map((value) => Math.round(Math.abs(value) * 10) / 10),
        ) /
          (noOfTicks - 1),
      ),
  );

  return [hasNegative ? -Math.abs(maxValue) : 0, hasPositive ? maxValue : 0];
}

export function generateTicks(
  values: number[] = [],
  ticks = 5,
  decimals = 1,
): number[] {
  const [min = 0, max = 100] = getMinAndMax(values, ticks);
  const interval = (max - min) / (ticks - 1);

  const tickValues = Array.from({ length: ticks - 1 }, (_, i) => i).reduce(
    (acc, tick) => {
      // TODO (olja): revisit logic, acc.length should always be > 0
      if (!acc.length) {
        acc.push(min + interval);
      } else {
        acc.push(acc[tick]! + interval);
      }
      return acc;
    },
    [min],
  );

  const power = Math.pow(10, decimals);
  return tickValues.map((value) => Math.round(value * power) / power);
}

export function getSizeInPercentages(value = 0, min = 0, max = 100) {
  if (value > 0) {
    return (value * 100) / max;
  }
  if (value < 0) {
    return -(Math.abs(value) * 100) / Math.abs(min);
  }
  return 0;
}

export function getScrollbarWidth(
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

export function calculateYAxisWidths(
  textSizeDiv: HTMLElement,
  wrapper: HTMLElement,
  yAxis: HTMLElement,
  values: (string | number)[] = [],
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
      sortedValues[0]!.toString(),
    );
    // margin 4px + 2px to avoid ellipsis = 6
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

export function getUpdatedYAxisWidth(
  currentPercentage: number = 0,
  minWidth = 0,
  maxWidth = 100,
  widthPercentage: number,
): number | null {
  if (currentPercentage === widthPercentage) {
    return null;
  }
  const max = maxWidth - minWidth;
  const absolute = (max * widthPercentage) / 100;
  return absolute + minWidth;
}
