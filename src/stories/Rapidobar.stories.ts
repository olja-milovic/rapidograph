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
    data: [
      { "Jan 2025": 1 },
      { "Feb 2025": 0 },
      { "Mar 2025": 3 },
      { "Apr 2025": -12 },
      { "May 2025": -6 },
      { "Jun 2025": -10 },
      { "Jul 2025": 5 },
      { "Jan 2025": 1 },
      { "Feb 2025": 0 },
      { "Mar 2025": 12 },
      { "Apr 2025": -12 },
      { "May 2025": -1 },
      { "Jun 2025": -10 },
      { "Jul 2025": 5 },
    ],
  },
} satisfies Meta<RapidobarProps>;

export default meta;
type Story = StoryObj<RapidobarProps>;

export const Default: Story = {};
