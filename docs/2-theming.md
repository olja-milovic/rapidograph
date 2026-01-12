## Theming

Rapidograph charts are designed to integrate with application-level theming systems.

Theming is based on CSS and design tokens rather than chart-specific configuration objects.

## Built-in Themes

Charts support two built-in themes:

- light
- dark

> When no explicit theme is set, charts default to the user’s preferred system color scheme.

Bar chart example:

```html

<rapido-bar theme="dark"></rapido-bar>
```

## CSS-driven Customization

Rapidograph relies on CSS variables for styling.

Example:

```css
#rapido-bar {
	--rpg-bar-border-radius: 0.375rem;
	/*light theme colors*/
	--rpg-bar-color: #85b8ff;
	--rpg-bar-bg-color: #f7f8f980;
	--rpg-bar-color-hover: #579cff;
	--rpg-bar-label-color: #232529;
	--rpg-axis-title-color: white;
	--rpg-gridline-color: #b3b9c4;
	/*dark theme colors*/
	--rpg-bar-color-dark: #0055cc;
	--rpg-bar-bg-color-dark: #1d212580;
	--rpg-bar-color-hover-dark: #0c65e3;
	--rpg-bar-label-color-dark: #eff1f3;
	--rpg-axis-title-color-dark: #292a2e;
	--rpg-gridline-color-dark: #596773;
}
```

## Accessibility Considerations

Theming should preserve sufficient contrast between visual elements such as bars, background, and text.

> ⚠️ Rapidograph provides sensible defaults, but final contrast is the responsibility of the consuming application.

[//]: # (## Storybook Reference)

[//]: # ()

[//]: # (All supported themes and styling hooks are demonstrated in Storybook. Storybook is the authoritative reference for visual behavior.)
