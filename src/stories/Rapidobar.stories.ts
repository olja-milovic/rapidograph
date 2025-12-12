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
    },
    theme: {
      control: "radio",
      options: Object.values(Theme),
      description: "The theme of the bar chart",
    },
    xAxisPosition: {
      control: "radio",
      options: Object.values(XAxisPosition),
      description: "The position of x-axis",
    },
    yAxisPosition: {
      control: "radio",
      options: Object.values(YAxisPosition),
      description: "The position of y-axis",
    },
    tooltipTheme: {
      control: "radio",
      options: Object.values(Theme),
      description: "The theme of bar tooltips",
    },
    showLabels: {
      control: "radio",
      options: Object.values(ShowLabels),
      description: "The way of showing labels on the bars",
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    "categoryAxis.label": {
      description: "Category axis label",
      control: "text",
      table: {
        category: "AxisConfig",
        type: { summary: "string" },
      },
    },
    "categoryAxis.formatter": {
      description: "Category axis formatter",
      control: false,
      table: {
        category: "AxisConfig",
        type: { summary: "(value) => string" },
      },
    },
    data: {
      control: "object",
      description: "The data for the bar chart",
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
    },
    valueAxis: {
      label: "Number (%)",
      formatter: (val) => `${val}%`,
    },
    data: [
      { category: "Jan 2023", value: 1 },
      { category: "Feb 2023", value: 0 },
      { category: "Mar 2023", value: 3 },
      { category: "Apr 2023", value: -12 },
      { category: "May 2023", value: -6 },
      { category: "Jun 2023", value: -10 },
      { category: "Jul 2023", value: 5 },
      { category: "Jan 2023", value: 1 },
      { category: "Feb 2023", value: 0 },
      { category: "Mar 2023", value: 12 },
      { category: "Apr 2023", value: -12 },
      { category: "May 2023", value: -1 },
      { category: "Jun 2023", value: -10 },
      { category: "Jul 2023", value: 5 },
    ],
  },
} satisfies Meta<RapidobarProps>;

export default meta;
type Story = StoryObj<RapidobarProps>;

export const Default: Story = {};
