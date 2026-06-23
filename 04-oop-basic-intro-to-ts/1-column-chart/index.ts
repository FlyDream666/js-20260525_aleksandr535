import { createElement } from "../../shared/utils/create-element";

interface Options {
  data?: number[];
  label?: string;
  value?: number;
  link?: string;
  formatHeading?: (data: number) => string;
}

export default class ColumnChart {
  private data: number[];
  private label: string;
  private value: number;
  private link?: string;
  private formatHeading?: (data: number) => string;
  private _element: HTMLElement | null;
  private bodyElement: HTMLElement | null;
  readonly chartHeight = 50;

  constructor({ data = [], label = '', value = 0, link, formatHeading }: Options = {}) {
    // Сохраняем параметры в свойства класса
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    // Создаем HTML-элемент
    this._element = this.createElement();
    this.bodyElement = this._element.querySelector('[data-element="body"]');
  }

  get element(): HTMLElement {
    if (!this._element) {
      throw new Error('ColumnChart has been destroyed');
    }
    return this._element;
  }

  private createElement(): HTMLElement {
    // Добавляем класс loading, если данные отсутствуют
    const loadingClass = this.data.length === 0 ? ' column-chart_loading' : '';
    
    // Создаем HTML-код компонента
    const html = `
      <div class="column-chart${loadingClass}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.formatValue(this.value)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.renderColumns(this.data)}
          </div>
        </div>
      </div>
    `;
    
    const element = createElement(html);
    
    return element;
  }

  // Метод для форматирования заголовка
  private formatValue(value: number): string {
    if (this.formatHeading) {
      return this.formatHeading(value);
    }
    return String(value);
  }

  // Метод для рендеринга колонок
  private renderColumns(data: number[]): string {
    if (data.length === 0) {
      return '';
    }

    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      const height = Math.floor(item * scale);
      const tooltipPercent = (item / maxValue * 100).toFixed(0);
      
      return `<div style="--value: ${height}" data-tooltip="${tooltipPercent}%"></div>`;
    }).join('');
  }

  // Метод для обновления данных
  update(data: number[]): void {
    this.data = data;
    
    // Обновляем класс loading
    if (this._element) {
      if (data.length === 0) {
        this._element.classList.add('column-chart_loading');
      } else {
        this._element.classList.remove('column-chart_loading');
      }
    }
    
    if (this.bodyElement) {
      this.bodyElement.innerHTML = this.renderColumns(data);
    }
  }

  // Метод для удаления компонента
  remove(): void {
    if (this._element) {
      this._element.remove();
    }
  }

  // Метод для очистки данных
  destroy(): void {
    this.remove();
    this._element = null;
    this.bodyElement = null;
    this.data = [];
    this.label = '';
    this.value = 0;
    this.link = undefined;
    this.formatHeading = undefined;
  }
}
