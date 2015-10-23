var fs = require('fs');
module.exports = function (repl, file) {

  try {
    var stat = fs.statSync(file);
    repl.rli.history = fs.readFileSync(file, 'utf-8').split('\n').reverse();
    repl.rli.history.shift();
    repl.rli.historyIndex = -1; // will be incremented before pop
  } catch (e) {}

  var fd = fs.openSync(file, 'a'), reval = repl.eval;

  repl.rli.addListener('line', function(code) {
    if (code && code !== '.history' && code !==".clearhistory") {
      fs.write(fd, code + '\n');
    } else {
      repl.rli.historyIndex++;
      repl.rli.history.shift();
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

  repl.commands['clearhistory'] = {
    help : 'Clear the history',
    action : function() {
      var fd = fs.openSync(file, 'w');
      fs.write(fd,"",function(){
        while(repl.rli.history.length > 0){
          repl.rli.history.pop();
        };

        repl.displayPrompt();
      });
    }
  };
};
