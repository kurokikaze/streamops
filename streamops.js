var events = require('events');

var sop = function(ee) {
  if (ee instanceof events.EventEmitter) {
     var stream = ee;
//     console.log('Using existing stream');
  } else {
     var stream = new events.EventEmitter;
//     console.log('Using new stream');
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

  this.integrate = function(callback) {
    var newstream = new events.EventEmitter();
    stream.on(event, function(data) {
      newstream.emit(event, data);
    });
    callback(newstream); // Get new emitters
    stream.on('end', function(data) {
      newstream.emit('end');
    });

    return (new sob(newstream));
  };

  this.collect = function(targetevent) {
     var e = targetevent || event;
     var collected = '';
//     console.log('starting collection with event ' + e);
     var newstream = new events.EventEmitter();
     stream.on(e, function(chunk) {
       collected += chunk;
//       console.log('chunk collected');
     });
     stream.on('end', function() {
//       console.log('finished collecting');
       newstream.emit(e, collected);
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
    return (new sop(newstream));
  }

  this.only = function(field) {
    var newstream = new events.EventEmitter();
    stream.on('data', function(data) {
      if (data && data[field]) {
       newstream.emit('data', data[field]);
      }
    });
    stream.on('end', function() {
      newstream.emit('end');
    });
    return (new sop(newstream));
  };

  this.log = function() {
    stream.on('data',function(data) {
      console.log('data: ' + JSON.stringify(data));
    });
    stream.on('end', function() {
      console.log('end');
    });
    return this;
  }

  this.result = function() {
    return stream;
  };
  return this;
};

exports.sop = sop;
