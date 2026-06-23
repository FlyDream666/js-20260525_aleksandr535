import { createElement } from "../../shared/utils/create-element";

interface Options {
  duration?: number;
  type?: 'success' | 'error';
}

export default class NotificationMessage {
  static activeNotification: NotificationMessage | null = null;

  element: HTMLElement | null = null;
  timerId: number | null = null;

  constructor(
    private message: string,
    { duration = 2000, type = 'success' }: Options = {}
  ) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    this.element = this.createNotificationElement(message, duration, type);
    NotificationMessage.activeNotification = this;
  }

  // Создание элемента уведомления
  private createNotificationElement(
    message: string,
    duration: number,
    type: 'success' | 'error'
  ): HTMLElement {
    const html = `
      <div class="notification ${type}" style="--value:${duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${type}</div>
          <div class="notification-body">${message}</div>
        </div>
      </div>
    `;
    return createElement(html);
  }

  // Метод для отображения уведомления
  show(target: HTMLElement = document.body): void {
    target.append(this.element!);
    const durationSeconds = parseFloat(this.element!.style.getPropertyValue('--value'));
    this.timerId = window.setTimeout(() => {
      this.remove();
    }, durationSeconds * 1000);
  }

  // Метод для удаления уведомления
  remove(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  // Метод для очистки уведомления
  destroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (NotificationMessage.activeNotification === this) {
      NotificationMessage.activeNotification = null;
    }
    this.remove();
  }
}
