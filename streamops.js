var events = require('events');

var sop = function(ee) {
  if (ee instanceof events.EventEmitter) {
     var stream = ee;
  } else {
     var stream = new events.EventEmitter;
  }
  var event = "data";
//  var stream = ee | new events.EventEmitter;
/*  var sop = function( stream ) {
    return new sop(stream);
  };*/

  this.on = function(newevent) {
    if (newevent instanceof String) {
      event = newevent;
    }
    return this;
  };

  this.collect = function(event) {
     var collected = '';
//     console.log('starting collection with event ' + event);
     var newstream = new events.EventEmitter();
     stream.on(event, function(chunk) {
       collected += chunk;
//       console.log('chunk collected');
     });
     stream.on('end', function() {
//       console.log('finished collecting');
       newstream.emit(event, collected);
       newstream.emit('end');
     });
     return (new sop(newstream));
  }

  this.split = function(separator) {
    var collected = '';
    separator = separator || "\n";
    var newstream = new events.EventEmitter();
    stream.on(event, function(chunk) {
      // console.log('splitting chunk "' + chunk + '", already collected piece is "' + collected + '"');
      collected += chunk;
      var pieces = collected.split(separator);
      collected = pieces.pop();
     
      for (i in pieces) {
        newstream.emit(event, pieces[i]);
      }
    });

    stream.on('end', function() {
      newstream.emit(event, collected);
      newstream.emit('end');
    });

    return (new sop(newstream));
  }

  this.filter = function(pattern) {
    pattern = pattern || /.*/;
    var newstream = new events.EventEmitter();

    stream.on(event, function(chunk) {
      // console.log('Testing string ' + chunk.toString() + ' against pattern');
      if (pattern.test(chunk.toString())) {
        newstream.emit(event, chunk);  
      }
    });
    stream.on('end', function() {
      newstream.emit('end');
    });
    return (new sop(newstream));
  };

  this.clean = function() {
    var newstream = new events.EventEmitter();
    
    stream.on('data', function(data) {
      if (data) {
        newstream.emit('data', data);
      }
    });

    stream.on('end', function(data) {
      newstream.emit('end');
    });

    return (new sop(newstream));
  };

  // JSON part
  this.json = function() {
    var newstream = new events.EventEmitter();
    stream.on('data', function(data) {
      try {
         var obj = JSON.parse(data);
         newstream.emit('data', obj);
      } catch(e) {
         newstream.emit('error', e);
      }
    
    });

    stream.on('end', function() {
      newstream.emit('end');
    });
  }

  this.result = function() {
    return stream;
  };
};

exports.sop = sop;
