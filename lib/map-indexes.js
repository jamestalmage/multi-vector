'use strict';

module.exports = mapIndexes;

function mapIndexes(array, map) {
  return array.map(_mapIndexes, map);
}

function _mapIndexes(vector) {
  return this[vector];   //jshint ignore: line
}
