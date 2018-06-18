const common = require('dataentjs/common');
const HTTPClient = require('dataentjs/backends/http');
const dataent = require('dataentjs');
dataent.ui = require('./ui');
const Desk = require('./desk');
const Observable = require('dataentjs/utils/observable');
const { getPDF } = require('dataentjs/client/pdf');

module.exports = {
    async start({server, columns = 2, makeDesk = false}) {
        window.dataent = dataent;
        dataent.init();
        dataent.registerLibs(common);
        dataent.registerModels(require('dataentjs/models'), 'client');
        dataent.fetch = window.fetch.bind();

        dataent.db = await new HTTPClient({server: server});
        this.socket = io.connect(`http://${server}`); // eslint-disable-line
        dataent.db.bindSocketClient(this.socket);

        dataent.docs = new Observable();
        await dataent.getSingle('SystemSettings');

        if(makeDesk) {
            this.makeDesk(columns);
        }
    },

    async makeDesk(columns) {
        dataent.desk = new Desk(columns);
        await dataent.login();
    },

    setCall() {
        dataent.call = async (method, args) => {
            let url = `/api/method/${method}`;
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(args || {})
            });

            return await response.json();
        }

        dataent.getPDF = getPDF;
    }
};

