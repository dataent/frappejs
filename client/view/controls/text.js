const BaseControl = require('./base');
const dataent = require('dataentjs');

class TextControl extends BaseControl {
    makeInput() {
        this.input = dataent.ui.add('textarea', 'form-control', this.getInputParent());
    }
    make() {
        super.make();
        this.input.setAttribute('rows', '8');
    }
};

module.exports = TextControl;