import { LitElement, css, html, unsafeCSS } from "lit";
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
  getSizeInPercentages,
  noop,
} from "./utils";

// "?inline" makes Vite import CSS as a string instead of injecting it globally
import {
  DEFAULT_Y_AXIS_WIDTH,
  MAX_Y_AXIS_WIDTH,
  MIN_Y_AXIS_WIDTH,
  Y_AXIS_WIDTH_CSS_VAR,
} from "./constants.ts";
import styles from "./css/style.css?inline";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("rapido-graph")
export class Rapidograph extends LitElement {
  static get styles() {
    return css`
      ${unsafeCSS(styles)}
    `;
  }

  private _data: DataItem[] = [];

  // todo: should it be state
  @state()
  private _values: number[] = [];
  @state()
  private _ticks: number[] = [];
  @state()
  private _min: number = 0;
  @state()
  private _max: number = 100;
  @state()
  private _hasPositive: boolean = true;
  @state()
  private _hasNegative: boolean = true;
  @state()
  private _allPositive: boolean = true;
  @state()
  private _allNegative: boolean = true;
  @state()
  private _yAxisWidth: number = DEFAULT_Y_AXIS_WIDTH;
  @state()
  private _yAxisMinWidth: number = MIN_Y_AXIS_WIDTH;
  @state()
  private _yAxisMaxWidth: number = MAX_Y_AXIS_WIDTH;

  @property({ type: Array })
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

    const { min, max } = getMinAndMax(this._values, 5);
    this._min = min;
    this._max = max;

    const { hasPositive, hasNegative } = checkIfSomePositiveAndNegative(
      this._values,
    );

    this._hasPositive = hasPositive;
    this._hasNegative = hasNegative;

    const { allPositive, allNegative } = checkIfAllPositiveOrNegative(
      this._values,
    );
    this._allPositive = allPositive;
    this._allNegative = allNegative;

    const { maxWidth, minWidth, width } = calculateYAxisWidths(
      this.textSizeDiv,
      this.wrapper,
      this.yAxis,
      this.orientation === Orientation.Vertical ? this._ticks : this._values,
    );

    this._yAxisMaxWidth = maxWidth;
    this._yAxisMinWidth = minWidth;
    this._yAxisWidth = width;
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

  // todo: need property?
  @property({ attribute: false })
  wrapperClasses = {
    "rpg-wrapper": true,
    [this.orientation]: true,
    [`x-axis-${this.xAxisPosition}`]: true,
    [`y-axis-${this.yAxisPosition}`]: true,
    [`labels-${this.showLabels}`]: true,
  };
  @property({ attribute: false })
  @property({ attribute: false })
  barContainerClasses = {
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
  vObserver!: IntersectionObserver;
  hObserver!: IntersectionObserver;

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

    const maxYAxisWidth = this._yAxisMaxWidth - this._yAxisMinWidth;
    const currentYAxisWidth = this._yAxisWidth - this._yAxisMinWidth;
    const ariaValueNow = ((currentYAxisWidth * 100) / maxYAxisWidth).toFixed(0);
    const description = `Y-axis offset ${ariaValueNow}%`;

    return html`
      <div class="rpg" theme=${this.theme}>
        <div
          class=${classMap(this.wrapperClasses)}
          style="
            --rpg-scrollbar-width: 15px;
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
                <div class=${classMap(this.barContainerClasses)} role="list">
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
              aria-valuenow=${ariaValueNow}
              aria-valuetext=${description}
              @dragstart=${noop}
              @pointerdown=${this.onPointerDown}
            >
              <div class="rpg-y-axis-line"></div>
            </div>
          </div>
        </div>
      </div>
      <div aria-live="polite">${description}</div>
      <div id="rpg-get-text-width" class="rpg-axis-label"></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.onPointerDown = this.onPointerDown.bind(this);
    // this.onKeyDown = this.onKeyDown.bind(this);
    // this.addObservers();
    // this.addListeners();
  }

  // private addObservers() {
  //   const options = {
  //     root: this.scrollableElem,
  //     threshold: 1,
  //   };
  //   const verticalOptions = {
  //     rootMargin: "0px -16px",
  //   };
  //   const horizontalOptions = {
  //     rootMargin: "-16px 0px",
  //   };
  //
  //   const callback = () => {
  //     const width = getScrollbarWidth(this.orientation, this.scrollableElem);
  //     this.wrapper.style.setProperty(SCROLLBAR_WIDTH_CSS_VAR, `${width}px`);
  //   };
  //   this.vObserver = new IntersectionObserver(callback, {
  //     ...options,
  //     ...verticalOptions,
  //   });
  //   this.hObserver = new IntersectionObserver(callback, {
  //     ...options,
  //     ...horizontalOptions,
  //   });
  //
  //   this.vObserver.observe(this.barContainer);
  //   this.hObserver.observe(this.barContainer);
  //
  //   // this.vTooltipObserver = new IntersectionObserver(
  //   //   (entries) => positionTooltip(this.orientation, entries),
  //   //   {
  //   //     ...options,
  //   //     ...verticalOptions,
  //   //   },
  //   // );
  //   // this.hTooltipObserver = new IntersectionObserver(
  //   //   (entries) => positionTooltip(this.orientation, entries),
  //   //   {
  //   //     ...options,
  //   //     ...horizontalOptions,
  //   //   },
  //   // );
  // }

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

  disconnectedCallback(): void {
    this.vObserver?.unobserve(this.barContainer);
    this.hObserver?.unobserve(this.barContainer);

    // this.yAxisLineContainer.removeEventListener("dragstart", noop);
    // this.yAxisLineContainer.removeEventListener(
    //   "pointerdown",
    //   this.onPointerDown,
    // );
    // TODO: check if removed properly because of arrow function
    // this.yAxisLineContainer.removeEventListener("keydown", this.onKeyDown);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    rapidograph: Rapidograph;
  }
}
