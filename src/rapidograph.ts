import { LitElement, type PropertyValues, css, html, unsafeCSS } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import {
  type DataItem,
  Orientation,
  ShowLabels,
  Theme,
  XAxisPosition,
  YAxisPosition,
} from "./types";
import {
  calculateYAxisWidths,
  checkIfAllPositiveOrNegative,
  checkIfSomePositiveAndNegative,
  generateTicks,
  getMinAndMax,
  getScrollbarWidth,
  getSizeInPercentages,
  getUpdatedYAxisWidth,
  noop,
} from "./utils";

// "?inline" makes Vite import CSS as a string instead of injecting it globally
import {
  DEFAULT_Y_AXIS_WIDTH,
  MAX_Y_AXIS_WIDTH,
  MIN_Y_AXIS_WIDTH,
  SCROLLBAR_WIDTH_CSS_VAR,
  Y_AXIS_WIDTH_CSS_VAR,
} from "./constants.ts";
import styles from "./css/style.css?inline";

@customElement("rapido-graph")
export class Rapidograph extends LitElement {
  static get styles() {
    return css`
      ${unsafeCSS(styles)}
    `;
  }

  private _data: DataItem[] = [];
  private _values: number[] = [];
  private _ticks: number[] = [];
  private _min: number = 0;
  private _max: number = 100;
  private _hasPositive: boolean = true;
  private _hasNegative: boolean = true;
  private _allPositive: boolean = true;
  private _allNegative: boolean = true;
  private _yAxisMinWidth: number = MIN_Y_AXIS_WIDTH;
  private _yAxisMaxWidth: number = MAX_Y_AXIS_WIDTH;
  private _vObserver: IntersectionObserver | undefined;
  private _hObserver: IntersectionObserver | undefined;

  private get _yAxisWidthPercentage() {
    const maxYAxisWidth = this._yAxisMaxWidth - this._yAxisMinWidth;
    const currentYAxisWidth = this._yAxisWidth - this._yAxisMinWidth;
    return ((currentYAxisWidth * 100) / maxYAxisWidth).toFixed(0);
  }

  private get _yAxisWidthDescription() {
    return `Y-axis offset ${this._yAxisWidthPercentage}%`;
  }

  @state()
  private _yAxisWidth: number = DEFAULT_Y_AXIS_WIDTH;
  @state()
  private _scrollbarWidth: number = 0;

  @property({ type: Array, attribute: false })
  get data(): DataItem[] {
    return this._data || [];
  }

  set data(val: DataItem[]) {
    const oldVal = this._data;
    this._data = val;
    this.requestUpdate("data", oldVal);

    for (const item of this.data) {
      for (const label in item) {
        this._values.push(item[label]);
      }
    }

    this._ticks = generateTicks(this._values);
    [this._min, this._max] = getMinAndMax(this._values, 5);
    [this._hasPositive, this._hasNegative] = checkIfSomePositiveAndNegative(
      this._values,
    );
    [this._allPositive, this._allNegative] = checkIfAllPositiveOrNegative(
      this._values,
    );
    [this._yAxisMinWidth, this._yAxisWidth, this._yAxisMaxWidth] =
      calculateYAxisWidths(
        this.textSizeDiv,
        this.wrapper,
        this.yAxis,
        this.orientation === Orientation.Vertical ? this._ticks : this._values,
      );
  }

  @property({ type: Orientation })
  orientation = Orientation.Vertical;

  @property({ type: XAxisPosition })
  xAxisPosition = XAxisPosition.Bottom;

  @property({ type: YAxisPosition })
  yAxisPosition = YAxisPosition.Left;

  @property({ type: Theme })
  theme = Theme.Light;

  @property({ type: Theme })
  tooltipTheme = Theme.Light;

  @property({ type: ShowLabels })
  showLabels = ShowLabels.Always;

