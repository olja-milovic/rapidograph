export type DataItem = {
  category: string | number;
  value: number;
};

type FormatterFn<T extends string | number> = (value: T) => string | number;
export type ValueFormatters = {
  category?: FormatterFn;
  value?: FormatterFn;
  data?: FormatterFn;
  tooltip?: FormatterFn;
};
