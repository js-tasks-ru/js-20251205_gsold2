export default class ColumnChart {
    #data;
    #label;
    #link;
    #value;
    #chartHeight;
    #formatHeading;
    #element;

    constructor({ data = [], chartHeight = 50, label = 'orders', link = '', value = 0, formatHeading = data => `${data}` } = {}) {
        this.#data = data;
        this.#chartHeight = chartHeight;
        this.#label = label;
        this.#link = link;
        this.#value = value;
        this.#formatHeading = formatHeading;
        this.#element = document.createElement('div');
        this.#render();
    }

    #render() {
        this.#element.classList.add('column-chart');
        if (this.#data.length === 0) {
            this.#element.classList.add('column-chart_loading');
        }
        this.#element.style.setProperty("--chart-height", this.#chartHeight);

        let innerHtml = `
            <div class="column-chart__title">
                Total ${this.#label}
                ${this.#addHref()}
            </div>
            <div class="column-chart__container">
                ${this.#addCartHeader()}
                <div data-element="body" class="column-chart__chart">
                    ${this.#addChart()}
                </div>
            </div>`;

        this.#element.innerHTML = innerHtml;
    }

    #addHref() {
        return this.#link !== '' ? `<a href="/${this.#link}" class="column-chart__link">View all</a>` : '';
    }

    #addCartHeader() {
        return this.#value !== 0 ? `<div data-element="header" class="column-chart__header">${this.#formatHeading(this.#value)}</div>` : '';
    }

    #addChart() {
        let maxValue = Math.max(...this.#data);
        let scale = this.#chartHeight / maxValue;

        return this.#data
            .map((item) => {
                let percent = (item / maxValue * 100).toFixed(0);
                let value = Math.floor(item * scale);

                return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
            })
            .join('');
    }

    update(data) {
        this.#data = data;
        let chart = this.#element.querySelector('.column-chart__chart');
        chart.style.display = 'none';
        chart.style.display = '';
    }

    destroy() {
        this.remove();
        this.element = null;
    }

    remove() {
        this.#element.remove();
    }

    get chartHeight() {
        return this.#chartHeight;
    }

    get chartformatHeading() {
        return this.#formatHeading;
    }

    get element() {
        return this.#element;
    }

    set element(value) {
        return this.#element = value;
    }
}
