import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR = 'https://api.imgur.com/3/image';
const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
    #id;
    #element;
    #categoriesUrl;
    #productsUrl;
    #categories;
    #product;
    #subcategory;

    constructor(id) {
        this.#id = id;
        this.#productsUrl = new URL("api/rest/products", BACKEND_URL);
        this.#categoriesUrl = new URL("api/rest/categories", BACKEND_URL);
        this.#categoriesUrl.searchParams.set('_sort', 'weight');
        this.#categoriesUrl.searchParams.set('_refs', 'subcategory');
    }

    async render() {
        this.#element = this.#renderElement();

        await this.#fetchProductsAndCategories();

        if (this.id) {
            this.#addValues();
            this.#addImages();
        }

        this.#addCategories();

        this.productForm.onsubmit = this.#onSubmit;
        this.element.querySelector('[name="uploadImage"]').onclick = this.#uploadImage;

        return this.element;
    }

    #renderElement() {
        let innerHtml = `
            <div class="product-form">
              <form data-element="productForm" class="form-grid">
                <div class="form-group form-group__half_left">
                    <fieldset>
                        <label class="form-label">Название товара</label>
                        <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
                    </fieldset>
                </div>
                <div class="form-group form-group__wide">
                    <label class="form-label">Описание</label>
                    <textarea required="" class="form-control" name="description" data-element="productDescription"
                        placeholder="Описание товара"></textarea>
                </div>
                <div class="form-group form-group__wide" data-element="sortable-list-container">
                    <label class="form-label">Фото</label>
                    <div data-element="imageListContainer">
                        <ul class="sortable-list" name="images">
                        </ul>
                    </div>
                    <button type="button" name="uploadImage"
                        class="button-primary-outline"><span>Загрузить</span></button>
                </div>
                <div class="form-group form-group__half_left">
                    <label class="form-label">Категория</label>
                    <select class="form-control" name="subcategory">
                    </select>
                </div>
                <div class="form-group form-group__half_left form-group__two-col">
                    <fieldset>
                        <label class="form-label">Цена ($)</label>
                        <input required="" type="number" name="price" class="form-control" placeholder="100">
                    </fieldset>
                    <fieldset>
                        <label class="form-label">Скидка ($)</label>
                        <input required="" type="number" name="discount" class="form-control" placeholder="0">
                    </fieldset>
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Количество</label>
                    <input required="" type="number" class="form-control" name="quantity" placeholder="1">
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Статус</label>
                    <select class="form-control" name="status">
                        <option value="1">Активен</option>
                        <option value="0">Неактивен</option>
                    </select>
                </div>
                <div class="form-buttons">
                    <button type="submit" name="save" class="button-primary-outline">
                        Сохранить товар
                    </button>
                </div>
              </form>
            </div>`;

        return this.#createElement(innerHtml);
    }

    #createElement(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.firstElementChild;
    }

    async #uploadImage() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";

        let file = await new Promise((resolve) => {
            fileInput.addEventListener("change", () => resolve(fileInput.files[0]));
            fileInput.click();
        })

        if (!file) {
            console.log("Fail to select file");
            return;
        }

        let formData = new FormData;
        formData.append('image', file);

        let response = await fetch(`${IMGUR}`, {
            method: "POST",
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
            },
            body: formData
        });

        if (!response.ok) {
            console.log("Fail to save file");
            return;
        }

        let json = await response.json();
        let url = json.data.link;
        let source = file.name;

        let imageHtml = this.#imageTemplate(url, source);
        let image = this.#createElement(imageHtml);
        this.images.appendChild(image);
    }

    #onSubmit = async event => {
        event.preventDefault();

        let formData = new FormData(this.productForm);
        formData.set('id', escapeHtml(this.id));
        let url = formData.getAll('url');
        let source = formData.getAll('source');
        formData.delete('url');
        formData.delete('source');

        let arrOfStr = ['description', 'id', 'subcategory', 'title'];
        arrOfStr.forEach((item) => {
            let tmp = escapeHtml(formData.get(`${item}`));
            formData.append(`${item}`, tmp);
        });

        let obj = Object.fromEntries(formData);

        let images = [];
        source.forEach((value, index) => {
            let image = { 'source': escapeHtml(value), 'url': escapeHtml(url[index]) };
            images.push(image);
        });

        obj['images'] = images;

        let arrOfInt = ['discount', 'price', 'quantity', 'status'];
        arrOfInt.forEach((item) => { obj[`${item}`] = parseInt(obj[item]) });

        let response = await fetch(this.#productsUrl, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(obj),
        });

        if (!response.ok) {
            console.log('Fail to save product');
        }

        if (this.id) {
            this.productForm.dispatchEvent(new CustomEvent("product-updated"));
        } else {
            this.productForm.dispatchEvent(new CustomEvent("product-saved"));
        }

        return false;
    }

    async #fetchProductsAndCategories() {
        if (this.#id) await this.#fetchProducts();
        await this.#fetchCategories();
    }

    async #fetchProducts() {
        let url = new URL(this.#productsUrl);
        url.searchParams.set('id', `${this.#id}`);
        let product = await fetchJson(url);
        this.#product = product[0];
    }

    async #fetchCategories() {
        let categories = await fetchJson(this.#categoriesUrl);
        this.#categories = Object.values(categories);
    }

    #addValues() {
        this.#subcategory = this.#product.subcategory;

        let names = ["title", "description", "price", "discount", "quantity", "status"];
        names.forEach(item => {
            this.element.querySelector(`[name="${item}"]`).value = this.#product[item];
        });
    }

    #addImages() {
        let html = "";
        this.#product.images.forEach(item => {
            let image = this.#imageTemplate(item.url, item.source);
            html = html.concat(image);
        });

        this.images.innerHTML = html;
    }

    #imageTemplate(url, source) {
        let image = `
            <li class="products-edit__imagelist-item sortable-list__item">
                    <input type="hidden" name="url" value="${url}">
                    <input type="hidden" name="source" value="${source}">
                <span>
                    <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                    <img class="sortable-table__cell-img" alt="Image" src="${url}">
                    <span>${source}</span>
                </span>
                <button type="button">
                    <img src="icon-trash.svg" data-delete-handle="" alt="delete">
                </button>
            </li>
            `;
        return image;
    }

    #addCategories() {
        let select = this.element.querySelector('[name="subcategory"]');
        this.#categories
            .forEach(item => {
                let categoryTitle = item["title"];
                let subcategories = item["subcategories"];
                Object.values(subcategories)
                    .forEach((entry) => {
                        let subcategoryTitle = entry['title'];
                        let id = entry['id'];
                        let selected = id == this.#subcategory ? true : false;
                        select.add(new Option(`${categoryTitle} > ${subcategoryTitle}`, `${id}`, selected, selected));
                    })
            });
    }

    get element() {
        return this.#element;
    }

    get productForm() {
        return this.#element.querySelector('[data-element="productForm"]');
    }

    get id() {
        return this.#id;
    }

    get images() {
        return this.element.querySelector('[name="images"]');
    }

    remove() {
        this.element.remove();
        document.removeEventListener('submit', this.#onSubmit);
        document.removeEventListener('click', this.#uploadImage);
    }

    destroy() {
        this.remove();
    }
}
