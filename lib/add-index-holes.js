'use strict';

module.exports = addIndexHoles;

var lastContainedIndex = require('./last-contained-index');

function addIndexHoles(maxIndex, indexesArray, target) {
  var last = lastContainedIndex(maxIndex, indexesArray);
  _addIndexHoles(last, indexesArray, target);
}

function _addIndexHoles(last, indexesArray, target) {
  target = target || indexesArray;
  for (var i = 0; i < last; i++) {
    if (indexesArray.indexOf(i) === -1) {
      target.push(i);
    }
  }
}
