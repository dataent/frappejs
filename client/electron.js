const common = require('dataentjs/common');
const sqlite = require('dataentjs/backends/sqlite');
const dataent = require('dataentjs');
dataent.ui = require('./ui');
const Desk = require('./desk');
const Observable = require('dataentjs/utils/observable');

module.exports = {
    async start({dbPath, columns = 3, models}) {
        window.dataent = dataent;
        dataent.isServer = true;
        dataent.init();
        dataent.registerLibs(common);
        dataent.registerModels(require('dataentjs/models'));

        if (models) {
            dataent.registerModels(models);
        }

        dataent.db = await new sqlite({ dbPath });
        await dataent.db.connect();
        await dataent.db.migrate();

        dataent.fetch = window.fetch.bind();

        dataent.docs = new Observable();

        await dataent.getSingle('SystemSettings');

        dataent.desk = new Desk(columns);
        await dataent.login('Administrator');
    }
};

