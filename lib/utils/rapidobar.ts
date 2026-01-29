export function noop() {}
export function echo<T extends string | number>(value: T): T {
  return value;
}

/**
 * Analyzes an array of values in a single pass to extract min/max,
 * axis bounds, and positivity flags.
 * @param {number[]} values - Array of numeric values to analyze.
 */
export function analyzeValues(values: number[] = []) {
  if (!values.length) {
    return {
      min: 0,
      max: 0,
      axisMin: 0,
      axisMax: 0,
      hasPositive: false,
      hasNegative: false,
      allPositive: false,
      allNegative: false,
    };
  }

  let min = values[0];
  let max = values[0];
  let hasPositive = false;
  let hasNegative = false;
  let allPositive = true;
  let allNegative = true;

  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;

    if (value > 0) {
      hasPositive = true;
      allNegative = false;
    }
    if (value < 0) {
      hasNegative = true;
      allPositive = false;
    }
  }

  // Symmetric axis bounds for mixed positive/negative values
  let axisMin = min;
  let axisMax = max;
  if (hasPositive && hasNegative) {
    const absMax = Math.max(Math.abs(min), Math.abs(max));
    axisMin = -absMax;
    axisMax = absMax;
  }

  return {
    min,
    max,
    axisMin,
    axisMax,
    hasPositive,
    hasNegative,
    allPositive,
    allNegative,
  };
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
 * Use label formatter if it exists, or return the original labels.
 * @param {string | number} labels - Axis or bar labels.
 * @param [formatter=echo] - Axis or bar label formatter.
 * @returns {(string | number)[]} - Formatted labels.
 */
export function formatLabels<T extends string | number>(
  labels: T[],
  formatter: (value: T) => string | number = echo,
): (string | number)[] {
  return labels.map((label) => formatLabel(label, formatter));
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
  const start = +min;
  const stop = +max;
  const val = +value;

  if (start === 0 && stop === 0) {
    return 0;
  }

  if (start >= 0 && stop >= 0) {
    return ((val - start) / (stop - start)) * 100;
  }

  if (start <= 0 && stop <= 0) {
    return ((stop - val) / (stop - start)) * 100;
  }

  if (val >= 0) {
    return (val / stop) * 100;
  } else {
    return (Math.abs(val) / Math.abs(start)) * 100;
  }
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
  const curr = +currentPercentage;
  const min = +minWidth;
  const max = +maxWidth;
  const width = +widthPercentage;

  if (curr === width) {
    return null;
  }
  const maxValue = max - min;
  const absolute = (maxValue * width) / 100;
  return absolute + min;
}
