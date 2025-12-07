import "../index";
import "./rapidobar.css";
import type {
  DataItem,
  Orientation,
  ShowLabels,
  Theme,
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
}

export const Rapidobar = ({
  orientation,
  theme,
  xAxisPosition,
  yAxisPosition,
  tooltipTheme,
  showLabels,
  data,
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
      ></rapido-bar>
    </div>
  `;
};
