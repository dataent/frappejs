const dataent = require('dataentjs');

module.exports = class Search {
    constructor(parent) {
        this.input = dataent.ui.add('input', 'form-control nav-search', parent);
        this.input.addEventListener('keypress', function(event) {
            if (event.keyCode===13) {
                let list = dataent.router.current_page.list;
                if (list) {
                    list.search_text = this.value;
                    list.run();
                }
            }
        })
    }
}