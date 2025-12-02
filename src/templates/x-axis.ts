import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "../css/style.css?inline";

// TODO: styles need to be separated
@customElement("x-axis")
export class XAxis extends LitElement {
  static get styles() {
    return css`
      ${unsafeCSS(styles)}
    `;
  }

  @property({ type: Array })
  values: (string | number)[] = [];

  render() {
    return html`
      <div class="rpg-x-axis">
        <div class="rpg-x-axis-labels">
          ${this.values.map(
            (value) =>
              html`<div class="rpg-axis-label" title=${value}>${value}</div>`,
          )}
        </div>
      </div>
    `;
  }
}
