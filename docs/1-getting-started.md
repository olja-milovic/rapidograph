## Getting Started

This guide explains how to install Rapidograph and render your first chart.

Rapidograph is a charting design system built with Web Components, which means it can be used in any modern frontend
environment.

## Installation

```bash
npm install rapidograph
# or
yarn add rapidograph
# or
pnpm add rapidograph
```

## Basic Usage

Rapidograph components are standard custom elements and can be used directly in HTML.

```html

<rapido-bar
  id="rapido-bar"
  orientation="vertical"
  theme="light"
  x-axis-position="bottom"
  y-axis-position="left"
  tooltip-theme="light"
  show-labels="always"
  category-label="Dates"
  value-label="Values (%)"
></rapido-bar>

<script>
  const rapidobar = document.getElementById("rapido-bar");

  rapidobar.data = [
    {category: "Jan", value: 10},
    {category: "Feb", value: -5},
    {category: "Mar", value: 15}
  ];

  rapidobar.formatters = {
    category: (value) => `${value}%`,
    value: /*...*/,
    data: /*...*/,
    tooltip: /*...*/,
  };
</script>
```

## Data Model

Charts consume structured data rather than positional coordinates.

```typescript
type DataItem = {
	category: string;
	value: number;
};
```

- `category` represents the categorical dimension
- `value` represents the quantitative dimension

> The meaning of **category** and **value** is consistent across charts.
> The **orientation** of the chart determines how these are mapped visually.

Formatters for different parts of the data representations can be passed to the charts:

| Formatter key | Description             |
|---------------|-------------------------|
| `category`    | Axis labels             |
| `value`       | Axis values             |
| `data`        | Bar labels              |
| `tooltip`     | Rich contextual display |

## Framework Usage

Rapidograph works with all major frameworks because it is built with Web Components.

[//]: # (Framework-specific examples are documented in Storybook.)

## Next Steps

- Explore theming options
- Read about Rapidograph’s architecture

[//]: # (- Review chart behavior in Storybook)
