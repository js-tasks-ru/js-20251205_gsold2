export default class NotificationMessage {
    static #activeNotification = null;
    #message;
    #duration;
    #type;
    #element;

    constructor(message = 'message',  { duration = 2000, type = 'success' } = {}) {
        this.#message = message;
        this.#duration = duration;
        this.#type = type;
        this.#createElemente();
    }

    #createElemente() {
        const tmp = document.createElement('div');
        tmp.innerHTML = this.#template();
        this.#element = tmp.firstElementChild;
    }

    #template() {
        return `
        <div class="notification ${this.#type}" style="--value:${Math.floor(this.#duration / 1000)}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.#type}</div>
                <div class="notification-body">${this.#message}</div>
            </div>
        </div>`;
    }

    show(element = document.body) {
        if (NotificationMessage.#activeNotification) {
            NotificationMessage.#activeNotification.remove();
        }

        element.append(this.#element);

        setTimeout(() => {
            if (this.#element) {
                this.remove();
            }
        }, this.#duration);

        NotificationMessage.#activeNotification = this;
    }

    destroy() {
        this.remove();
        if (NotificationMessage.#activeNotification === this) {
            NotificationMessage.#activeNotification = null;
        }
    }

    remove() {
        this.#element.remove();
    }

    get element() {
        return this.#element;
    }

    get duration() {
        return this.#duration;
    }
}