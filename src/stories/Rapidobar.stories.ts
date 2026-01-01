import type { Meta, StoryObj } from "@storybook/web-components-vite";
import {
  Orientation,
  ShowLabels,
  Theme,
  XAxisPosition,
  YAxisPosition,
} from "../../lib";
import { RapidoBar, type RapidobarProps } from "./Rapidobar.ts";
import type { StoryContext } from "storybook/internal/csf";

function getCurrencyFormatter(value: number = 0, limit = 10_000) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    compactDisplay: "short",
    currencyDisplay: "narrowSymbol",
    unitDisplay: "narrow",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...(limit > -1 &&
      Math.abs(value) >= limit && {
        notation: "compact",
      }),
  });
}

const sampleData = [
  { category: "2025-01-01", value: 1250.5 },
  { category: "2025-02-01", value: 980.0 },
  { category: "2025-03-01", value: 3100.75 },
  { category: "2025-04-01", value: -12450.0 },
  { category: "2025-05-01", value: -6350.25 },
  { category: "2025-06-01", value: -10120.0 },
  { category: "2025-07-01", value: 5420.9 },
  { category: "2025-08-01", value: 1100.0 },
  { category: "2025-09-01", value: 0.0 },
  { category: "2025-10-01", value: 12890.4 },
  { category: "2025-11-01", value: -12000.0 },
  { category: "2025-12-01", value: -950.75 },
];

const meta = {
  title: "Example/Rapidobar",
  tags: ["autodocs"],
  render: (args) => RapidoBar(args),
  argTypes: {
    orientation: {
      control: "radio",
      options: Object.values(Orientation),
      description: "The orientation of the bar chart",
      table: {
        defaultValue: { summary: Orientation.Vertical },
      },
    },
    theme: {
      control: "radio",
      options: Object.values(Theme),
      description: "The theme of the bar chart",
      table: {
        defaultValue: { summary: Theme.Light },
      },
    },
    xAxisPosition: {
      name: "x-axis-position",
      control: "radio",
      options: Object.values(XAxisPosition),
      description: "The position of x-axis",
      table: {
        defaultValue: { summary: XAxisPosition.Bottom },
      },
    },
    yAxisPosition: {
      name: "y-axis-position",
      control: "radio",
      options: Object.values(YAxisPosition),
      description: "The position of y-axis",
      table: {
        defaultValue: { summary: YAxisPosition.Left },
      },
    },
    tooltipTheme: {
      name: "tooltip-theme",
      control: "radio",
      options: Object.values(Theme),
      description: "The theme of tooltips",
      table: {
        defaultValue: { summary: Theme.Light },
      },
    },
    showLabels: {
      name: "show-labels",
      control: "radio",
      options: Object.values(ShowLabels),
      description: "The way of showing labels on the bars",
      table: {
        defaultValue: { summary: ShowLabels.Always },
      },
    },
    categoryLabel: {
      name: "category-label",
      control: "text",
      description: "Category axis label",
      table: {
        defaultValue: { summary: "" },
      },
    },
    valueLabel: {
      name: "value-label",
      control: "text",
      description: "Value axis label",
      table: {
        defaultValue: { summary: "" },
      },
    },
    formatters: {
      control: "object",
      description: "Axes, bar and tooltip values formatter",
      table: {
        defaultValue: {
          summary: "{}",
        },
        disable: false,
      },
    },
    data: {
      control: "object",
      description: "The data for the bar chart",
      table: {
        defaultValue: { summary: "[]" },
      },
    },
  },
} satisfies Meta<RapidobarProps>;

export default meta;
type Story = StoryObj<RapidobarProps>;

export const Demo: Story = {
  args: {
    orientation: Orientation.Vertical,
    theme: Theme.Light,
    yAxisPosition: YAxisPosition.Left,
    xAxisPosition: XAxisPosition.Bottom,
    tooltipTheme: Theme.Light,
    showLabels: ShowLabels.Always,
    categoryLabel: "Month",
    valueLabel: "Number (%)",
    formatters: {
      category: (isoDate: string) => {
        const date = new Date(isoDate);
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        return `${month} ${year}`;
      },
      value: (val: number) => {
        const formatter = getCurrencyFormatter(val);
        return formatter.format(val);
      },
      data: (val: number) => {
        const formatter = getCurrencyFormatter(val, 1_000);
        return formatter.format(val);
      },
      tooltip: (val: number) => {
        const formatter = getCurrencyFormatter(val, -1);
        return formatter.format(val);
      },
    },
    data: sampleData,
  },
  parameters: {
    docs: {
      source: {
        transform: (_: string, { args }: StoryContext) => {
          const {
            orientation,
            theme,
            xAxisPosition,
            yAxisPosition,
            tooltipTheme,
            showLabels,
            categoryLabel,
            valueLabel,
          } = args;
          return `
            <rapido-bar
              orientation="${orientation}"
              theme="${theme}"
              x-axis-position="${xAxisPosition}"
              y-axis-position="${yAxisPosition}"
              tooltip-theme="${tooltipTheme}"
              show-labels="${showLabels}"
              category-label="${categoryLabel}"
              value-label="${valueLabel}"
            ></rapido-bar>
          `;
        },
      },
    },
  },
};
