import { LitElement, type PropertyValues, css, html, unsafeCSS } from "lit";
import { Orientation, Theme, TooltipPosition } from "../types";
import { customElement, property, state } from "lit/decorators.js";
import { positionTooltip } from "../utils";
import styles from "../css/tooltip.css?inline";

@customElement("tool-tip")
export class Tooltip extends LitElement {
  static get styles() {
    return css`
      ${unsafeCSS(styles)}
    `;
  }

  @property({ type: Orientation })
  orientation: Orientation = Orientation.Vertical;

  @property({ type: Theme })
  theme: Theme = Theme.Light;

  @property({ type: String })
  label: string = "";

  @property({ type: Number })
  value: number = 0;

  @property({ type: HTMLElement, attribute: false })
  scrollableElem!: HTMLElement;

  private _vObserver: IntersectionObserver | undefined;
  private _hObserver: IntersectionObserver | undefined;

  @state()
  get position(): TooltipPosition {
    return this.orientation === Orientation.Vertical
      ? TooltipPosition.Right
      : TooltipPosition.Bottom;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("inert", "");
    this.setAttribute("role", "tooltip");
    this.setAttribute("data-content", `${this.label}: ${this.value}`);
    this.setAttribute("position", this.position);
  }

  // TODO: check if needed
  updated(changedProperties: Map<string, never>) {
    if (changedProperties.get("position")) {
      // this.setAttribute("position", this.position);
    }
  }

  render() {
    return html`
      <div class="rpg-tooltip-wrapper">
        <div class="rpg-tooltip-label">${this.label}</div>
        <div class="rpg-tooltip-value">${this.value}</div>
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);

    const options = {
      root: this.scrollableElem,
      threshold: 1,
    };
    const verticalOptions = { ...options, rootMargin: "0px -16px" };
    const horizontalOptions = { ...options, rootMargin: "-16px 0px" };

    this._vObserver = new IntersectionObserver(
      (entries) => positionTooltip(this.orientation, entries),
      verticalOptions,
    );
    this._hObserver = new IntersectionObserver(
      (entries) => positionTooltip(this.orientation, entries),
      horizontalOptions,
    );

    if (this.orientation === Orientation.Vertical) {
      this._vObserver?.observe(this);
    } else {
      this._hObserver?.observe(this);
    }
  }

  disconnectedCallback(): void {
    this._vObserver?.unobserve(this);
    this._hObserver?.unobserve(this);
  }
}
