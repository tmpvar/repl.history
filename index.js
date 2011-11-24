var fs = require('fs');
module.exports = function (repl, file) {

  try {
    var stat = fs.statSync(file);
    repl.rli.history = fs.readFileSync(file, 'utf-8').split('\n').reverse();
    repl.rli.history.shift();
    repl.rli.historyIndex = 0;
  } catch (e) {}

  var fd = fs.openSync(file, 'a'), reval = repl.eval;

  repl.eval = function(code, context, file, cb) {
    var last = code.substring(1)
    last = last.substring(0, last.length-2);

    if (last && last !== '.history') {
      fs.write(fd, last + '\n');
    } else {
      repl.rli.historyIndex++;
      repl.rli.history.pop();
    }

    reval(code, context, file, cb);
  }

  process.on('exit', function() {
    fs.closeSync(fd);
  });

  repl.commands['.history'] = {
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