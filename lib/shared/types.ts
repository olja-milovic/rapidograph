export type DataItem = {
  category: string;
  value: number;
};

type FormatterFn<T extends string | number> = (value: T) => string | number;
export type ValueFormatters = {
  category?: FormatterFn<DataItem["category"]>;
  value?: FormatterFn<DataItem["value"]>;
  data?: FormatterFn<DataItem["value"]>;
  tooltip?: FormatterFn<DataItem["value"]>;
};
