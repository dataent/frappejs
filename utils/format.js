const number_format = require('./number_format');
const markdown = new (require('showdown').Converter)();
const moment = require('moment');
const dataent = require('dataentjs');

module.exports = {
    format(value, field) {
        if (typeof field === 'string') {
            field = {fieldtype: field};
        }

        if (field.fieldtype==='Currency') {
            value = number_format.format_number(value);

        } else if (field.fieldtype === 'Text') {
            value = markdown.makeHtml(value || '');

        } else if (field.fieldtype === 'Date') {
            let dateFormat;
            if (!dataent.SystemSettings) {
                dateFormat = 'yyyy-mm-dd';
            } else {
                dateFormat = dataent.SystemSettings.dateFormat;
            }

            value = moment(value).format(dateFormat.toUpperCase());

        } else {
            if (value===null || value===undefined) {
                value = '';
            } else {
                value = value + '';
            }
        }
        return value;
    }
}