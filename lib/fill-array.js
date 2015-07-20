'use strict';

module.exports = fillArray;

function fillArray(len) {
  var arr = new Array(len);
  for (var i = 0; i < len; i++) {
    arr[i] = i;
  }
  return arr;
}
