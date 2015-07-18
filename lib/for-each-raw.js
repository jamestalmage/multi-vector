'use strict';
module.exports = forEach;

function forEach(fn, indexes, store) {
  var rawIndexes = [];
  for (var i = 0; i < indexes.length; i++) {
    rawIndexes[indexes[i]] = i;
  }
  _forEach(fn, store, rawIndexes, [], 0);
}

function _forEach(fn, store, indexes, values, i) {
  if (i >= indexes.length) {
    values[0] = null;
    values[0] = store;
    return fn.apply(null, values);
  }
  var nextI = i + 1;
  var valueIndex = indexes[i] + 1;
  for (var v in store) {
    if (store.hasOwnProperty(v)) {
      values[valueIndex] = v;
      _forEach(fn, store[v], indexes, values, nextI);
    }
  }
}
