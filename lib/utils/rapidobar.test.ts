// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  analyzeValues,
  echo,
  formatLabel,
  formatLabels,
  generateTicks,
  getSizeInPercentages,
  getUpdatedYAxisWidth,
  noop,
} from "./rapidobar";
import { describe, expect, it } from "vitest";
import { fn } from "storybook/test";

describe("noop", () => {
  it("should be a function that does nothing", () => {
    expect(typeof noop).toBe("function");
    expect(noop()).toBeUndefined();
  });

  it("should not throw with any arguments", () => {
    expect(() => noop("arg1", 123, { test: true })).not.toThrow();
  });
});

describe("echo", () => {
  it("should return the same string value passed to it", () => {
    expect(echo("hello")).toBe("hello");
    expect(echo("")).toBe("");
  });

  it("should return the same number value passed to it", () => {
    expect(echo(42)).toBe(42);
    expect(echo(0)).toBe(0);
    expect(echo(-10)).toBe(-10);
    expect(echo(3.14)).toBe(3.14);
  });

  it("should preserve the type of the input", () => {
    const stringResult = echo("test");
    const numberResult = echo(123);

    expect(typeof stringResult).toBe("string");
    expect(typeof numberResult).toBe("number");
    expect(typeof echo()).toBe("undefined");
  });
});

describe("analyzeValues", () => {
  it("should return default values for empty array", () => {
    expect(analyzeValues([])).toEqual({
      min: 0,
      max: 0,
      axisMin: 0,
      axisMax: 0,
      hasPositive: false,
      hasNegative: false,
      allPositive: false,
      allNegative: false,
    });
  });

  it("should analyze all positive values", () => {
    const result = analyzeValues([1, 2, 3]);
    expect(result.min).toBe(1);
    expect(result.max).toBe(3);
    expect(result.axisMin).toBe(1);
    expect(result.axisMax).toBe(3);
    expect(result.hasPositive).toBe(true);
    expect(result.hasNegative).toBe(false);
    expect(result.allPositive).toBe(true);
    expect(result.allNegative).toBe(false);
  });

  it("should analyze all negative values", () => {
    const result = analyzeValues([-1, -2, -3]);
    expect(result.min).toBe(-3);
    expect(result.max).toBe(-1);
    expect(result.axisMin).toBe(-3);
    expect(result.axisMax).toBe(-1);
    expect(result.hasPositive).toBe(false);
    expect(result.hasNegative).toBe(true);
    expect(result.allPositive).toBe(false);
    expect(result.allNegative).toBe(true);
  });

  it("should create symmetric axis bounds for mixed positive/negative values", () => {
    const result = analyzeValues([-1, 2, -3]);
    expect(result.min).toBe(-3);
    expect(result.max).toBe(2);
    expect(result.axisMin).toBe(-3);
    expect(result.axisMax).toBe(3);
    expect(result.hasPositive).toBe(true);
    expect(result.hasNegative).toBe(true);
    expect(result.allPositive).toBe(false);
    expect(result.allNegative).toBe(false);
  });

  it("should handle values with zeros", () => {
    const result = analyzeValues([0, 1, 2]);
    expect(result.hasPositive).toBe(true);
    expect(result.hasNegative).toBe(false);
    expect(result.allPositive).toBe(true);
    expect(result.allNegative).toBe(false);
  });

  it("should handle single value", () => {
    expect(analyzeValues([5]).hasPositive).toBe(true);
    expect(analyzeValues([-5]).hasNegative).toBe(true);
  });
});

describe("formatLabel", () => {
  it("should use the label formatter if it exists", () => {
    const customFormatter = fn((value) => `Formatted: ${value}`);

    const result = formatLabel("test", customFormatter);
    expect(customFormatter).toHaveBeenCalledWith("test");
    expect(result).toEqual("Formatted: test");
  });

  it("should use a numeric label formatter", () => {
    const customFormatter = fn((value) => value * 10);

    const result = formatLabel(42, customFormatter);
    expect(customFormatter).toHaveBeenCalledWith(42);
    expect(result).toEqual(420);
  });

  it("should return the original label if no formatter is provided", () => {
    expect(formatLabel("test")).toEqual("test");
    expect(formatLabel(42)).toEqual(42);
  });
});

