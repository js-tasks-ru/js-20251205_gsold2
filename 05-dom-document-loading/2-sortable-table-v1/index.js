export default class SortableTable {
  #headers;
  #data;
  #element;

  constructor(headers = [], data = []) {
    this.#headers = headers;
    this.#data = data;

    this.#createElemente();
  }

  #createElemente() {
    const tmp = document.createElement('div');
    tmp.innerHTML = this.#template();
    this.#element = tmp.firstElementChild;
  }

  #template() {
    return `
    <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.#headersTemplate()}
      </div>

      <div data-element="body" class="sortable-table__body">
        ${this.#rowsTemplate()}
      </div>
    </div>`;
  }

  #headersTemplate() {
    return this.#headers
      .map(({ id, title, sortable }) => `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
          <span>${title}</span>
        </div>
      `)
      .join('\n');
  }

  #rowsTemplate() {
    let headersId = this.#headersId();

    return this.#data
      .map((row) => `
        <div class="sortable-table__row">
          ${headersId
          .map(headerId => '<div class="sortable-table__cell">' + row[headerId] + '</div>')
          .join('\n')
        }
        </div>
      `)
      .join('\n');
  }

  #headersId() {
    return this.#headers
      .map(header => header.id);
  }

  #sortRows(header, direction) {
    let { title, sortable, sortType } = this.#headers.filter(e => e.id === header)[0];
    if (sortable === false) throw new TypeError(`Column with title '${title}' is not sortable`);

    if (sortType === 'number') {
      this.#data.sort((a, b) => direction * (a[header] - b[header]));
    } else if (sortType === 'string') {
      this.#data.sort((a, b) => direction * (a[header].localeCompare(b[header], ['ru', 'en'], { caseFirst: 'upper' })));
    } else {
      throw new TypeError(`Invalide sortType '${sortType}'. It should be 'number' or 'string'`);
    }

    let body = this.#elementBody();
    body.innerHTML = this.#rowsTemplate();
  }

  #elementHeader() {
    return this.#element.querySelector('[data-element="header"]');
  }

  #elementBody() {
    return this.#element.querySelector('[data-element="body"]');
  }

  destroy() {
    this.#element.remove();
  }

  sort(header, param = 'asc') {
    let headersId = this.#headersId();
    if (headersId.includes(header)) {
      if (param === 'asc') {
        this.#sortRows(header, 1);
      } else if (param === 'desc') {
        this.#sortRows(header, -1);
      } else {
        throw new TypeError(`Invalide param '${param}'. It should be 'asc' or 'desc'`);
      }
    }
  }

  get element() {
    return this.#element;
  }

  get subElements() {
    return {
      header: this.#elementHeader(),
      body: this.#elementBody()
    };
  }
}