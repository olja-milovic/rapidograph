## Architecture

This document explains the architectural principles behind Rapidograph.

## Charts as UI Components

Rapidograph treats charts as UI components rather than opaque visualizations.

Charts have structure, participate in layout and can be styled and composed like other interface elements.

## HTML and CSS instead of SVG or Canvas

Rapidograph uses HTML and CSS to render charts.

This enables:

- easier theming
- better integration with design systems
- predictable and responsive layout behavior
- native accessibility primitives
- simpler debugging

## Data-driven, Orientation-agnostic Design

Charts consume **structured data** rather than positional coordinates.

**Orientation** is a presentation concern, not a data concern. This allows the same data to be rendered in different
layouts without changing the data model.

## Accessibility by Design

Accessibility is treated as a core requirement. Charts aim to expose meaningful structure to assistive technologies and
avoid relying on purely visual cues.

[//]: # "## Storybook as Living Documentation"
[//]: #
[//]: # "Storybook serves as the canonical reference for component behavior, configuration, and edge cases. Markdown documentation focuses on principles and guidance."
