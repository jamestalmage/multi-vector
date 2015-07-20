'use strict';

module.exports = lastContainedIndex;

function lastContainedIndex(maxIndex, indexesArray) {
  while (indexesArray.indexOf(maxIndex) === -1) {
    maxIndex--;
  }
  return maxIndex;
}
