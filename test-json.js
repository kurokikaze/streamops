var sop = require('./streamops'),
    events = require('events');

var test = new events.EventEmitter();

sop.sop(test).json().only('test').filter(/a.+/).log();

test.emit('data', JSON.stringify({"test": "a1"}));
test.emit('data', JSON.stringify({"test": "b1"}));
test.emit('data', JSON.stringify({"test": "a2"}));
test.emit('data', JSON.stringify({"test": "b2"}));

test.emit('end');
