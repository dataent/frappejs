const dataent = require('dataentjs');
const Dropdown = require('./dropdown');

module.exports = {
    create(tag, obj) {
        if(tag.includes('<')) {
            let div = document.createElement('div');
            div.innerHTML = tag.trim();
            return div.firstChild;
        }
        let element = document.createElement(tag);
        obj = obj || {};

        let $ = (expr, con) => {
            return typeof expr === "string"
                ? (con || document).querySelector(expr)
                : expr || null;
        }

        for (var i in obj) {
            let val = obj[i];

            if (i === "inside") {
                $(val).appendChild(element);
            }
            else if (i === "around") {
                let ref = $(val);
                ref.parentNode.insertBefore(element, ref);
                element.appendChild(ref);

            } else if (i === "styles") {
                if(typeof val === "object") {
                    Object.keys(val).map(prop => {
                        element.style[prop] = val[prop];
                    });
                }
            } else if (i in element ) {
                element[i] = val;
            }
            else {
                element.setAttribute(i, val);
            }
        }

        return element;
    },

    add(tag, className, parent, textContent) {
        let element = document.createElement(tag);
        if (className) {
            for (let c of className.split(' ')) {
                this.addClass(element, c);
            }
        }
        if (parent) {
            parent.appendChild(element);
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    },

    remove(element) {
        element.parentNode.removeChild(element);
    },

    on(element, event, selector, handler) {
        if (!handler) {
            handler = selector;
            this.bind(element, event, handler);
        } else {
            this.delegate(element, event, selector, handler);
        }
    },

    off(element, event, handler) {
        element.removeEventListener(event, handler);
    },

    bind(element, event, callback) {
        event.split(/\s+/).forEach(function (event) {
            element.addEventListener(event, callback);
        });
    },

    delegate(element, event, selector, callback) {
        element.addEventListener(event, function (e) {
            const delegatedTarget = e.target.closest(selector);
            if (delegatedTarget) {
                e.delegatedTarget = delegatedTarget;
                callback.call(this, e, delegatedTarget);
            }
        });
    },

    empty(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    addClass(element, className) {
        if (element.classList) {
            element.classList.add(className);
        } else {
            element.className += " " + className;
        }
    },

    removeClass(element, className) {
        if (element.classList) {
            element.classList.remove(className);
        } else {
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    },

    toggleClass(element, className, flag) {
        if (flag === undefined) {
            flag = !element.classList.contains(className);
        }

        if (!flag) {
            this.removeClass(element, className);
        } else {
            this.addClass(element, className);
        }
    },

    toggle(element, default_display = '') {
        element.style.display = element.style.display === 'none' ? default_display : 'none';
    },

    make_dropdown(label, parent, btn_class = 'btn-secondary') {
        return new Dropdown({parent: parent, label:label, btn_class:btn_class});
    },

    showAlert({message, color='yellow', timeout=4}) {
        let alert = this.add('div', 'alert alert-warning bottom-right-float', document.body);
        alert.innerHTML = `<span class='indicator ${color}'>${message}</span>`;
        dataent.sleep(timeout).then(() => alert.remove());
        return alert;
    }
}