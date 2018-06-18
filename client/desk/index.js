const dataent = require('dataentjs');
// const Search = require('./search');
const Router = require('dataentjs/common/router');
const Page = require('dataentjs/client/view/page');

const views = {};
views.Form = require('./formpage');
views.List = require('./listpage');
views.Tree = require('./treepage');
views.Print = require('./printpage');
views.FormModal = require('./formmodal');
views.Table = require('./tablepage');
const DeskMenu = require('./menu');

module.exports = class Desk {
    constructor(columns=2) {
        dataent.router = new Router();
        dataent.router.listen();

        let body = document.querySelector('body');
        //this.navbar = new Navbar();
        dataent.ui.empty(body);
        this.container = dataent.ui.add('div', '', body);
        this.containerRow = dataent.ui.add('div', 'row no-gutters', this.container)
        this.makeColumns(columns);

        this.pages = {
            formModals: {},
            List: {}
        };

        this.routeItems = {};

        this.initRoutes();
        // this.search = new Search(this.nav);
    }

    makeColumns(columns) {
        this.menu = null; this.center = null;
        this.columnCount = columns;
        if (columns === 3) {
            this.makeMenu();
            this.center = dataent.ui.add('div', 'col-md-4 desk-center', this.containerRow);
            this.body = dataent.ui.add('div', 'col-md-6 desk-body', this.containerRow);
        } else if (columns === 2) {
            this.makeMenu();
            this.body = dataent.ui.add('div', 'col-md-10 desk-body', this.containerRow);
        } else if (columns === 1) {
            this.makeMenuPage();
            this.body = dataent.ui.add('div', 'col-md-12 desk-body', this.containerRow);
        } else {
            throw 'columns can be 1, 2 or 3'
        }
    }

    makeMenu() {
        this.menuColumn = dataent.ui.add('div', 'col-md-2 desk-menu', this.containerRow);
        this.menu = new DeskMenu(this.menuColumn);
    }

    makeMenuPage() {
        // make menu page for 1 column layout
        this.menuPage = null;
    }

    initRoutes() {
        dataent.router.add('not-found', async (params) => {
            if (!this.notFoundPage) {
                this.notFoundPage = new Page({title: 'Not Found'});
            }
            await this.notFoundPage.show();
            this.notFoundPage.renderError('Not Found', params ? params.route : '');
        })

        dataent.router.add('list/:doctype', async (params) => {
            await this.showViewPage('List', params.doctype);
        });

        dataent.router.add('tree/:doctype', async (params) => {
            await this.showViewPage('Tree', params.doctype);
        });

        dataent.router.add('table/:doctype', async (params) => {
            await this.showViewPage('Table', params.doctype, params);
        })

        dataent.router.add('edit/:doctype/:name', async (params) => {
            await this.showViewPage('Form', params.doctype, params);
        })

        dataent.router.add('print/:doctype/:name', async (params) => {
            await this.showViewPage('Print', params.doctype, params);
        })

        dataent.router.add('new/:doctype', async (params) => {
            let doc = await dataent.getNewDoc(params.doctype);
            // unset the name, its local
            await dataent.router.setRoute('edit', doc.doctype, doc.name);

            // focus on new page
            dataent.desk.body.activePage.body.querySelector('input').focus();
        });

        dataent.router.on('change', () => {
            if (this.menu) {
                this.menu.setActive();
            }
        })
    }

    toggleCenter(show) {
        const current = !dataent.desk.center.classList.contains('hide');
        if (show===undefined) {
            show = current;
        } else if (!!show===!!current) {
            // no change
            return;
        }

        // add hide
        dataent.desk.center.classList.toggle('hide', !show);

        if (show) {
            // set body to 6
            dataent.desk.body.classList.toggle('col-md-6', true);
            dataent.desk.body.classList.toggle('col-md-10', false);
        } else {
            // set body to 10
            dataent.desk.body.classList.toggle('col-md-6', false);
            dataent.desk.body.classList.toggle('col-md-10', true);
        }
    }

    async showViewPage(view, doctype, params) {
        if (!params) params = doctype;
        if (!this.pages[view]) this.pages[view] = {};
        if (!this.pages[view][doctype]) this.pages[view][doctype] = new views[view](doctype);
        const page = this.pages[view][doctype];
        await page.show(params);
    }

    async showFormModal(doctype, name) {
        if (!this.pages.formModals[doctype]) {
            this.pages.formModals[doctype] = new views.FormModal(doctype);
        }
        await this.pages.formModals[doctype].showWith(doctype, name);
        return this.pages.formModals[doctype];
    }

    async setActiveDoc(doc) {
        this.activeDoc = doc;
        if (dataent.desk.center && !dataent.desk.center.activePage) {
            await dataent.desk.showViewPage('List', doc.doctype);
        }
        if (dataent.desk.pages.List[doc.doctype]) {
            dataent.desk.pages.List[doc.doctype].list.setActiveListRow(doc.name);
        }
    }

    setActive(item) {
        let className = 'list-group-item-secondary';
        let activeItem = this.sidebarList.querySelector('.' + className);
        if (activeItem) {
            activeItem.classList.remove(className);
        }
        item.classList.add(className);
    }

    addSidebarItem(label, action) {
        let item = dataent.ui.add('a', 'list-group-item list-group-item-action', this.sidebarList, label);
        if (typeof action === 'string') {
            item.href = action;
            this.routeItems[action] = item;
        } else {
            item.addEventHandler('click', () => {
                action();
                this.setActive(item);
            });
        }
    }
}