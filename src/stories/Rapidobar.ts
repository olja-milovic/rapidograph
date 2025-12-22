import "../index";
import "./rapidobar.css";
import type {
  AxisConfig,
  DataItem,
  Orientation,
  ShowLabels,
  Theme,
  ValueFormatters,
  XAxisPosition,
  YAxisPosition,
} from "../types";

import { classMap } from "lit/directives/class-map.js";
import { html } from "lit";

export interface RapidobarProps {
  orientation: Orientation;
  theme: Theme;
  xAxisPosition: XAxisPosition;
  yAxisPosition: YAxisPosition;
  tooltipTheme: Theme;
  showLabels: ShowLabels;
  data: DataItem[];
  categoryAxis: AxisConfig;
  valueAxis: AxisConfig;
  formatters: ValueFormatters;
}

export const Rapidobar = ({
  orientation,
  theme,
  xAxisPosition,
  yAxisPosition,
  tooltipTheme,
  showLabels,
  data,
  categoryAxis,
  valueAxis,
  formatters,
}: RapidobarProps) => {
  return html`
    <div class=${classMap({ container: true, [theme]: true })}>
      <rapido-bar
        orientation=${orientation}
        theme=${theme}
        xAxisPosition=${xAxisPosition}
        yAxisPosition=${yAxisPosition}
        tooltipTheme=${tooltipTheme}
        showLabels=${showLabels}
        .data=${data}
        .categoryAxis=${categoryAxis}
        .valueAxis=${valueAxis}
        .formatters=${formatters}
      ></rapido-bar>
    </div>
  `;
};
