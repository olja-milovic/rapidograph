import { describe, expect, it } from "vitest";
import {
  checkIfAllPositiveOrNegative,
  checkIfSomePositiveAndNegative,
  echo,
  formatLabel,
  generateTicks,
  noop,
} from "./index";
import { fn } from "storybook/test";

describe("Helper Functions", () => {
  it("should work correctly", () => {
    const result = "1";
    expect(result).toBeTypeOf("string");
  });
});

describe("noop", () => {
  it("should be a function that does nothing", () => {
    expect(typeof noop).toBe("function");
    expect(noop()).toBeUndefined();
  });

  it("should not throw with any arguments", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const undefinedResult = echo();

    expect(typeof stringResult).toBe("string");
    expect(typeof numberResult).toBe("number");
    expect(typeof undefinedResult).toBe("undefined");
  });
});

describe("checkIfSomePositiveAndNegative", () => {
  it("should check array with both positive and negative values", () => {
    const result = checkIfSomePositiveAndNegative([-1, 2, -3]);
    expect(result).toEqual([true, true]);
  });

  it("should check array with only negative values", () => {
    const result = checkIfSomePositiveAndNegative([-1, -2, -3]);
    expect(result).toEqual([false, true]);
  });

  it("should check an array with only positive values", () => {
    const result = checkIfSomePositiveAndNegative([1, 2, 3]);
    expect(result).toEqual([true, false]);
  });

  it("should check an empty array", () => {
    const result = checkIfSomePositiveAndNegative([]);
    expect(result).toEqual([false, false]);
  });

  it("should check array with one positive and two negative values", () => {
    const result = checkIfSomePositiveAndNegative([1, -2, -3]);
    expect(result).toEqual([true, true]);
  });

  it("should check array with one positive value and no negatives", () => {
    const result = checkIfSomePositiveAndNegative([1]);
    expect(result).toEqual([true, false]);
  });
});

describe("checkIfAllPositiveOrNegative", () => {
  it("should check array with all positive values", () => {
    const result = checkIfAllPositiveOrNegative([1, 2, 3]);
    expect(result).toEqual([true, false]);
  });

  it("should check array with all negative values", () => {
    const result = checkIfAllPositiveOrNegative([-1, -2, -3]);
    expect(result).toEqual([false, true]);
  });

  it("should check empty array", () => {
    const result = checkIfAllPositiveOrNegative([]);
    expect(result).toEqual([false, false]);
  });

  it("should check array with one positive and two negative values", () => {
    const result = checkIfAllPositiveOrNegative([1, -2, -3]);
    expect(result).toEqual([false, false]);
  });

  it("should check array with one negative and two positive values", () => {
    const result = checkIfAllPositiveOrNegative([-1, 2, 3]);
    expect(result).toEqual([false, false]);
  });

  it("should check array with a single positive value", () => {
    const result = checkIfAllPositiveOrNegative([1]);
    expect(result).toEqual([true, false]);
  });

  it("should check array with a single negative value", () => {
    const result = checkIfAllPositiveOrNegative([-1]);
    expect(result).toEqual([false, true]);
  });
});

describe("formatLabel", () => {
  it("should use the label formatter if it exists", () => {
    const customFormatter = fn((value) => `Formatted: ${value}`);

    const result = formatLabel("test", customFormatter);
    expect(customFormatter).toHaveBeenCalledWith("test");
    expect(result).toEqual("Formatted: test");
  });

  it("should return the original string label if no formatter is provided", () => {
    const result = formatLabel("test");
    expect(result).toEqual("test");
  });

  it("should use a numeric label formatter", () => {
    const customFormatter = fn((value) => value * 10);

    const result = formatLabel(42, customFormatter);
    expect(customFormatter).toHaveBeenCalledWith(42);
    expect(result).toEqual(420);
  });

  it("should return the original numeric label if no formatter is provided", () => {
    const result = formatLabel(42);
    expect(result).toEqual(42);
  });
});

describe("generateTicks", () => {
  describe("invalid parameters", () => {
    it("should return empty array if given number of ticks is 1 or less", () => {
      const result1 = generateTicks(0, 100, 1);
      const result0 = generateTicks(0, 100, 0);
      const resultNegative = generateTicks(0, 100, -8);

      expect(result1).toEqual([]);
      expect(result0).toEqual([]);
      expect(resultNegative).toEqual([]);
    });
  });

  it("should generate ticks if min and max are equal with that value in the middle", () => {
    const result1 = generateTicks(9, 9);
    const result2 = generateTicks(358, 358);
    const result3 = generateTicks(-2_363, -2_363);
    const result4 = generateTicks(-13_722, -13_722);

    expect(result1).toEqual([8.9, 8.95, 9, 9.05, 9.1]);
    expect(result2).toEqual([348, 353, 358, 363, 368]);
    expect(result3).toEqual([-2_463, -2_413, -2_363, -2_313, -2_263]);
    expect(result4[2]).toEqual(-13_722);
  });

  it("should generate ticks for ranges between -10 and 10", () => {
    const result1 = generateTicks(0, 1);
    const result2 = generateTicks(-2, 0);
    const result3 = generateTicks(-3, 3);
    const result4 = generateTicks(0, 4);
    const result5 = generateTicks(5, 10);
    const result6 = generateTicks(-7, -2);

    expect(result1).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(result2).toEqual([-2, -1.5, -1, -0.5, 0]);
    expect(result3[2]).toEqual(0);
    expect(result4).toEqual([0, 1, 2, 3, 4]);
    expect(result5).toEqual([5, 6.5, 8, 9.5, 11]);
    expect(result6.at(-1)).toEqual(-2);
  });

  it("should return 5 ticks for ranges between -100 and 100", () => {
    const result1 = generateTicks(10, 11);
    const result2 = generateTicks(0, 19);
    const result3 = generateTicks(-38, 43);

    expect(result1).toEqual([10, 10.25, 10.5, 10.75, 11]);
    expect(result2).toEqual([0, 5, 10, 15, 20]);
    expect(result3).toEqual([-50, -25, 0, 25, 50]);
  });

  it("should return 5 ticks for min < -100 and max > 100", () => {
    const result1 = generateTicks(0, 792);
    const result2 = generateTicks(0, 38_947);
    const result3 = generateTicks(-5_000_001, 7_982_368);
    const result4 = generateTicks(0.05, 10_000_302);

    expect(result1).toEqual([0, 200, 400, 600, 800]);
    expect(result2).toEqual([0, 10_000, 20_000, 30_000, 40_000]);
    expect(result3).toEqual([-7_000_000, -3_500_000, 0, 3_500_000, 7_000_000]);
    expect(result4).toEqual([0, 3_000_000, 6_000_000, 9_000_000, 12_000_000]);
  });
});
