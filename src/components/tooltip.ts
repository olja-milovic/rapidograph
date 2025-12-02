import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Theme } from "../types";
import styles from "../css/tooltip.css?inline";

@customElement("tool-tip")
export class Tooltip extends LitElement {
  static get styles() {
    return css`
      ${unsafeCSS(styles)}
    `;
  }

  @property({ type: Theme })
  theme: Theme = Theme.Light;

  @property({ type: String })
  label: string = "";

  @property({ type: Number })
  value: number = 0;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("inert", "");
    this.setAttribute("role", "tooltip");
    this.setAttribute("data-content", `${this.label}: ${this.value}`);
    this.setAttribute("position", "bottom");
  }

  render() {
    return html`
      <div class="rpg-tooltip-wrapper">
        <div class="rpg-tooltip-label">${this.label}</div>
        <div class="rpg-tooltip-value">${this.value}</div>
      </div>
    `;
  }
}