describe("formatLabels", () => {
  it("should use the label formatter if it exists", () => {
    const customFormatter = fn((value) => `Formatted: ${value}`);

    const result = formatLabels(["test1", "test2"], customFormatter);
    expect(customFormatter).toHaveBeenCalledWith("test1");
    expect(customFormatter).toHaveBeenCalledWith("test2");
    expect(result).toEqual(["Formatted: test1", "Formatted: test2"]);
  });

  it("should use a numeric label formatter", () => {
    const customFormatter = fn((value) => value * 10);

    const result = formatLabels([42, 83], customFormatter);
    expect(customFormatter).toHaveBeenCalledWith(42);
    expect(customFormatter).toHaveBeenCalledWith(83);
    expect(result).toEqual([420, 830]);
  });

  it("should return the original label if no formatter is provided", () => {
    expect(formatLabels(["test1", "test2"])).toEqual(["test1", "test2"]);
    expect(formatLabels([42, 83])).toEqual([42, 83]);
  });
});

describe("generateTicks", () => {
  it("should return empty array if given number of ticks is 1 or less", () => {
    expect(generateTicks(0, 100, 1)).toEqual([]);
    expect(generateTicks(0, 100, 0)).toEqual([]);
    expect(generateTicks(0, 100, -8)).toEqual([]);
  });

  it("should generate ticks if min and max are equal with that value in the middle", () => {
    expect(generateTicks(9, 9)).toEqual([8.9, 8.95, 9, 9.05, 9.1]);
    expect(generateTicks(358, 358)).toEqual([348, 353, 358, 363, 368]);
    expect(generateTicks(-2_363, -2_363)).toEqual([
      -2_463, -2_413, -2_363, -2_313, -2_263,
    ]);
    expect(generateTicks(-13_722, -13_722)[2]).toEqual(-13_722);
  });

  it("should generate ticks for ranges between -10 and 10", () => {
    expect(generateTicks(0, 1)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(generateTicks(-2, 0)).toEqual([-2, -1.5, -1, -0.5, 0]);
    expect(generateTicks(-3, 3)[2]).toEqual(0);
    expect(generateTicks(0, 4)).toEqual([0, 1, 2, 3, 4]);
    expect(generateTicks(5, 10)).toEqual([5, 6.5, 8, 9.5, 11]);
    expect(generateTicks(-7, -2).at(-1)).toEqual(-2);
  });

  it("should return 5 ticks for ranges between -100 and 100", () => {
    expect(generateTicks(10, 11)).toEqual([10, 10.25, 10.5, 10.75, 11]);
    expect(generateTicks(0, 19)).toEqual([0, 5, 10, 15, 20]);
    expect(generateTicks(-38, 43)).toEqual([-50, -25, 0, 25, 50]);
  });

  it("should return 5 ticks for min < -100 and max > 100", () => {
    expect(generateTicks(0, 792)).toEqual([0, 200, 400, 600, 800]);
    expect(generateTicks(0, 38_947)).toEqual([
      0, 10_000, 20_000, 30_000, 40_000,
    ]);
    expect(generateTicks(-5_000_001, 7_982_368)).toEqual([
      -7_000_000, -3_500_000, 0, 3_500_000, 7_000_000,
    ]);
    expect(generateTicks(0.05, 10_000_302)).toEqual([
      0, 3_000_000, 6_000_000, 9_000_000, 12_000_000,
    ]);
  });
});

describe("getSizeInPercentages", () => {
  it("should convert a value within range to percentage", () => {
    expect(getSizeInPercentages(50, 0, 100)).toBeCloseTo(50);
    expect(getSizeInPercentages(75, 25, 100)).toBeCloseTo(66.666);
  });

  it("should handle negative values correctly", () => {
    expect(getSizeInPercentages(-50, -100, 0)).toBeCloseTo(50);
    expect(getSizeInPercentages(-25, -75, 0)).toBeCloseTo(33.33);
  });

  it("should handle cases where min and max are both positive", () => {
    expect(getSizeInPercentages(10, 0, 100)).toBeCloseTo(10);
    expect(getSizeInPercentages(20, 0, 100)).toBeCloseTo(20);
  });

  it("should handle cases where min and max are both negative", () => {
    expect(getSizeInPercentages(-50, -100, -20)).toBe(37.5);
    expect(getSizeInPercentages(-50, -100, -40)).toBeCloseTo(16.666);
  });

  it("should handle cases where min and max are both zero", () => {
    expect(getSizeInPercentages(0, 0, 0)).toBe(0);
  });

  it("should handle edge cases when value equals min or max", () => {
    expect(getSizeInPercentages(0, 0, 100)).toBeCloseTo(0);
    expect(getSizeInPercentages(100, 0, 100)).toBeCloseTo(100);
    expect(getSizeInPercentages(-100, -200, -50)).toBeCloseTo(33.33);
  });

  it("should handle cases with non-numeric values", () => {
    expect(getSizeInPercentages(null, null, null)).toBe(0);
    expect(getSizeInPercentages(undefined, undefined, undefined)).toBe(0);
    expect(getSizeInPercentages("20", "10", "30")).toBeCloseTo(50);
  });
});

describe("getUpdatedYAxisWidth", () => {
  it("should return null if current and new percentages are the same", () => {
    expect(
      getUpdatedYAxisWidth({ currentPercentage: 50, widthPercentage: 50 }),
    ).toBe(null);
    expect(
      getUpdatedYAxisWidth({ currentPercentage: 75, widthPercentage: 75 }),
    ).toBe(null);
  });

  it("should calculate the updated y-axis width based on min, max and current percentage", () => {
    expect(
      getUpdatedYAxisWidth({
        currentPercentage: 0,
        minWidth: 0,
        maxWidth: 100,
        widthPercentage: 50,
      }),
    ).toBe(50);
    expect(
      getUpdatedYAxisWidth({
        currentPercentage: 25,
        minWidth: 10,
        maxWidth: 90,
        widthPercentage: 75,
      }),
    ).toBe(70);
  });

  it("should handle cases where min and max are both positive", () => {
    expect(
      getUpdatedYAxisWidth({
        currentPercentage: 0,
        minWidth: 0,
        maxWidth: 100,
        widthPercentage: 20,
      }),
    ).toBe(20);
    expect(
      getUpdatedYAxisWidth({
        currentPercentage: 50,
        minWidth: 20,
        maxWidth: 80,
        widthPercentage: 75,
      }),
    ).toBe(65);
  });

  it("should handle edge cases when widthPercentage equals min or max", () => {
    expect(
      getUpdatedYAxisWidth({
        currentPercentage: 0,
        minWidth: 0,
        maxWidth: 100,
        widthPercentage: 0,
      }),
    ).toBe(null);
    expect(
      getUpdatedYAxisWidth({
        currentPercentage: 50,
        minWidth: 20,
        maxWidth: 80,
        widthPercentage: 100,
      }),
    ).toBe(80);
  });

  it("should handle cases where min and max are both zero", () => {
    expect(
      getUpdatedYAxisWidth({
        currentPercentage: 50,
        minWidth: 0,
        maxWidth: 0,
        widthPercentage: 50,
      }),
    ).toBeNull();
  });

  it("should handle non-numeric values", () => {
    expect(
      getUpdatedYAxisWidth({
        currentPercentage: null,
        minWidth: null,
        maxWidth: null,
        widthPercentage: "10",
      }),
    ).toBe(0);
    expect(
      getUpdatedYAxisWidth({
        currentPercentage: undefined,
        minWidth: undefined,
        maxWidth: undefined,
        widthPercentage: "50",
      }),
    ).toBe(50);
  });
});
