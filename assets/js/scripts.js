const api = (params) => {
  return new Promise((resolve) => {
    const paramsKeys = Object.keys(params);

    let url = `http://localhost:8080/products`;

    url = paramsKeys.reduce((prevValue, objKey, index) => {
      const value = params[objKey];
      let delimiter = `&`;

      if(index === 0) {
        delimiter = '?';
      }

      if(value) {
        prevValue += `${delimiter}${objKey}=${value}`;
      }
      
      return prevValue;
    }, url);

    axios.get(url).then(res => {
      resolve(res.data);
    });
  });
}

const products = [];

const getFilters = (filters) => {
  let result = {...filters};

  const localFilters = JSON.parse(localStorage.getItem('filters'));
  if(localFilters !== null) {
    result = localFilters;
  }

  const localDisplayType = localStorage.getItem('displayType');
  if(localDisplayType) {
    result.displayType = localDisplayType;
  }

  return result;
}

const sidebar = {
  filters: {
    displayType: localStorage.getItem('displayType') || 'grid',
    sort: 'desc', // asc, desc
    minPrice: null,
    maxPrice: null,
    productName: '',
    page: 1,
    limit: 10
  },
  init(sidebarId) {
    const filters = getFilters(this.filters);
    const { displayType } = filters;

    if(sidebarId) {
      const container = document.getElementById(sidebarId);

      container.querySelectorAll('select, input').forEach(element => {
        const { name } = element;
        const defaultValue = filters[name];
        element.value = defaultValue;
      });

      productList.changeDisplayType(displayType);
    }
  },
  handleChange(e) {
    const { name, value } = e.target;
    this.filters[name] = value;

    if(name === 'displayType') {
      productList.changeDisplayType(value);
    } else {
      productList.addFilter(name, value);
    }
  }
}

const productList = {
  container: document.getElementById('products'),
  filters: getFilters(sidebar.filters),
  items: products,
  changeDisplayType(displayType) {
    const { container } = this;
    container.removeAttribute('class');
    container.classList.add(`display-${displayType}`);

    localStorage.setItem('displayType', displayType);
  },
  async refresh() {
    const { filters } = this;

    localStorage.setItem('filters', JSON.stringify(filters));
    
    const data = await api(filters);
    delete filters.displayType;
    this.items = data.items;
    this.count = data.count;
    this.pages = data.pages;
    this.init();
  },
  addFilter(name, value) {
    this.filters[name] = value;
    this.refresh();
  },
  init() {
    const { filters: { page }, count, pages, items, container } = this;
    
    const html = items.reduce((prevValue, obj) => {
      const { name, description, price, image, currency } = obj;
      const productHTML = `
      <div class="product">
        <div class="product-image">
          <img src="//placehold.it/640/480" alt=""/>
        </div>
        <div class="product-name">${name}</div>
        <div class="product-description">${description}</div>
        <div class="product-price">${price} ${currency}</div>
      </div>
      `;

      return `${prevValue}${productHTML}`;
    }, '');

    container.innerHTML = `<div style="min-width: 100%;">Products: ${count}, Number of pages: ${pages}, Current Page: ${page}</div> ${html}`;
  }
}

sidebar.init('sidebar');
productList.refresh();