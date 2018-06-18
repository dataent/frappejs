const dataent = require('dataentjs');

module.exports = class Navbar {
    constructor({brand_label = 'Home'} = {}) {
        Object.assign(this, arguments[0]);
        this.items = {};
        this.navbar = dataent.ui.add('div', 'navbar navbar-expand-md border-bottom navbar-dark bg-dark', document.querySelector('body'));

        this.brand = dataent.ui.add('a', 'navbar-brand', this.navbar, brand_label);
        this.brand.href = '#';

        this.toggler = dataent.ui.add('button', 'navbar-toggler', this.navbar);
        this.toggler.setAttribute('type', 'button');
        this.toggler.setAttribute('data-toggle', 'collapse');
        this.toggler.setAttribute('data-target', 'desk-navbar');
        this.toggler.innerHTML = `<span class="navbar-toggler-icon"></span>`;

        this.navbar_collapse = dataent.ui.add('div', 'collapse navbar-collapse', this.navbar);
        this.navbar_collapse.setAttribute('id', 'desk-navbar');

        this.nav = dataent.ui.add('ul', 'navbar-nav mr-auto', this.navbar_collapse);
    }

    addItem(label, route) {
        let item = dataent.ui.add('li', 'nav-item', this.nav);
        item.link = dataent.ui.add('a', 'nav-link', item, label);
        item.link.href = route;
        this.items[label] = item;
        return item;
    }

    add_dropdown(label) {

    }

    add_search() {
        let form = dataent.ui.add('form', 'form-inline my-2 my-md-0', this.nav);

    }
}