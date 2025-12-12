export type DataItem = {
  category: string;
  value: number;
};

export type AxisConfig = {
  label: string;
  formatter?: (value: number | string) => string | number;
};
