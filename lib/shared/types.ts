export type DataItem = {
  category: string | number;
  value: number;
};

type FormatterFn = (value: string | number) => string | number;
export type ValueFormatters = {
  category?: FormatterFn;
  value?: FormatterFn;
  data?: FormatterFn;
  tooltip?: FormatterFn;
};
