const flatpickr = require('flatpickr');
const BaseControl = require('./base');
const dataent = require('dataentjs');

class DateControl extends BaseControl {
    make() {
        let dateFormat = {
            'yyyy-mm-dd': 'Y-m-d',
            'dd/mm/yyyy': 'd/m/Y',
            'dd-mm-yyyy': 'd-m-Y',
            'mm/dd/yyyy': 'm/d/Y',
            'mm-dd-yyyy': 'm-d-Y'
        }
        let altFormat = dataent.SystemSettings ?
            dateFormat[dataent.SystemSettings.dateFormat] :
            dateFormat['yyyy-mm-dd'];

        super.make();
        this.input.setAttribute('type', 'text');
        this.flatpickr = flatpickr(this.input, {
            altInput: true,
            altFormat: altFormat,
            dateFormat:'Y-m-d'
        });
    }

    setDisabled() {
        this.input.disabled = this.isDisabled();
        if (this.flatpickr && this.flatpickr.altInput) {
            this.flatpickr.altInput.disabled = this.isDisabled();
        }
    }

    setInputValue(value) {
        super.setInputValue(value);
        this.flatpickr.setDate(value);
    }
};

module.exports = DateControl;