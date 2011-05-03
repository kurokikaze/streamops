var sop = require('./streamops'),
    events = require('events'),
    http = require('http');

var tester = new events.EventEmitter();
console.log('Starting test');
//console.log('Sopped stream: ' + typeof new sop.sop(tester).collect());
var splitter = new sop.sop(tester).split(';').clean().result();
// var filterer = (new sop.sop(splitter)).filter(/^string[0-9]/).result();

splitter.on('data', function(string) {
  console.log('splitted piece:' + string);
});

splitter.on('end', function() {
  console.log('splitting stopped');
});

/*filterer.on('data', function(string) {
  console.log('filtered piece:' + string);
});
filterer.on('end', function() {
  console.log('Collection stopped');
}); */


tester.emit('data', 'string1;test1');
tester.emit('data', 'string2;');
tester.emit('data', 'string3;');

tester.emit('end');

var options = {
  'host': 'google.com',
  'port': 80,
  'path': '/intl/ru/about.html',
  'method': 'GET'
};
var call = http.request(options, function(res) {
  console.log('Status code:' + res.statusCode);
  console.log('Expected content length:' + res.headers['content-length']);
    sop.sop(res).collect().result().on('data', function(answer) {
    console.log('Got answer:' + answer.length);
  });
});
call.end();
