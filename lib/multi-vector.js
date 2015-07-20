'use strict';
module.exports = function(_forEach) {

  var assert = require('assert');
  var makeStore = require('./make-store');
  var validate = require('./validate');
  var mapIndexes = require('./map-indexes');
  var addIndexHoles = require('./add-index-holes');
  var fillArray = require('./fill-array');

  function MultiVector(vectors) {
    if (!(this instanceof MultiVector)) {
      return new MultiVector(vectors);
    }

    this._store = makeStore();
    this._vectorIndex = makeStore();
    this._vectors = vectors.map(function(vector, index) {
      validate.vector(vector);
      this._vectorIndex[vector] = index;
      return vector;
    }, this);
  }

  var mvp = MultiVector.prototype;

  mvp.get = function get(vectorObj) {
    return _get(
      validate.vectorObject(vectorObj, this._vectors),
      this._vectors,
      0,
      this._vectors.length,
      this._store
    );
  };

  mvp.sub = function sub(vectorObj, filterVectors, structure) {
    var filterIndexes = mapIndexes(filterVectors, this._vectorIndex);
    var straightGet = 0;
    while (filterIndexes.indexOf(straightGet) !== -1) {
      straightGet++;
    }
    var store = _get(vectorObj, filterVectors, 0, straightGet, this._store);
    var indexes = filterIndexes;
    if (structure && structure.length) {
      indexes = filterIndexes.concat(mapIndexes(structure, this._vectorIndex));
    }
    if (straightGet < indexes.length) {
      addIndexHoles(this._vectors.length - 1, indexes);
      indexes = indexes.slice(straightGet)
        .map(function(x) {
          return x - straightGet;
        });
      var copy = makeStore();
      _forEach(_export.bind(copy), indexes, store);
      store = copy;
    }
    return _get(
      vectorObj, filterVectors, straightGet, filterVectors.length, store
    );
  };

  function _get(vectorObj, vectors, start, len, store) {
    for (var i = start; store && i < len; ++i) {
      store = store[vectorObj[vectors[i]]];
    }
    return store;
  }

  mvp.set = function set(vectorObj, value) {
    validate.vectorObject(vectorObj, this._vectors);
    var vectors = this._vectors;
    var store = this._store;
    var len = vectors.length - 1;

    for (var i = 0; i < len; ++i) {
      var vector = vectorObj[vectors[i]];
      store = store[vector] || (store[vector] = makeStore());
    }

    return (store[vectorObj[vectors[len]]] = value);
  };

  mvp.export = function exportFn(vectors) {
    vectors = validate.vectorsArray(vectors, this._vectors);

    var indexes = mapIndexes(vectors, this._vectorIndex);
    addIndexHoles(this._vectors.length - 1, indexes);
    var copy = makeStore();
    _forEach(_export.bind(copy), indexes, this._store);
    return copy;
  };

  function _export(value) {
    var store = this;   // jshint ignore:line
    for (var i = 1; i + 1 < arguments.length; i++) {
      var vector = arguments[i];
      store = store[vector] || (store[vector] = makeStore());
    }
    store[arguments[arguments.length - 1]] = value;
  }

  mvp.forEach = function(fn, vectors) {
    assert.equal('function', typeof fn);
    vectors = validate.vectorsArray(vectors, this._vectors);

    var indexes = mapIndexes(vectors, this._vectorIndex);

    var store = this._store;
    var holes = [];
    addIndexHoles(this._vectors.length - 1, indexes, holes);
    if (holes.length) {
      var copy = makeStore();
      _forEach(_export.bind(copy), indexes.concat(holes), store);
      store = copy;
      indexes = fillArray(indexes.length);
    }

    _forEach(fn, indexes, store);
  };

  return MultiVector;
};
