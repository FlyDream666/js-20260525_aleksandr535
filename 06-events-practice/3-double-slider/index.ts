import { createElement } from "../../shared/utils/create-element";

type DoubleSliderSelected = {
  from: number;
  to: number;
};

interface Options {
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
  selected?: DoubleSliderSelected;
}

export default class DoubleSlider {
  private element: HTMLElement;
  private min: number;
  private max: number;
  private from: number;
  private to: number;
  private activeThumb: HTMLElement | null = null;
  private shiftX: number = 0;

  constructor(private options: Options = {}) {
    this.min = this.options.min ?? 0;
    this.max = this.options.max ?? 100;
    this.from = this.options.selected?.from ?? this.min;
    this.to = this.options.selected?.to ?? this.max;

    this.element = createElement(this.template);
    this.initListeners();
  }

  // Метод для поиска элементов по data-element
  private sub(selector: string): HTMLElement {
    const element = this.element.querySelector<HTMLElement>(`[data-element="${selector}"]`);
    if (!element) {
      throw new Error(`Element with data-element="${selector}" not found`);
    }
    return element;
  }

  // Шаблон слайдера
  private get template() {
    const interval = this.max - this.min;
    const leftProc = interval > 0 ? (this.from - this.min) / interval * 100 : 0;
    const rightProc = interval > 0 ? (this.max - this.to) / interval * 100 : 100;
    const valueFrom = this.options.formatValue ? this.options.formatValue(this.from) : this.from;
    const valueTo = this.options.formatValue ? this.options.formatValue(this.to) : this.to;

    return `<div class="range-slider">
              <span data-element="from">${valueFrom}</span>
              <div data-element="inner" class="range-slider__inner">
                <span data-element="progress" class="range-slider__progress" style="left: ${leftProc}%; right: ${rightProc}%"></span>
                <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: ${leftProc}%"></span>
                <span data-element="thumbRight" class="range-slider__thumb-right" style="right: ${rightProc}%"></span>
              </div>
              <span data-element="to">${valueTo}</span>
            </div>`;
  }

  private initListeners(): void {
    this.element.addEventListener("pointerdown", this.onDown);
  }

  // Метод обработки нажатия кнопки мыши
  private onDown = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!target.tagName) {
      return;
    }

    if (target.dataset.element !== 'thumbLeft' && target.dataset.element !== 'thumbRight') {
      return;
    }
    
    this.activeThumb = target;
    this.shiftX = this.activeThumb.offsetWidth / 2;

    document.addEventListener("pointermove", this.onMove);
    document.addEventListener("pointerup", this.onUp, { once: true });
  }

  // Метод обработки перемещения ползунка
  private onMove = ({ clientX }: PointerEvent) => {
    if (!this.activeThumb || !this.element) {
      return;
    }

    try {
      const inner = this.sub('inner').getBoundingClientRect();

      if (this.activeThumb.dataset.element === 'thumbRight') {
        const thumbLeft = this.sub('thumbLeft');
        const spanProgress = this.sub('progress');
        const toElement = this.sub('to');
        
        const leftPercent = parseFloat(thumbLeft.style.left || '0');
        const percentRight = (inner.right - clientX + this.shiftX) / inner.width * 100;

        if (percentRight + leftPercent > 100 || percentRight < 0) {
          return;
        }

        this.to = Math.round(this.max - (percentRight / 100) * (this.max - this.min));
        toElement.textContent = this.options.formatValue ? this.options.formatValue(this.to) : `${this.to}`;
        this.activeThumb.style.right = `${percentRight}%`;
        spanProgress.style.right = `${percentRight}%`;
      } else if (this.activeThumb.dataset.element === 'thumbLeft') {
        const thumbRight = this.sub('thumbRight');
        const spanProgress = this.sub('progress');
        const fromElement = this.sub('from');
        
        const rightPercent = parseFloat(thumbRight.style.right || '0');
        const percentLeft = (clientX - inner.left + this.shiftX) / inner.width * 100;

        if (percentLeft + rightPercent > 100 || percentLeft < 0) {
          return;
        }

        this.from = Math.round(this.min + (percentLeft / 100) * (this.max - this.min));
        fromElement.textContent = this.options.formatValue ? this.options.formatValue(this.from) : `${this.from}`;
        this.activeThumb.style.left = `${percentLeft}%`;
        spanProgress.style.left = `${percentLeft}%`;
      }
    } catch (error) {
      return;
    }
  }

  // Метод обработки отпускания кнопки мыши
  private onUp = () => {
    this.element.dispatchEvent(new CustomEvent("range-select", {
      detail: { from: this.from, to: this.to }, bubbles: true
    }));

    this.activeThumb = null;
    document.removeEventListener('pointermove', this.onMove);
  }

  // Метод удаления слайдера
  public remove(): void {
    this.element.remove();
  }

  // Метод отписки от всех событий
  public destroy(): void {
    this.element.removeEventListener("pointerdown", this.onDown);
    document.removeEventListener('pointermove', this.onMove);
    this.remove();
    this.activeThumb = null;
  }
}