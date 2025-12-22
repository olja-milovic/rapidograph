import type { Meta, StoryObj } from "@storybook/web-components-vite";

import {
  Orientation,
  ShowLabels,
  Theme,
  XAxisPosition,
  YAxisPosition,
} from "../types";
import { Rapidobar, type RapidobarProps } from "./Rapidobar.ts";

const meta = {
  title: "Example/Rapidobar",
  tags: ["autodocs"],
  render: (args) => Rapidobar(args),
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
    categoryAxis: {
      control: "object",
      description: "Category axis title and *optional* label formatter",
      table: {
        defaultValue: { summary: "{}" },
      },
    },
    valueAxis: {
      control: "object",
      description: "Value axis title and *optional* label formatter",
      table: {
        defaultValue: { summary: "{}" },
      },
    },
    formatters: {
      control: "object",
      description: "Bar values formatter",
      table: {
        defaultValue: { summary: "{}" },
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
  args: {
    orientation: Orientation.Vertical,
    theme: Theme.Light,
    yAxisPosition: YAxisPosition.Left,
    xAxisPosition: XAxisPosition.Bottom,
    tooltipTheme: Theme.Light,
    showLabels: ShowLabels.Always,
    categoryAxis: {
      label: "Month",
      formatter: (isoDate) => {
        const date = new Date(isoDate);
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        return `${month} ${year}`;
      },
    },
    valueAxis: {
      label: "Number (%)",
      formatter: (val) => `${val}%`,
    },
    formatters: {
      value: (val) => `${val}%`,
    },
    data: [
      { category: "2025-01-01", value: 1 },
      { category: "2025-02-01", value: 0 },
      { category: "2025-03-01", value: 3 },
      { category: "2025-04-01", value: -12 },
      { category: "2025-05-01", value: -6 },
      { category: "2025-06-01", value: -10 },
      { category: "2025-07-01", value: 5 },
      { category: "2025-08-01", value: 1 },
      { category: "2025-09-01", value: 0 },
      { category: "2025-10-01", value: 12 },
      { category: "2025-11-01", value: -12 },
      { category: "2025-12-01", value: -1 },
    ],
  },
} satisfies Meta<RapidobarProps>;

export default meta;
type Story = StoryObj<RapidobarProps>;

export const Default: Story = {};
