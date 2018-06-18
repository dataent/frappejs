const dataent = require('dataentjs');

module.exports = {
    async setName(doc) {
        if (dataent.isServer) {
            // if is server, always name again if autoincrement or other
            if (doc.meta.naming === 'autoincrement') {
                doc.name = await this.getNextId(doc.doctype);
                return;
            }

            if (doc.meta.settings) {
                const numberSeries = (await doc.getSettings()).numberSeries;
                if(numberSeries) {
                    doc.name = await this.getSeriesNext(numberSeries);
                }
            }
        }

        if (doc.name) {
            return;
        }

        // name === doctype for Single
        if (doc.meta.isSingle) {
            doc.name = doc.meta.name;
            return;
        }

        // assign a random name by default
        // override doc to set a name
        if (!doc.name) {
            doc.name = dataent.getRandomString();
        }
    },

    async getNextId(doctype) {
        // get the last inserted row
        let lastInserted = await this.getLastInserted(doctype);
        let name = 1;
        if (lastInserted) {
            let lastNumber = parseInt(lastInserted.name);
            if (isNaN(lastNumber)) lastNumber = 0;
            name = lastNumber + 1;
        }
        return (name + '').padStart(9, '0');
    },

    async getLastInserted(doctype) {
        const lastInserted = await dataent.db.getAll({
            doctype: doctype,
            fields: ['name'],
            limit: 1,
            order_by: 'creation',
            order: 'desc'
        });
        return (lastInserted && lastInserted.length) ? lastInserted[0] : null;
    },

    async getSeriesNext(prefix) {
        let series;
        try {
            series = await dataent.getDoc('NumberSeries', prefix);
        } catch (e) {
            if (!e.status_code || e.status_code !== 404) {
                throw e;
            }
            await this.createNumberSeries(prefix);
        }
        let next = await series.next()
        return prefix + next;
    },

    async createNumberSeries(prefix, setting, start=1000) {
        if (!(await dataent.db.exists('NumberSeries', prefix))) {
            const series = dataent.newDoc({doctype: 'NumberSeries', name: prefix, current: start});
            await series.insert();

            if (setting) {
                const settingDoc = await dataent.getSingle(setting);
                settingDoc.numberSeries = series.name;
                await settingDoc.update();
            }
        }
    }
}
