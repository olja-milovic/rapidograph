<p style="text-align: center;">
  <picture>
    <source
      srcset="assets/logo/logo-lockup-light.png"
      media="(prefers-color-scheme: light)"
    />
    <source
      srcset="assets/logo/logo-lockup-dark.png"
      media="(prefers-color-scheme: dark)"
    />
    <img
      src="assets/logo/logo-lockup-light.png"
      alt="Library logo"
      style="max-width: 100%;"
    />
  </picture>
</p>

<p style="text-align: center;">
  <strong>A focused charting system built with Web Components.</strong>
</p>

<p style="text-align: center;">
  Lightweight, theme-aware, responsive charts rendered with HTML and CSS.
</p>

[//]: # (<p style="text-align: center;">)

[//]: # (  <a href="https://github.com/your-org/rapidograph/actions">)

[//]: # (    <img src="https://img.shields.io/github/actions/workflow/status/olja-milovic/rapidograph/ci.yml"  alt="workflow-status"/>)

[//]: # (  </a>)

[//]: # (  <a href="https://www.npmjs.com/package/rapidograph">)

[//]: # (    <img src="https://img.shields.io/npm/v/rapidograph"  alt="npm-package"/>)

[//]: # (  </a>)

[//]: # (  <img src="https://img.shields.io/bundlephobia/minzip/rapidograph"  alt="bundlephobia"/>)

[//]: # (  <img src="https://img.shields.io/npm/l/rapidograph"  alt="license"/>)

[//]: # (</p>)

## Overview

Rapidograph is a **charting design system** built on Web Components.
It provides a small set of **chart primitives** designed to integrate seamlessly into modern UI systems.

Charts are rendered using **HTML and CSS** instead of SVG or Canvas, making them easy to style, theme, and reason about.

> ⚠️ At the moment, Rapidograph includes **only a Bar Chart**.  
> 📝 Additional chart types will be introduced incrementally.

## Principles

- 🥇 **Design-system first**  
  Charts integrate into UI systems rather than behaving as isolated visual artifacts.

- 🧩 **Framework-agnostic**  
  Built with Web Components, works everywhere.

- 🎨 **Theme-aware and CSS-driven**  
  Support for light and dark themes. Colors and typography controlled via CSS.

- 🔑 **Accessible by design**  
  Charts are built with accessibility in mind, using predictable interaction patterns and support for assistive technologies.  
  Accessibility is treated as a core requirement, not an afterthought.

## Installation

```bash
npm install rapidograph
```

## Usage

Rapidograph components are standard Web Components and can be used in any environment.

```html
<rapido-bar
  id="rapido-bar"
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
</script>
```

## Theming

Charts support **light** and **dark** themes out of the box.

```html
<rapido-bar id="rapido-bar" theme="dark"></rapido-bar>
```

Themes can be further customized per-instance using CSS variables such as:

```css
#rapido-bar {
  /*light theme colors*/
  --rpg-bar-color: #85b8ff;
  --rpg-bar-color-hover: #579cff;
  /*...*/

  /*dark theme colors*/
  --rpg-bar-color-dark: #0055cc;
  --rpg-bar-color-hover-dark: #0c65e3;
  /*...*/
}
```

Rapidograph is designed to integrate naturally with application-level theming systems.

[//]: # (## Documentation)

[//]: # ()
[//]: # (Rapidograph uses **Storybook as the primary documentation surface**.)

[//]: # ()
[//]: # (Each chart is documented through interactive stories that demonstrate:)

[//]: # (- configuration options)

[//]: # (- layout variations)

[//]: # (- theming)

[//]: # (- accessibility considerations)

[//]: # ()
[//]: # (### 📘Storybook)

[//]: # (➡️<a href="storybook-link">View Storybook</a>)

## Available Charts

### Bar Chart

> The Bar Chart is currently the **only chart available** in Rapidograph.

It is:
- orientation-agnostic (vertical - default, or horizontal)
- theme-aware (light and dark)

Additional chart types will be added as the library evolves.

## Compatibility

- Modern evergreen browsers
- Works with React, Angular, Vue, Svelte, or plain HTML
- No framework-specific dependencies

## Status

Rapidograph is experimental and under active development.  
Breaking changes may occur prior to a stable release.

## License

MIT
