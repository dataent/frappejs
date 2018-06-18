const dataent = require('dataentjs');
const Page = require('dataentjs/client/view/page');
const { getHTML } = require('dataentjs/common/print');
const nunjucks = require('nunjucks/browser/nunjucks');

nunjucks.configure({ autoescape: false });

module.exports = class PrintPage extends Page {
    constructor(doctype) {
        let meta = dataent.getMeta(doctype);
        super({title: `${meta.name}`, hasRoute: true});
        this.meta = meta;
        this.doctype = doctype;
        this.titleElement.classList.add('hide');

        this.addButton(dataent._('Edit'), 'primary', () => {
            dataent.router.setRoute('edit', this.doctype, this.name)
        });

        this.addButton(dataent._('PDF'), 'secondary', async () => {
            dataent.getPDF(this.doctype, this.name);
        });
    }

    async show(params) {
        super.show();
        this.name = params.name;
        if (this.meta.print) {
            // render
            this.renderTemplate();
        } else {
            this.renderError('No Print Settings');
        }
    }

    async renderTemplate() {
        let doc = await dataent.getDoc(this.doctype, this.name);
        dataent.desk.setActiveDoc(doc);
        const html = await getHTML(this.doctype, this.name);
        try {
            this.body.innerHTML = html;
            // this.setTitle(doc.name);
        } catch (e) {
            this.renderError('Template Error', e);
            throw e;
        }
    }
}
