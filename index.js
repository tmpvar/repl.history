var fs = require('fs');
module.exports = function (repl, file) {

  try {
    var stat = fs.statSync(file);
    repl.rli.history = fs.readFileSync(file, 'utf-8').split('\n').reverse();
    repl.rli.history.shift();
    repl.rli.historyIndex = -1; // will be incremented before pop
  } catch (e) {}

  var fd = fs.openSync(file, 'a'), reval = repl.eval;
  var wstream = fs.createWriteStream(file, {
    fd: fd
  });
  wstream.on('error', function(err) {
    throw err;
  });

  repl.rli.addListener('line', function(code) {
    if (code && code !== '.history') {
      wstream.write(code + '\n');
    } else {
      repl.rli.historyIndex++;
      repl.rli.history.pop();
    }
  });

  process.on('exit', function() {
    fs.closeSync(fd);
  });

  repl.commands['history'] = {
    help : 'Show the history',
    action : function() {
      var out = [];
      repl.rli.history.forEach(function(v, k) {
        out.push(v);
      });
      repl.outputStream.write(out.reverse().join('\n') + '\n');
      repl.displayPrompt();
    }
  };
};
