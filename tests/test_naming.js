const assert = require('assert');
const dataent = require('dataentjs');
const helpers = require('./helpers');
const naming = require('dataentjs/model/naming')

describe('Naming', () => {
    before(async function() {
        await helpers.initSqlite();
    });

    it('should start a series and get next value', async () => {
        dataent.db.delete('NumberSeries', 'test-series-')
        assert.equal(await naming.getSeriesNext('test-series-'), 'test-series-1');
        assert.equal(await naming.getSeriesNext('test-series-'), 'test-series-2');
        assert.equal(await naming.getSeriesNext('test-series-'), 'test-series-3');
    });

    it('should set name by autoincrement', async () => {
        const todo1 = await dataent.insert({doctype: 'ToDo', subject: 'naming test'});
        const todo2 = await dataent.insert({doctype: 'ToDo', subject: 'naming test'});
        assert.equal(parseInt(todo1.name) + 1, parseInt(todo2.name));
    });

});