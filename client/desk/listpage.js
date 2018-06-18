const dataent = require('dataentjs');
const Page = require('dataentjs/client/view/page');
const view = require('dataentjs/client/view');

module.exports = class ListPage extends Page {
    constructor(name) {

        // if center column is present, list does not have its route
        const hasRoute = dataent.desk.center ? false : true;

        super({
            title: dataent._("List"),
            parent: hasRoute ? dataent.desk.body : dataent.desk.center,
            hasRoute: hasRoute
        });

        this.name = name;

        this.list = new (view.getListClass(name))({
            doctype: name,
            parent: this.body,
            page: this
        });

        dataent.docs.on('change', (params) => {
            if (params.doc.doctype === this.list.meta.name) {
                this.list.refreshRow(params.doc);
            }
        });
    }

    async show(params) {
        super.show();

        this.setTitle(this.name===this.list.meta.name ? (this.list.meta.label || this.list.meta.name) : this.name);
        if (dataent.desk.body.activePage && dataent.router.getRoute()[0]==='list') {
            dataent.desk.body.activePage.hide();
        }
        await this.list.refresh();
    }
}
