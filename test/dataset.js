var assert = require('assert'),
    moment = require('moment'),
    vis = require('../vis.js'),
    DataSet = vis.DataSet;

var now = new Date();

var data = new DataSet({
    fieldTypes: {
        start: 'Date',
        end: 'Date'
    }
});

// add single items with different date types
data.add({id: 1, content: 'Item 1', start: new Date(now.valueOf())});
data.add({id: 2, content: 'Item 2', start: now.toISOString()});
data.add([
    //{id: 3, content: 'Item 3', start: moment(now)}, // TODO: moment fails, not the same instance
    {id: 3, content: 'Item 3', start: now},
    {id: 4, content: 'Item 4', start: '/Date(' + now.valueOf() + ')/'}
]);

var items = data.get();
assert.equal(items.length, 4);
items.forEach(function (item) {
    assert.ok(item.start instanceof Date);
});

// get filtered fields only
var sort = function (a, b) {
    return a.id > b.id;
};
assert.deepEqual(data.get({
    fields: ['id', 'content']
}).sort(sort), [
    {id: 1, content: 'Item 1'},
    {id: 2, content: 'Item 2'},
    {id: 3, content: 'Item 3'},
    {id: 4, content: 'Item 4'}
]);


// cast dates
assert.deepEqual(data.get({
    fields: ['id', 'start'],
    fieldTypes: {start: 'Number'}
}).sort(sort), [
    {id: 1, start: now.valueOf()},
    {id: 2, start: now.valueOf()},
    {id: 3, start: now.valueOf()},
    {id: 4, start: now.valueOf()}
]);


// get a single item
assert.deepEqual(data.get(1, {
    fields: ['id', 'start'],
    fieldTypes: {start: 'ISODate'}
}), {
    id: 1,
    start: now.toISOString()
});

// remove an item
data.remove(2);
assert.deepEqual(data.get({
    fields: ['id']
}).sort(sort), [
    {id: 1},
    {id: 3},
    {id: 4}
]);

// add an item
data.add({id: 5, content: 'Item 5', start: now.valueOf()});
assert.deepEqual(data.get({
    fields: ['id']
}).sort(sort), [
    {id: 1},
    {id: 3},
    {id: 4},
    {id: 5}
]);

// update an item
data.update({id: 5, content: 'changed!'});                         // update item (extend existing fields)
data.remove(3);                                                    // remove existing item
data.add({id: 3, other: 'bla'});                                   // add new item
data.update({id: 6, content: 'created!', start: now.valueOf()});   // this item is not yet existing, create it
assert.deepEqual(data.get().sort(sort), [
    {id: 1, content: 'Item 1', start: now},
    {id: 3, other: 'bla'},
    {id: 4, content: 'Item 4', start: now},
    {id: 5, content: 'changed!', start: now},
    {id: 6, content: 'created!', start: now}
]);

data.clear();

assert.equal(data.get().length, 0);


// TODO: extensively test DataSet
