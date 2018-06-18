const FloatControl = require('./float');
const dataent = require('dataentjs');

class CurrencyControl extends FloatControl {
    parse(value) {
        return dataent.parse_number(value);
    }
    format(value) {
        return dataent.format_number(value);
    }
};

module.exports = CurrencyControl;