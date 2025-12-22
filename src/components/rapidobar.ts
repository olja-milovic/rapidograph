import "./tooltip.ts";
import {
  type AxisConfig,
  type DataItem,
  Orientation,
  ShowLabels,
  Theme,
  type ValueFormatters,
  XAxisPosition,
  YAxisPosition,
} from "../types";
import {
  DATA_LENGTH_CSS_VAR,
  DEFAULT_Y_AXIS_WIDTH,
  MAX_Y_AXIS_WIDTH,
  MIN_Y_AXIS_WIDTH,
  SCROLLBAR_WIDTH_CSS_VAR,
  X_AXIS_HEIGHT_CSS_VAR,
  Y_AXIS_WIDTH_CSS_VAR,
} from "../constants.ts";
import {
  LitElement,
  type PropertyValues,
  css,
  html,
  nothing,
  unsafeCSS,
} from "lit";
import {
  calculateYAxisWidths,
  checkIfAllPositiveOrNegative,
  checkIfSomePositiveAndNegative,
  formatLabel,
  generateTicks,
  getMinAndMaxInPercentages,
  getScrollbarSize,
  getSizeInPercentages,
  getUpdatedYAxisWidth,
  noop,
} from "../utils";
import {
  customElement,
  eventOptions,
  property,
  query,
  queryAll,
  state,
} from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
// "?inline" makes Vite import CSS as a string instead of injecting it globally
import styles from "../css/rapidobar.css?inline";

@customElement("rapido-bar")
export class Rapidobar extends LitElement {
  static get styles() {
    return css`
      ${unsafeCSS(styles)}
    `;
  }

  private _data: DataItem[] = [];
  private _categories: string[] = [];
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
  private _vObserver: IntersectionObserver | undefined;
  private _hObserver: IntersectionObserver | undefined;
  private _oldCursor?: string;

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
  private _activeBar: HTMLElement | null = null;
  @state()
  private _yAxisWidth: number = DEFAULT_Y_AXIS_WIDTH;
  @state()
  private _isDraggingYAxis: boolean = false;
  @state()
  private _focusedBarIndex: number = 0;

  @property({ type: Array, attribute: false })
  get data(): DataItem[] {
    return this._data || [];
  }

