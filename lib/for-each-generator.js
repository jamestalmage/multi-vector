'use strict';
module.exports = forEach;

var fnStore = {};

function forEach(fn, indexes, store) {
  var fnKey = indexes.join(',');
  // jshint evil:true
  var fe = fnStore[fnKey] ||
    (fnStore[fnKey] = new Function('fn', 'store',
      generateForEachCode(indexes)));
  // jshint evil:false

  fe(fn, store);
}

function generateForEachCode(indexes) {
  var lines = [];
  var len = indexes.length;
  var i;
  for (i = 0; i < len; i++) {
    lines.push(
      'var s' + i + ' = ' + prevStore(i) + ';',
      'for (var v' + i + ' in s' + i + ') {',
      'if (s' + i + '.hasOwnProperty(v' + i + ')) {'
    );
  }
  lines.push(
    'var s' + len + ' = ' + prevStore(len) + ';'
  );
  var varNames = [];
  for (i = 0; i < len; i ++) {
    varNames.push('v' + indexes[i]);
  }
  lines.push(
    'fn(s' + len + ', ' + varNames.join(', ') + ');'
  );
  for (i = 0; i < len; i ++) {
    lines.push('}}');
  }
  return lines.join('\n');
}

function prevStore(i) {
  return i === 0 ? 'store' : 's' + (i - 1) + '[v' + (i - 1) + ']';
}
