const dataent = require('dataentjs');
const controls = require('./controls');
const FormLayout = require('./formLayout');
const Observable = require('dataentjs/utils/observable');
const keyboard = require('dataentjs/client/ui/keyboard');
const utils = require('dataentjs/client/ui/utils');

module.exports = class BaseForm extends Observable {
    constructor({doctype, parent, submit_label='Submit', container, meta, inline=false}) {
        super();
        Object.assign(this, arguments[0]);
        this.links = [];

        if (!this.meta) {
            this.meta = dataent.getMeta(this.doctype);
        }

        if (this.setup) {
            this.setup();
        }

        this.make();
        this.bindFormEvents();

        if (this.doc) {
            // bootstrapped with a doc
            this.bindEvents(this.doc);
        }
    }

    make() {
        if (this.body || !this.parent) {
            return;
        }

        if (this.inline) {
            this.body = this.parent
        } else {
            this.body = dataent.ui.add('div', 'form-body', this.parent);
        }

        if (this.actions) {
            this.makeToolbar();
        }

        this.form = dataent.ui.add('form', 'form-container', this.body);

        if (this.inline) {
            this.form.classList.add('form-inline');
        }

        this.form.onValidate = true;

        this.formLayout = new FormLayout({
            fields: this.meta.fields,
            layout: this.meta.layout
        });

        this.form.appendChild(this.formLayout.form);

        this.bindKeyboard();
    }

    bindFormEvents() {
        if (this.meta.formEvents) {
            for (let key in this.meta.formEvents) {
                this.on(key, this.meta.formEvents[key]);
            }
        }
    }

    makeToolbar() {
        if (this.actions.includes('save')) {
            this.makeSaveButton();

            if (this.meta.isSubmittable) {
                this.makeSubmitButton();
                this.makeRevertButton();
            }
        }

        if (this.meta.print && this.actions.includes('print')) {
            let menu = this.container.getDropdown(dataent._('Menu'));
            menu.addItem(dataent._("Print"), async (e) => {
                await dataent.router.setRoute('print', this.doctype, this.doc.name);
            });
        }

        if (!this.meta.isSingle && this.actions.includes('delete')) {
            let menu = this.container.getDropdown(dataent._('Menu'));
            menu.addItem(dataent._("Delete"), async (e) => {
                await this.delete();
            });
        }

        if (!this.meta.isSingle && this.actions.includes('duplicate')) {
            let menu = this.container.getDropdown(dataent._('Menu'));
            menu.addItem(dataent._('Duplicate'), async () => {
                let newDoc = await dataent.getDuplicate(this.doc);
                await dataent.router.setRoute('edit', newDoc.doctype, newDoc.name);
                newDoc.set('name', '');
            });
        }

        if (this.meta.settings && this.actions.includes('settings')) {
            let menu = this.container.getDropdown(dataent._('Menu'));
            menu.addItem(dataent._('Settings...'), () => {
                dataent.desk.showFormModal(this.meta.settings, this.meta.settings);
            });
        }

    }

    makeSaveButton() {
        this.saveButton = this.container.addButton(dataent._("Save"), 'primary', async (event) => {
            await this.save();
        });
        this.on('change', () => {
            const show = this.doc._dirty && !this.doc.submitted;
            this.saveButton.classList.toggle('hide', !show);
        });
    }

    makeSubmitButton() {
        this.submitButton = this.container.addButton(dataent._("Submit"), 'primary', async (event) => {
            await this.submit();
        });
        this.on('change', () => {
            const show = this.meta.isSubmittable && !this.doc._dirty && !this.doc.submitted;
            this.submitButton.classList.toggle('hide', !show);
        });
    }

    makeRevertButton() {
        this.revertButton = this.container.addButton(dataent._("Revert"), 'secondary', async (event) => {
            await this.revert();
        });
        this.on('change', () => {
            const show = this.meta.isSubmittable && !this.doc._dirty && this.doc.submitted;
            this.revertButton.classList.toggle('hide', !show);
        });
    }

    bindKeyboard() {
        keyboard.bindKey(this.form, 'ctrl+s', (e) => {
            if (document.activeElement) {
                document.activeElement.blur();
            }
            e.preventDefault();
            if (this.doc._notInserted || this.doc._dirty) {
                this.save();
            } else {
                if (this.meta.isSubmittable && !this.doc.submitted) this.submit();
            }
        });
    }

    async setDoc(doctype, name) {
        this.doc = await dataent.getDoc(doctype, name);
        this.bindEvents(this.doc);
        if (this.doc._notInserted && !this.doc._nameCleared) {
            this.doc._nameCleared = true;
            // flag so that name is cleared only once
            await this.doc.set('name', '');
        }
        this.setTitle();
        dataent._curFrm = this;
    }

    setTitle() {
        if (!this.container) return;

        const doctypeLabel = this.doc.meta.label || this.doc.meta.name;

        if (this.doc.meta.isSingle || this.doc.meta.naming === 'random') {
            this.container.setTitle(doctypeLabel);
        } else if (this.doc._notInserted) {
            this.container.setTitle(dataent._('New {0}', doctypeLabel));
        } else {
            this.container.setTitle(this.doc.name);
        }
        if (this.doc.submitted) {
            // this.container.addTitleBadge('✓', dataent._('Submitted'));
        }
    }

    setLinks(label, options) {
        // set links to helpful reports as identified by this.meta.links
        if (this.meta.links) {
            let links = this.getLinks();
            if (!links.equals(this.links)) {
                this.refreshLinks(links);
                this.links = links;
            }
        }
    }

    getLinks() {
        let links = [];
        for (let link of this.meta.links) {
            if (link.condition(this)) {
                links.push(link);
            }
        }
        return links;
    }

    refreshLinks(links) {
        if (!(this.container && this.container.clearLinks)) return;

        this.container.clearLinks();
        for(let link of links) {
            // make the link
            utils.addButton(link.label, this.container.linksElement, () => {
                let options = link.action(this);

                if (options) {
                    if (options.params) {
                        // set route parameters
                        dataent.params = options.params;
                    }

                    if (options.route) {
                        // go to the given route
                        dataent.router.setRoute(...options.route);
                    }
                }
            });
        }
    }

    async bindEvents(doc) {
        if (this.doc && this.docListener) {
            // stop listening to the old doc
            this.doc.off(this.docListener);
        }
        this.doc = doc;
        for (let control of this.formLayout.controlList) {
            control.bind(this.doc);
        }

        this.refresh();
        this.setupDocListener();
        this.trigger('use', {doc:doc});
    }

    setupDocListener() {
        // refresh value in control
        this.docListener = (params) => {
            if (params.fieldname) {
                // only single value changed
                let control = this.formLayout.controls[params.fieldname];
                if (control && control.getInputValue() !== control.format(params.fieldname)) {
                    control.refresh();
                }
            } else {
                // multiple values changed
                this.refresh();
            }
            this.trigger('change');
            this.form.classList.remove('was-validated');
        };

        this.doc.on('change', this.docListener);
        this.trigger('change');
    }

    checkValidity() {
        let validity = this.form.checkValidity();
        if (validity) {
            for (let control of this.formLayout.controlList) {
                // check validity in table
                if (control.fieldtype==='Table') {
                    validity = control.checkValidity();
                    if (!validity) {
                        break;
                    }
                }
            }
        }
        return validity;
    }

    refresh() {
        this.formLayout.refresh();
        this.trigger('refresh', this);
        this.setLinks();
    }

    async submit() {
        this.doc.submitted = 1;
        await this.save();
    }

    async revert() {
        this.doc.submitted = 0;
        await this.save();
    }

    async save() {
        if (!this.checkValidity()) {
            this.form.classList.add('was-validated');
            return;
        }
        try {
            let oldName = this.doc.name;
            if (this.doc._notInserted) {
                await this.doc.insert();
            } else {
                await this.doc.update();
            }
            dataent.ui.showAlert({message: dataent._('Saved'), color: 'green'});
            if (oldName !== this.doc.name) {
                dataent.router.setRoute('edit', this.doctype, this.doc.name);
                return;
            }
            this.refresh();
            this.trigger('change');
        } catch (e) {
            console.error(e);
            dataent.ui.showAlert({message: dataent._('Failed'), color: 'red'});
            return;
        }
        await this.trigger('save');
    }

    async delete() {
        try {
            await this.doc.delete();
            dataent.ui.showAlert({message: dataent._('Deleted'), color: 'green'});
            this.trigger('delete');
        } catch (e) {
            dataent.ui.showAlert({message: e, color: 'red'});
        }
    }
}