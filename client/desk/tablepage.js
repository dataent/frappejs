const Page = require('dataentjs/client/view/page');
const dataent = require('dataentjs');
const ModelTable = require('dataentjs/client/ui/modelTable');

module.exports = class TablePage extends Page {
    constructor(doctype) {
        let meta = dataent.getMeta(doctype);
        super({title: `${meta.label || meta.name}`, hasRoute: true});
        this.filterWrapper = dataent.ui.add('div', 'filter-toolbar', this.body);
        this.fitlerButton = dataent.ui.add('button', 'btn btn-sm btn-outline-secondary', this.filterWrapper, 'Set Filters');
        this.tableWrapper = dataent.ui.add('div', 'table-page-wrapper', this.body);
        this.doctype = doctype;
        this.fullPage = true;

        this.fitlerButton.addEventListener('click', async () => {
            const formModal = await dataent.desk.showFormModal('FilterSelector');
            formModal.form.once('apply-filters', () => {
                formModal.hide();
                this.run();
            })
        });

    }

    async show(params) {
        super.show();

        if (!this.filterSelector) {
            this.filterSelector = await dataent.getSingle('FilterSelector');
            this.filterSelector.reset(this.doctype);
        }

        if (dataent.params && dataent.params.filters) {
            this.filterSelector.setFilters(dataent.params.filters);
        }
        dataent.params = null;

        if (!this.modelTable) {
            this.modelTable = new ModelTable({
                doctype: this.doctype,
                parent: this.tableWrapper,
                layout: 'fluid',
                getRowData: async (rowIndex) => {
                    return await dataent.getDoc(this.doctype, this.data[rowIndex].name);
                },
                setValue: async (control) => {
                    await control.handleChange();
                    await control.doc.update();
                }
            });
        }

        this.run();
    }

    async run() {
        this.displayFilters();
        this.data = await dataent.db.getAll({
            doctype: this.doctype,
            fields: ['*'],
            filters: this.filterSelector.getFilters(),
            start: this.start,
            limit: 500
        });
        this.modelTable.refresh(this.data);
    }

    displayFilters() {
        this.fitlerButton.textContent = this.filterSelector.getText();
    }
}