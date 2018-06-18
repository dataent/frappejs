const dataent = require('dataentjs');

module.exports = class DeskMenu {
    constructor(parent) {
        this.parent = parent;
        this.routeItems = {};
        this.make();
    }

    make() {
        this.listGroup = dataent.ui.add('div', 'list-body', this.parent);
    }

    addItem(label, action) {
        let item = dataent.ui.add('div', 'list-row', this.listGroup, label);
        if (typeof action === 'string') {
            this.routeItems[action] = item;
        }
        item.addEventListener('click', async () => {
            if (typeof action === 'string') {
                await dataent.router.setRoute(action);
            } else {
                action();
            }
            this.setActive(item);
        });
    }

    setActive() {
        if (this.routeItems[window.location.hash]) {
            let item = this.routeItems[window.location.hash];
            let className = 'active';
            let activeItem = this.listGroup.querySelector('.' + className);

            if (activeItem) {
                activeItem.classList.remove(className);
            }
            item.classList.add(className);
        }
    }
}