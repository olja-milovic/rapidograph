import {
  LitElement,
  type PropertyValues,
  css,
  html,
  nothing,
  unsafeCSS,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

import {
  type DataItem,
  Orientation,
  ShowLabels,
  Theme,
  XAxisPosition,
  YAxisPosition,
} from "../types";
import {
  calculateYAxisWidths,
  checkIfAllPositiveOrNegative,
  checkIfSomePositiveAndNegative,
  generateTicks,
  getMinAndMaxInPercentages,
  getScrollbarSize,
  getSizeInPercentages,
  getUpdatedYAxisWidth,
  noop,
} from "../utils";

// "?inline" makes Vite import CSS as a string instead of injecting it globally
import {
  DATA_LENGTH_CSS_VAR,
  DEFAULT_Y_AXIS_WIDTH,
  MAX_Y_AXIS_WIDTH,
  MIN_Y_AXIS_WIDTH,
  SCROLLBAR_WIDTH_CSS_VAR,
  X_AXIS_HEIGHT_CSS_VAR,
  Y_AXIS_WIDTH_CSS_VAR,
} from "../constants.ts";
import styles from "../css/rapidobar.css?inline";

import "./tooltip.ts";

@customElement("rapido-bar")
export class Rapidobar extends LitElement {
  static get styles() {
    return css`
      ${unsafeCSS(styles)}
    `;
  }

  private _data: DataItem[] = [];
  private _labels: string[] = [];
  private _values: number[] = [];
  private _ticks: number[] = [];
  private _minBarSize: number = 0;
  private _maxBarSize: number = 100;
  private _hasPositive: boolean = true;
  private _hasNegative: boolean = false;
  private _allPositive: boolean = true;
  private _allNegative: boolean = false;
  private _yAxisMinWidth: number = MIN_Y_AXIS_WIDTH;
  private _yAxisMaxWidth: number = MAX_Y_AXIS_WIDTH;
  private _isDraggingYAxis: boolean = false;
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
  private _xAxisHeight: number = 0;
  @state()
  private _scrollbarSize: number = 0;
  @state()
  private _activeBarIndex: number = -1;
  @state()
  private _yAxisWidth: number = DEFAULT_Y_AXIS_WIDTH;

  @property({ type: Array, attribute: false })
  get data(): DataItem[] {
    return this._data || [];
  }

  set data(value: DataItem[]) {
    const oldValue = this._data;
    this._data = value;
    this.requestUpdate("data", oldValue);

    const values = [];
    const labels = [];
    for (const item of this.data) {
      for (const label in item) {
        values.push(item[label]);
        labels.push(label);
      }
    }

    [this._values, this._labels] = [values, labels];
    [this._minBarSize, this._maxBarSize] = getMinAndMaxInPercentages(
      this._values,
    );
    this._ticks = generateTicks(this._minBarSize, this._maxBarSize);
    [this._hasPositive, this._hasNegative] = checkIfSomePositiveAndNegative(
      this._values,
    );
    [this._allPositive, this._allNegative] = checkIfAllPositiveOrNegative(
      this._values,
    );
  }

  @property({ type: Orientation })
  orientation: Orientation = Orientation.Vertical;

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

  private get _wrapperClasses() {
    return {
      rpg: true,
      [this.orientation]: true,
      [`x-axis-${this.xAxisPosition}`]: true,
      [`y-axis-${this.yAxisPosition}`]: true,
      [`labels-${this.showLabels}`]: true,
    };
  }
  private get _wrapperStyles() {
    return {
      [SCROLLBAR_WIDTH_CSS_VAR]: `${this._scrollbarSize}px`,
      [Y_AXIS_WIDTH_CSS_VAR]: `${this._yAxisWidth}px`,
      [X_AXIS_HEIGHT_CSS_VAR]: `${this._xAxisHeight}px`,
      [DATA_LENGTH_CSS_VAR]: this._values.length,
    };
  }
  private get _barContainerClasses() {
    return {
      "rpg-bar-container": true,
      "start-from-half": this._hasPositive && this._hasNegative,
    };
  }

  @query(".rpg")
  private _wrapper!: HTMLElement;
  @query(".rpg-scrollable")
  private _scrollableElem!: HTMLElement;
  @query(".rpg-bar-container")
  private _barContainer!: HTMLElement;
  @query(".rpg-x-axis")
  private _xAxis!: HTMLElement;
  @query(".rpg-y-axis")
  private _yAxis!: HTMLElement;
  @query("#rpg-get-text-width")
  private _textSizeDiv!: HTMLElement;

  render() {
    const isVertical = this.orientation === Orientation.Vertical;
    const xAxisLabelTemplates = [];
    const yAxisLabelTemplates = [];
    const xAxisValues = isVertical ? this._labels : this._ticks;
    const yAxisValues = isVertical ? this._ticks : this._labels;

    for (const item of xAxisValues) {
      xAxisLabelTemplates.push(html`
        <div class="rpg-axis-label" title=${item}>${item}</div>
      `);
    }
    const xAxisTemplate = html`
      <div class="rpg-x-axis">
        <div class="rpg-x-axis-labels">${xAxisLabelTemplates}</div>
      </div>
    `;
    for (const item of yAxisValues) {
      yAxisLabelTemplates.push(html`
        <div class="rpg-axis-label" title=${item}>${item}</div>
      `);
    }
    const yAxisTemplate = html`
      <div class="rpg-y-axis">
        <div class="rpg-y-axis-labels">${yAxisLabelTemplates}</div>
        <div
          class="rpg-y-axis-line-container"
          tabindex=${this.yAxisPosition === YAxisPosition.Left ? "1" : "0"}
          role="slider"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${this._yAxisWidthPercentage}
          aria-valuetext=${this._yAxisWidthDescription}
          @dragstart=${noop}
          @pointerdown=${this.onYAxisPointerDown}
          @keydown=${this.onYAxisKeyDown}
        >
          <div class="rpg-y-axis-line"></div>
        </div>
      </div>
    `;

    const gridlineTemplates = [];
    for (let i = 0; i < this._ticks.length - 1; i++) {
      gridlineTemplates.push(html`<div class="rpg-gridline"></div>`);
    }

    const barTemplates = [];
    for (const [index, item] of this.data.entries()) {
      for (const label in item) {
        const value = item[label];
        const isPositive =
          this._allPositive || !this._allNegative ? value >= 0 : value > 0;
        const barSize = getSizeInPercentages(
          value,
          this._minBarSize,
          this._maxBarSize,
        );
        const size = isVertical ? "height" : "width";
        const onEnter = () => {
          if (this._isDraggingYAxis) {
            return;
          }
          this._activeBarIndex = index;
        };
        const onLeave = () => (this._activeBarIndex = -1);

        barTemplates.push(
          html`<div
            class="rpg-bar ${isPositive ? "positive" : "negative"}"
            aria-label="${label}: ${value}"
            role="listitem"
            tabindex="0"
            @mouseenter=${onEnter}
            @mouseleave=${onLeave}
            @focusin=${onEnter}
            @focusout=${onLeave}
          >
            <div
              class="rpg-bar-content"
              style="${size}: ${Math.abs(barSize)}%;"
            >
              <div class="rpg-bar-label">${value}</div>
              <div class="rpg-small-bar-label">${value}</div>
            </div>
            ${this._activeBarIndex === index
              ? html`<tool-tip
                  orientation=${this.orientation}
                  theme=${this.tooltipTheme}
                  label=${label}
                  value=${value}
                  .scrollableElem=${this._scrollableElem}
                ></tool-tip>`
              : nothing}
          </div>`,
        );
      }
    }

    return html`
      <div
        class=${classMap(this._wrapperClasses)}
        style=${styleMap(this._wrapperStyles)}
      >
        <div class="rpg-scrollable">
          <div class="rpg-scrollable-content">
            ${isVertical ? xAxisTemplate : yAxisTemplate}
            <div class="rpg-content-container">
              <div class="rpg-gridlines">${gridlineTemplates}</div>
              <div class=${classMap(this._barContainerClasses)} role="list">
                ${barTemplates}
              </div>
            </div>
          </div>
        </div>
        ${isVertical ? yAxisTemplate : xAxisTemplate}
      </div>
      <div aria-live="polite">${this._yAxisWidthDescription}</div>
      <div id="rpg-get-text-width" class="rpg-axis-label"></div>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    [this._yAxisMinWidth, this._yAxisWidth, this._yAxisMaxWidth] =
      this._calculateYAxisWidths();
    this.addObservers();
  }

  updated(changedProperties: Map<string, never>) {
    if (this._xAxis) {
      this._xAxisHeight = this._xAxis.getBoundingClientRect().height ?? 1 - 1;
    }

    if (changedProperties.get("orientation") || changedProperties.get("data")) {
      [this._yAxisMinWidth, this._yAxisWidth, this._yAxisMaxWidth] =
        this._calculateYAxisWidths();
    }
  }

  private _calculateYAxisWidths(): number[] {
    return calculateYAxisWidths(
      this._textSizeDiv,
      this._wrapper,
      this._yAxis,
      this.orientation === Orientation.Vertical ? this._ticks : this._labels,
    );
  }

  private addObservers() {
    const options = {
      root: this._scrollableElem,
      threshold: 1,
    };

    const callback = () => {
      this._scrollbarSize = getScrollbarSize(
        this.orientation,
        this._scrollableElem,
      );
    };
    this._vObserver = new IntersectionObserver(callback, {
      ...options,
      rootMargin: "0px -16px",
    });
    this._hObserver = new IntersectionObserver(callback, {
      ...options,
      rootMargin: "-16px 0px",
    });
    this._vObserver.observe(this._barContainer);
    this._hObserver.observe(this._barContainer);
  }

  private onYAxisPointerDown(pointerDownEvent: PointerEvent) {
    pointerDownEvent.preventDefault();
    this._isDraggingYAxis = true;

    let newWidth = this._yAxisWidth;
    const self = this;

    const handlePointerMove = (pointerMoveEvent: PointerEvent) => {
      const parent = self._wrapper;

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
      this._wrapper.style.setProperty(Y_AXIS_WIDTH_CSS_VAR, `${newWidth}px`);
    };

    function handlePointerUp(): void {
      self._yAxisWidth = newWidth;
      self._isDraggingYAxis = false;
      document.body.style.removeProperty("cursor");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  private onYAxisKeyDown(event: KeyboardEvent): void {
    const percentage = parseInt(this._yAxisWidthPercentage ?? "0", 10);
    const key = event.key;
    const isLeftAxis = this.yAxisPosition === YAxisPosition.Left;
    const commonArgs = {
      currentPercentage: percentage,
      minWidth: this._yAxisMinWidth,
      maxWidth: this._yAxisMaxWidth,
    };

    if (key === (isLeftAxis ? "ArrowLeft" : "ArrowRight")) {
      event.preventDefault();
      this._yAxisWidth =
        getUpdatedYAxisWidth({
          ...commonArgs,
          widthPercentage: Math.max(percentage - 5, 0),
        }) ?? this._yAxisWidth;
    } else if (key === (isLeftAxis ? "ArrowRight" : "ArrowLeft")) {
      event.preventDefault();
      this._yAxisWidth =
        getUpdatedYAxisWidth({
          ...commonArgs,
          widthPercentage: Math.min(percentage + 5, 100),
        }) ?? this._yAxisWidth;
    }
  }

  disconnectedCallback(): void {
    this._vObserver?.unobserve(this._barContainer);
    this._hObserver?.unobserve(this._barContainer);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    rapidograph: Rapidobar;
  }
}
