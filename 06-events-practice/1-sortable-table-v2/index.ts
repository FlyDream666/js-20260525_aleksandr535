import {createElement} from "../../shared/utils/create-element";

type SortOrder = 'asc' | 'desc';

type SortableTableData = Record<string, string | number>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number' | 'custom';
  template?: (value: string | number) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  data?: SortableTableData[];
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
}

export default class SortableTable {
  public element: HTMLElement | null;
  public bodyElement: HTMLDivElement | null;
  public headerElement: HTMLDivElement | null;
  private arrowElement: HTMLElement;
  private currentSortedColumn: HTMLElement | null = null;

  constructor(private headersConfig: SortableTableHeader[] = [], private options: Options = {}) {
    this.element = createElement(this.template);
    this.bodyElement = this.element.querySelector<HTMLDivElement>('[data-element="body"]');
    this.headerElement = this.element.querySelector<HTMLDivElement>('[data-element="header"]');
    this.arrowElement = createElement(`<span data-element="arrow" class="sortable-table__sort-arrow">
                                                <span class="sort-arrow"></span>
                                            </span>`);

    if (typeof this.options.isSortLocally === 'undefined') {
      this.options.isSortLocally = true;
    }

    // Сохраняем копию данных, чтобы не мутировать исходный массив
    if (this.options.data) {
      this.options.data = [...this.options.data];
    }

    if (this.options.sorted) {
      this.sort(this.options.sorted.id, this.options.sorted.order);
    }

    this.headerElement?.addEventListener("pointerdown", this.onClick);
  }

  // Шаблон компонента
  private get template() {
    const headerContent = this.renderHeader();
    const bodyContent = this.renderRows();

    return `<div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${headerContent}
                </div>
                <div data-element="body" class="sortable-table__body">
                       ${bodyContent}
                </div>
                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                   <div>
                     <p>No products satisfies your filter criteria</p>
                     <button type="button" class="button-primary-outline">Reset all filters</button>
                   </div>
                </div>
            </div>`;
  }

  // Рендер строк
  private renderRows() {
    return this.options.data?.map((dataItem) => {
      const columnItem = this.headersConfig?.map((configItem) => {
        if (dataItem[configItem.id]) {
          return configItem.template ?
            configItem.template(dataItem[configItem.id]) :
            `<div class="sortable-table__cell">${dataItem[configItem.id]}</div>`;
        }
      }).join('');

      return `<a href="/products/${dataItem.id}" class="sortable-table__row">${columnItem}</a>`
    }).join('');
  }

  // Рендер заголовков
  private renderHeader() {
    return this.headersConfig?.map((configItem) => {
      return `<div
                class="sortable-table__cell"
                data-id="${configItem.id}"
                data-sortable="${configItem.sortable ?? false}">
                    ${configItem.title}
              </div>`;
    }).join('');
  }

  // Сортировка
  public sort(field: string, order: SortOrder) {
    if (this.options.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer();
    }
  }

  private sortOnServer() {

  }

  private sortOnClient(field: string, order: SortOrder) {
    if (!this.element) return;
    if (!this.bodyElement) return;
    if (!this.headerElement) return;
    if (!this.options.data) return;

    const directions = {asc: 1, desc: -1};
    const column = this.headersConfig.find(item => item.id === field && item.sortable === true);
    if (!column) return;

    const customSorting = column.customSorting;

    // Создаем новый массив для сортировки, исходный остается нетронутым
    const sortedData = [...this.options.data].sort((rowA, rowB) => {
      if (typeof rowA[field] === 'undefined' || typeof rowB[field] === 'undefined') return 0;

      if (column['sortType'] === 'string') {
        return (rowA[field] as string).localeCompare((rowB[field] as string), ["ru", "en"], {caseFirst: "upper"}) * directions[order];
      } else if (column['sortType'] === 'number') {
        return ((rowA[field] as number) - (rowB[field] as number)) * directions[order];
      } else if (column['sortType'] === 'custom' && customSorting) {
        return customSorting(rowA, rowB) * directions[order];
      } else return 0;
    });

    // Обновляем данные только для отображения
    this.options.data = sortedData;
    this.bodyElement.innerHTML = this.renderRows() ?? '';

    // Обновляем состояние сортировки на заголовке
    this.updateHeaderSortState(field, order);
  }

  private updateHeaderSortState(field: string, order: SortOrder) {
    if (!this.headerElement) return;

    // Удаляем стрелку с текущего столбца
    if (this.currentSortedColumn) {
      const arrowElement = this.currentSortedColumn.querySelector('[data-element="arrow"]');
      if (arrowElement) {
        arrowElement.remove();
      }
      this.currentSortedColumn.removeAttribute('data-order');
    }

    // Находим новый столбец и добавляем стрелку
    const newColumn = this.headerElement.querySelector<HTMLDivElement>(`[data-id="${field}"]`);
    if (newColumn) {
      // Создаем новую стрелку, так как старая уже удалена
      const newArrow = createElement(`<span data-element="arrow" class="sortable-table__sort-arrow">
                                            <span class="sort-arrow"></span>
                                      </span>`);
      newColumn.setAttribute('data-order', order);
      newColumn.append(newArrow);
      this.currentSortedColumn = newColumn;
    }
  }

  private onClick = (event: Event) => {
    const target = event.target as HTMLElement;
    if (!("tagName" in target)) {
      return;
    }

    const column = target.closest('[data-id]') as HTMLElement;
    if (!column) return;

    const field = column.getAttribute('data-id');
    const order = column.getAttribute('data-order') === 'desc' ? 'asc' : 'desc';

    if (!field) {
      return;
    }

    this.sort(field, order);
  }

  // Метод для удаления компонента
  public remove() {
    if (!this.element) return;
    this.element.remove();
  }

  // Метод для очистки данных
  public destroy() {
    this.remove();
    this.headerElement?.removeEventListener("pointerdown", this.onClick);
    this.element = null;
    this.currentSortedColumn = null;
  }
}