  set data(value: DataItem[]) {
    const oldValue = this._data;
    this._data = value;
    this.requestUpdate("data", oldValue);

    const length = this._data.length;
    const categories = new Array<string>(length);
    const values = new Array<number>(length);
    this.data.forEach(({ category, value }, index) => {
      categories[index] = category;
      values[index] = value;
    });
    [this._categories, this._values] = [categories, values];
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

  @property({ type: Object, attribute: false })
  categoryAxis: AxisConfig = { label: "" };

  @property({ type: Object, attribute: false })
  valueAxis: AxisConfig = { label: "" };

  @property({ type: Object, attribute: false })
  formatters: ValueFormatters = {};

  @property({ type: Orientation })
  orientation: Orientation = Orientation.Vertical;

  @property({ type: XAxisPosition, attribute: "x-axis-position" })
  xAxisPosition = XAxisPosition.Bottom;

  @property({ type: YAxisPosition, attribute: "y-axis-position" })
  yAxisPosition = YAxisPosition.Left;

  @property({ type: Theme })
  theme = Theme.Light;

  @property({ type: Theme, attribute: "tooltip-theme" })
  tooltipTheme = Theme.Light;

  @property({ type: ShowLabels, attribute: "show-labels" })
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
  @queryAll(".rpg-bar")
  private _bars!: HTMLElement[];

  render() {
    const isVertical = this.orientation === Orientation.Vertical;
    const xAxisLabelTemplates = [];
    const yAxisLabelTemplates = [];
    const xAxisValues = isVertical ? this._categories : this._ticks;
    const yAxisValues = isVertical ? this._ticks : this._categories;
    const xAxisConfig = isVertical ? this.categoryAxis : this.valueAxis;
    const yAxisConfig = isVertical ? this.valueAxis : this.categoryAxis;

    for (const item of xAxisValues) {
      const label = formatLabel(item, xAxisConfig.formatter);
      xAxisLabelTemplates.push(html`
        <div class="rpg-axis-label" title=${label}>${label}</div>
      `);
    }
    const xAxisTemplate = html`
      <div class="rpg-x-axis">
        ${xAxisConfig.label
          ? html`<div class="rpg-axis-label rpg-axis-title">
              <div class="rpg-axis-title-content">${xAxisConfig.label}</div>
            </div>`
          : nothing}
        <div class="rpg-x-axis-labels">${xAxisLabelTemplates}</div>
      </div>
    `;
    for (const item of yAxisValues) {
      const label = formatLabel(item, yAxisConfig.formatter);
      yAxisLabelTemplates.push(html`
        <div class="rpg-axis-label" title=${label}>${label}</div>
      `);
    }
    const yAxisTemplate = html`
      <div class="rpg-y-axis">
        <div class="rpg-y-axis-labels">${yAxisLabelTemplates}</div>
        <div
          class="rpg-y-axis-line-container"
          tabindex="0"
          role="slider"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${this._yAxisWidthPercentage}
          aria-valuetext=${this._yAxisWidthDescription}
          aria-label=${`Y-axis positioned ${this.yAxisPosition}`}
          @dragstart=${noop}
          @pointerdown=${this.onYAxisPointerDown}
          @keydown=${this.onYAxisKeyDown}
        >
          ${yAxisConfig.label
            ? html`<div class="rpg-axis-label rpg-axis-title">
                <div class="rpg-axis-title-content">${yAxisConfig.label}</div>
              </div>`
            : nothing}
          <div class="rpg-y-axis-line"></div>
        </div>
      </div>
    `;

    const gridlineTemplates = [];
    for (let i = 0; i < this._ticks.length - 1; i++) {
      gridlineTemplates.push(html`<div class="rpg-gridline"></div>`);
    }

    const barTemplates = [];
    for (const [index, { category, value }] of this.data.entries()) {
      const isFocused = index === this._focusedBarIndex;
      const formatterCategory = formatLabel(
        category,
        this.categoryAxis.formatter,
      );
      const formattedAxisValue = formatLabel(value, this.valueAxis.formatter);
      const formattedBarValue = formatLabel(value, this.formatters?.value);
      const isPositive =
        this._allPositive || !this._allNegative ? value >= 0 : value > 0;
      const barSize = getSizeInPercentages(
        value,
        this._minBarSize,
        this._maxBarSize,
      );

      barTemplates.push(
        html`<li
          class="rpg-bar ${isPositive ? "positive" : "negative"}"
          tabindex=${isFocused ? 0 : -1}
          aria-current=${isFocused ? "true" : "false"}
          aria-label="${formatterCategory}: ${formattedAxisValue}"
          data-category=${formatterCategory}
          data-value=${formattedAxisValue}
        >
          <div
            class="rpg-bar-content"
            style="--rpg-bar-size: ${Math.abs(barSize)}%;"
          >
            <div class="rpg-bar-label">${formattedBarValue}</div>
            <div class="rpg-small-bar-label">${formattedBarValue}</div>
          </div>
        </li>`,
      );
    }

    return html`
      <div
        class=${classMap(this._wrapperClasses)}
        style=${styleMap(this._wrapperStyles)}
        role="figure"
      >
        <div class="rpg-scrollable">
          <div class="rpg-scrollable-content">
            ${isVertical ? xAxisTemplate : yAxisTemplate}
            <div class="rpg-content-container">
              <div class="rpg-gridlines">${gridlineTemplates}</div>
              <ul
                class=${classMap(this._barContainerClasses)}
                @mouseenter=${this.onBarEnter}
                @mouseleave=${this.onBarContainerMouseLeave}
                @focus=${this.onBarContainerFocus}
                @blur=${this.onBarContainerBlur}
                @keydown=${this.onBarContainerKeyDown}
              >
                ${this.data.length
                  ? barTemplates
                  : html`<div class="rpg-empty-state">No data</div>`}
              </ul>
            </div>
          </div>
        </div>
        ${isVertical ? yAxisTemplate : xAxisTemplate}
      </div>
      <tool-tip
        .element=${this._isDraggingYAxis ? null : this._activeBar}
        .container=${this._scrollableElem}
        orientation=${this.orientation}
        theme=${this.tooltipTheme}
      ></tool-tip>
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
    const isVertical = this.orientation === Orientation.Vertical;
    return calculateYAxisWidths(
      this._textSizeDiv,
      this._wrapper,
      this._yAxis,
      isVertical ? this._ticks : this._categories,
      isVertical ? this.valueAxis.formatter : this.categoryAxis.formatter,
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

  @eventOptions({ capture: true })
  private onBarEnter(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains("rpg-bar")) {
      this._activeBar = target;
    }
  }

  @eventOptions({ capture: true })
  private onBarContainerMouseLeave(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this._activeBar = null;
    }
  }

  @eventOptions({ capture: true })
  private onBarContainerFocus(event: FocusEvent) {
    this._activeBar = event.target as HTMLElement;
  }

  @eventOptions({ capture: true })
  private onBarContainerBlur(event: FocusEvent) {
    const nextFocused = event.relatedTarget as HTMLElement;
    if (
      !nextFocused ||
      (nextFocused && !this._barContainer.contains(nextFocused))
    ) {
      this._activeBar = null;
      this._focusedBarIndex = 0;
    }
  }

  @eventOptions({ capture: true })
  private onBarContainerKeyDown(event: KeyboardEvent) {
    const isVertical = this.orientation === Orientation.Vertical;
    const nextKey = isVertical ? "ArrowRight" : "ArrowDown";
    const prevKey = isVertical ? "ArrowLeft" : "ArrowUp";
    const key = event.key;

    if (key === nextKey) {
      event.preventDefault();
      this._focusedBarIndex = Math.min(
        this._focusedBarIndex + 1,
        this.data.length - 1,
      );
      this._bars[this._focusedBarIndex].focus();
    } else if (key === prevKey) {
      event.preventDefault();
      this._focusedBarIndex = Math.max(this._focusedBarIndex - 1, 0);
      this._bars[this._focusedBarIndex].focus();
    } else if (key === "Home") {
      event.preventDefault();
      this._focusedBarIndex = 0;
      this._bars[this._focusedBarIndex].focus();
    } else if (key === "End") {
      event.preventDefault();
      this._focusedBarIndex = this.data.length - 1;
      this._bars[this._focusedBarIndex].focus();
    }
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
      if (self._oldCursor) {
        document.body.style.cursor = self._oldCursor;
      } else {
        document.body.style.removeProperty("cursor");
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    self._oldCursor = document.body.style.cursor;
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  private onYAxisKeyDown(event: KeyboardEvent): void {
    const percentage = parseInt(this._yAxisWidthPercentage ?? "0", 10);
    const key = event.key;
    const isLeftAxis = this.yAxisPosition === YAxisPosition.Left;
    const leftKey = isLeftAxis ? "ArrowLeft" : "ArrowRight";
    const rightKey = isLeftAxis ? "ArrowRight" : "ArrowLeft";
    const commonArgs = {
      currentPercentage: percentage,
      minWidth: this._yAxisMinWidth,
      maxWidth: this._yAxisMaxWidth,
    };

    if (key === leftKey) {
      event.preventDefault();
      this._yAxisWidth =
        getUpdatedYAxisWidth({
          ...commonArgs,
          widthPercentage: Math.max(percentage - 5, 0),
        }) ?? this._yAxisWidth;
    } else if (key === rightKey) {
      event.preventDefault();
      this._yAxisWidth =
        getUpdatedYAxisWidth({
          ...commonArgs,
          widthPercentage: Math.min(percentage + 5, 100),
        }) ?? this._yAxisWidth;
    } else if (key === "Home") {
      event.preventDefault();
      this._yAxisWidth =
        getUpdatedYAxisWidth({
          ...commonArgs,
          widthPercentage: 0,
        }) ?? this._yAxisWidth;
    } else if (key === "End") {
      event.preventDefault();
      this._yAxisWidth =
        getUpdatedYAxisWidth({
          ...commonArgs,
          widthPercentage: 100,
        }) ?? this._yAxisWidth;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._vObserver?.unobserve(this._barContainer);
    this._hObserver?.unobserve(this._barContainer);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    rapidograph: Rapidobar;
  }
}