  private _wrapperClasses = {
    "rpg-wrapper": true,
    [this.orientation]: true,
    [`x-axis-${this.xAxisPosition}`]: true,
    [`y-axis-${this.yAxisPosition}`]: true,
    [`labels-${this.showLabels}`]: true,
  };
  private _barContainerClasses = {
    "rpg-bar-container": true,
    "start-from-half": this._hasPositive && this._hasNegative,
  };

  @query(".rpg-wrapper")
  wrapper!: HTMLElement;
  @query(".rpg-scrollable")
  scrollableElem!: HTMLElement;
  @query(".rpg-bar-container")
  barContainer!: HTMLElement;
  @query(".rpg-y-axis")
  yAxis!: HTMLElement;
  @query("#rpg-get-text-width")
  textSizeDiv!: HTMLElement;

  render() {
    const xAxisLabelTemplates = [];
    const yAxisLabelTemplates = [];
    const xAxisValues =
      this.orientation === Orientation.Vertical ? this._values : this._ticks;
    const yAxisValues =
      this.orientation === Orientation.Vertical ? this._ticks : this._values;

    for (const item of xAxisValues) {
      xAxisLabelTemplates.push(html`
        <div class="rpg-axis-label" title=${item}>${item}</div>
      `);
    }
    for (const item of yAxisValues) {
      yAxisLabelTemplates.push(html`
        <div class="rpg-axis-label" title=${item}>${item}</div>
      `);
    }

    const gridlineTemplates = [];
    for (let i = 0; i < this._ticks.length - 1; i++) {
      gridlineTemplates.push(html`<div class="rpg-gridline"></div>`);
    }

    const barTemplates = [];
    for (const item of this.data) {
      for (const label in item) {
        const value = item[label];
        const isPositive =
          this._allPositive || !this._allNegative ? value >= 0 : value > 0;
        const barSize = getSizeInPercentages(value, this._min, this._max);
        const size =
          this.orientation === Orientation.Vertical ? "height" : "width";

        barTemplates.push(
          html`<div
            class="rpg-bar ${isPositive ? "positive" : "negative"}"
            aria-label="${label}: ${value}"
            role="listitem"
            tabindex="0"
          >
            <div
              class="rpg-bar-content"
              style="${size}: ${Math.abs(barSize)}%;"
            >
              <div class="rpg-bar-label">${value}</div>
              <div class="rpg-small-bar-label">${value}</div>
            </div>
          </div>`,
        );
      }
    }
    // TODO: --rpg-x-axis-height
    return html`
      <div class="rpg" theme=${this.theme}>
        <div
          class=${classMap(this._wrapperClasses)}
          style="
            ${SCROLLBAR_WIDTH_CSS_VAR}: ${this._scrollbarWidth}px;
            ${Y_AXIS_WIDTH_CSS_VAR}: ${this._yAxisWidth}px;
            --rpg-x-axis-height: 31.666667938232422px;
          "
        >
          <div
            class="rpg-scrollable"
            style="--rpg-labels-length: 14; --rpg-ticks-length: 5;"
          >
            <div class="rpg-scrollable-content">
              <div class="rpg-x-axis">
                <div class="rpg-x-axis-labels">${xAxisLabelTemplates}</div>
              </div>
              <div class="rpg-content-container">
                <div class="rpg-gridlines">${gridlineTemplates}</div>
                <div class=${classMap(this._barContainerClasses)} role="list">
                  ${barTemplates}
                </div>
              </div>
            </div>
          </div>
          <div class="rpg-y-axis">
            <div class="rpg-y-axis-labels">${yAxisLabelTemplates}</div>
            <div
              class="rpg-y-axis-line-container"
              tabindex="1"
              role="slider"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow=${this._yAxisWidthPercentage}
              aria-valuetext=${this._yAxisWidthDescription}
              @dragstart=${noop}
              @pointerdown=${this.onPointerDown}
              @keydown=${this.onKeyDown}
            >
              <div class="rpg-y-axis-line"></div>
            </div>
          </div>
        </div>
      </div>
      <div aria-live="polite">${this._yAxisWidthDescription}</div>
      <div id="rpg-get-text-width" class="rpg-axis-label"></div>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.addObservers();
  }

  private addObservers() {
    const options = {
      root: this.scrollableElem,
      threshold: 1,
    };
    const verticalOptions = {
      rootMargin: "0px -16px",
    };
    const horizontalOptions = {
      rootMargin: "-16px 0px",
    };

    const callback = () => {
      this._scrollbarWidth = getScrollbarWidth(
        this.orientation,
        this.scrollableElem,
      );
    };
    this._vObserver = new IntersectionObserver(callback, {
      ...options,
      ...verticalOptions,
    });
    this._hObserver = new IntersectionObserver(callback, {
      ...options,
      ...horizontalOptions,
    });

    this._vObserver.observe(this.barContainer);
    this._hObserver.observe(this.barContainer);

    // this.vTooltipObserver = new IntersectionObserver(
    //   (entries) => positionTooltip(this.orientation, entries),
    //   {
    //     ...options,
    //     ...verticalOptions,
    //   },
    // );
    // this.hTooltipObserver = new IntersectionObserver(
    //   (entries) => positionTooltip(this.orientation, entries),
    //   {
    //     ...options,
    //     ...horizontalOptions,
    //   },
    // );
  }

  private onPointerDown(pointerDownEvent: PointerEvent) {
    pointerDownEvent.preventDefault();
    let newWidth = this._yAxisWidth;
    const self = this;

    const handlePointerMove = (pointerMoveEvent: PointerEvent) => {
      const parent = self.wrapper;

      const moveClientX = pointerMoveEvent.clientX;
      const downClientX = pointerDownEvent.clientX;

      newWidth =
        self._yAxisWidth +
        (self.yAxisPosition === YAxisPosition.Left
          ? moveClientX - downClientX
          : downClientX - moveClientX);
      let allowedMaxWidth = self._yAxisMaxWidth;

      // the pointer is out of slider => lock the thumb within the boundaries
      if (newWidth < self._yAxisMinWidth) {
        newWidth = self._yAxisMinWidth;
      }

      if (self._yAxisMaxWidth > parent.offsetWidth - MAX_Y_AXIS_WIDTH) {
        allowedMaxWidth = parent.offsetWidth - MAX_Y_AXIS_WIDTH;
      }
      if (newWidth > allowedMaxWidth) {
        newWidth = allowedMaxWidth;
      }
      this.wrapper.style.setProperty(Y_AXIS_WIDTH_CSS_VAR, `${newWidth}px`);
    };

    function handlePointerUp(): void {
      self._yAxisWidth = newWidth;
      document.body.style.removeProperty("cursor");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const percentage = parseInt(this._yAxisWidthPercentage ?? "0", 10);
    const key = event.key;
    const minimizeKey =
      this.yAxisPosition === YAxisPosition.Left ? "ArrowLeft" : "ArrowRight";
    const maximizeKey =
      this.yAxisPosition === YAxisPosition.Left ? "ArrowRight" : "ArrowLeft";

    if (key === minimizeKey) {
      this._yAxisWidth =
        getUpdatedYAxisWidth(
          percentage,
          this._yAxisMinWidth,
          this._yAxisMaxWidth,
          Math.max(percentage - 5, 0),
        ) ?? this._yAxisWidth;
    } else if (key === maximizeKey) {
      this._yAxisWidth =
        getUpdatedYAxisWidth(
          percentage,
          this._yAxisMinWidth,
          this._yAxisMaxWidth,
          Math.min(percentage + 5, 100),
        ) ?? this._yAxisWidth;
    }
    event.preventDefault();
  }

  disconnectedCallback(): void {
    this._vObserver?.unobserve(this.barContainer);
    this._hObserver?.unobserve(this.barContainer);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    rapidograph: Rapidograph;
  }
}
