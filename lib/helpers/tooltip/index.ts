import { LitElement, css, html, unsafeCSS } from "lit";
import { Orientation, Theme } from "@types";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./tooltip.css?inline";

@customElement("tool-tip")
export class Index extends LitElement {
  static get styles() {
    return css`
      ${unsafeCSS(styles)}
    `;
  }

  private _element: HTMLElement | null = null;

  @state()
  private _category: string = "Unknown";
  @state()
  private _value: string = "NaN";
  @state()
  private _x: number = 0;
  @state()
  private _y: number = 0;

  @property({ type: HTMLElement, attribute: false })
  get element(): HTMLElement | null {
    return this._element;
  }
  set element(elem: HTMLElement) {
    const hasElement = elem instanceof HTMLElement;

    const element = hasElement ? elem : null;
    this._element = element;

    const { category, value } = element?.dataset || {};
    this._category = category ?? "Unknown";
    this._value = value ?? "NaN";

    this.setAttribute("show", hasElement.toString());
    this.setAttribute(
      "data-content",
      hasElement ? `${this._category}: ${this._value}` : "",
    );
    this.moveTooltip();
  }

  @property({ type: Orientation })
  orientation: Orientation = Orientation.Vertical;

  @property({ type: Theme })
  theme: Theme = Theme.Light;

  @property({ type: HTMLElement, attribute: false })
  container!: HTMLElement;

  connectedCallback() {
    super.connectedCallback();
    this.id = "rpg-tooltip";
    this.role = "tooltip";
    this.inert = true;
  }

  render() {
    return html`
      <div class="rpg-tooltip-wrapper">
        <div class="rpg-tooltip-category">${this._category}</div>
        <div class="rpg-tooltip-value">${this._value}</div>
      </div>
    `;
  }

  private async moveTooltip() {
    if (!this.element) {
      return;
    }
    // wait for category and value DOM updates
    await this.updateComplete;

    const containerRect = this.container.getBoundingClientRect();
    const elementRect = this.element.getBoundingClientRect();
    const tooltipRect = this.getBoundingClientRect();

    if (this.orientation === Orientation.Vertical) {
      this._x =
        containerRect.right > elementRect.right + tooltipRect.width + 4
          ? elementRect.right + 4
          : elementRect.left - 4 - tooltipRect.width;
      this._y =
        elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
    } else {
      this._x =
        elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
      this._y =
        containerRect.bottom > elementRect.bottom + tooltipRect.height + 4
          ? elementRect.bottom + 8
          : elementRect.top - 8 - tooltipRect.height;
    }
    this.style.setProperty(`--x`, `${this._x}px`);
    this.style.setProperty(`--y`, `${this._y}px`);
  }
}
