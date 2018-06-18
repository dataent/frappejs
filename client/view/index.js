const BaseList = require('dataentjs/client/view/list');
const BaseTree = require('dataentjs/client/view/tree');
const BaseForm = require('dataentjs/client/view/form');
const dataent = require('dataentjs');

module.exports = {
    getFormClass(doctype) {
        return (dataent.views['Form'] && dataent.views['Form'][doctype]) || BaseForm;
    },
    getListClass(doctype) {
        return (dataent.views['List'] && dataent.views['List'][doctype]) || BaseList;
    },
    getTreeClass(doctype) {
        return (dataent.views['Tree'] && dataent.views['Tree'][doctype] || BaseTree);
    }
}