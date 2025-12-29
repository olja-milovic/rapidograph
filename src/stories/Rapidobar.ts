import "../index";
import "./rapidobar.css";
import type {
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
  categoryLabel: string;
  valueLabel: string;
  formatters: ValueFormatters;
  data: DataItem[];
}

export const Rapidobar = ({
  orientation,
  theme,
  xAxisPosition,
  yAxisPosition,
  tooltipTheme,
  showLabels,
  data,
  categoryLabel,
  valueLabel,
  formatters,
}: RapidobarProps) => {
  return html`
    <div class=${classMap({ container: true, [theme]: true })}>
      <rapido-bar
        orientation=${orientation}
        theme=${theme}
        x-axis-position=${xAxisPosition}
        y-axis-position=${yAxisPosition}
        tooltip-theme=${tooltipTheme}
        show-labels=${showLabels}
        category-label=${categoryLabel}
        value-label=${valueLabel}
        .formatters=${formatters}
        .data=${data}
      ></rapido-bar>
    </div>
  `;
};
