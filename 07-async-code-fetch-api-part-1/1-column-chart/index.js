import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    #url;
    #data;
    #label;
    #link;
    #value;
    #chartHeight;
    #formatHeading;
    #element;
    #subElements;

    constructor({ url = '', range, chartHeight = 50, label = 'orders', link = '', value = 0, formatHeading = data => `${data}` } = {}) {
        this.#url = new URL(url, BACKEND_URL);
        this.#data = [];

        this.#chartHeight = chartHeight;
        this.#label = label;
        this.#link = link;
        this.#value = value;
        this.#formatHeading = formatHeading;
        this.#render();
        if (range) this.update(range.from, range.to);
    }

    #render() {
        let innerHtml = `
        <div class="column-chart ${this.#addChartLoading()}" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                Total ${this.#label}
                ${this.#addHref()}
            </div>
            <div class="column-chart__container">
                ${this.#addCartHeader()}
                <div data-element="body" class="column-chart__chart">
                    ${this.#addChart()}
                </div>
            </div>
        </div>`;

        this.#element = this.#createElement(innerHtml);
        this.#subElements = this.#element.querySelector('[data-element="body"]');
    }

    #createElement(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.firstElementChild;
    }

    #addChartLoading() {
        return this.#data.length == 0 ? 'column-chart_loading' : '';
    }

    #addHref() {
        return this.#link !== '' ? `<a href="/${this.#link}" class="column-chart__link">View all</a>` : '';
    }

    #addCartHeader() {
        return this.#value !== 0 ? `<div data-element="header" class="column-chart__header">${this.#formatHeading(this.#value)}</div>` : '';
    }

    #addChart() {
        if (this.#data.length == 0) {
            return `<div style="--value: 0" data-tooltip="100%"></div>`;
        }

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

    async update(from, to) {
        let data = await this.#fetchData(from, to);
        this.#data = Object.values(data);

        this.#subElements.innerHTML = this.#addChart();
        this.#element.classList.remove('column-chart_loading');

        return data;
    }

    async #fetchData(from, to) {
        this.#url.searchParams.set('from', from.toISOString());
        this.#url.searchParams.set('to', to.toISOString());

        return await fetchJson(this.#url);
    }

    destroy() {
        this.#element.remove();
    }

    get chartHeight() {
        return this.#chartHeight;
    }

    get element() {
        return this.#element;
    }

    set element(value) {
        return this.#element = value;
    }

    get subElements() {
        return {
            body: this.#subElements
        };
    }
}
