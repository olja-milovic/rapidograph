export type DataItem = {
  category: string;
  value: number;
};

export type AxisConfig = {
  label: string;
  formatter?: (value: number | string) => string | number;
};

export type ValueFormatters = Partial<
  Record<
    Exclude<keyof DataItem, "category">,
    (value: number) => string | number
  >
>;
