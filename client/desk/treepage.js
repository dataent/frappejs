const dataent = require('dataentjs');
const Page = require('dataentjs/client/view/page');
const view = require('dataentjs/client/view');

module.exports = class TreePage extends Page {
    constructor(name) {
        const hasRoute = true;

        super({
            title: dataent._("Tree"),
            parent: hasRoute ? dataent.desk.body : dataent.desk.center,
            hasRoute: hasRoute
        });

        this.fullPage = true;

        this.name = name;

        this.tree = new (view.getTreeClass(name))({
            doctype: name,
            parent: this.body,
            page: this
        });
    }

    async show(params) {
        super.show();
        this.setTitle(this.name===this.tree.meta.name ? (this.tree.meta.label || this.tree.meta.name) : this.name);
        await this.tree.refresh();
    }
}