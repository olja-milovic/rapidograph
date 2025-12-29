export const Orientation = {
  Horizontal: "horizontal",
  Vertical: "vertical",
} as const;
export type Orientation = (typeof Orientation)[keyof typeof Orientation];

export const XAxisPosition = {
  Top: "top",
  Bottom: "bottom",
} as const;
export type XAxisPosition = (typeof XAxisPosition)[keyof typeof XAxisPosition];

export const YAxisPosition = {
  Left: "left",
  Right: "right",
} as const;
export type YAxisPosition = (typeof YAxisPosition)[keyof typeof YAxisPosition];

export const Theme = {
  Light: "light",
  Dark: "dark",
} as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

export const ShowLabels = {
  Always: "always",
  Never: "never",
  Hover: "hover",
} as const;
export type ShowLabels = (typeof ShowLabels)[keyof typeof ShowLabels];

export const TooltipPosition = {
  Left: "left",
  Right: "right",
  Top: "top",
  Bottom: "bottom",
} as const;
export type TooltipPosition =
  (typeof TooltipPosition)[keyof typeof TooltipPosition];
