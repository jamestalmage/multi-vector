'use strict';
module.exports = MultiVector;

var assert = require('assert');

function MultiVector(vectors) {
  if (!(this instanceof MultiVector)) {
    return new MultiVector(vectors);
  }

  this._store = makeStore();
  this._vectorIndex = makeStore();
  this._forEachFns = makeStore();
  this._vectors = vectors.map(function(vector, index) {
    validateVector(vector);
    this._vectorIndex[vector] = index;
    return vector;
  }, this);
}

var mvp = MultiVector.prototype;

mvp.get = function get(vectorObj) {
  this.validateVectorObject(vectorObj);
  var vectors = this._vectors;
  var store = this._store;

  for (var i = 0, len = vectors.length; store && i < len; ++i) {
    store = store[vectorObj[vectors[i]]];
  }
  return store;
};

mvp.set = function set(vectorObj, value) {
  this.validateVectorObject(vectorObj);
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
  vectors = validateVectorsArray(vectors, this._vectors);

  var indexes = vectors.map(indexMap, this);
  addIndexHoles(this._vectors.length-1, indexes);
  var copy = makeStore();
  _forEach(_export.bind(copy), indexes, this._forEachFns, this._store);
  return copy;
};

function _export(value){
  var store = this;   // jshint ignore:line
  for (var i = 1; i + 1 < arguments.length; i++) {
    var vector = arguments[i];
    store = store[vector] || (store[vector] = makeStore());
  }
  store[arguments[arguments.length-1]] = value;
}

mvp.forEach = function(fn, vectors) {
  assert.equal('function', typeof fn);
  vectors = validateVectorsArray(vectors, this._vectors);

  var indexes = vectors.map(indexMap, this);

  var store = this._store;
  var holes = [];
  addIndexHoles(this._vectors.length-1, indexes, holes);
  if (holes.length) {
    var copy = makeStore();
    _forEach(_export.bind(copy), indexes.concat(holes), this._forEachFns, store);
    store = copy;
    indexes = fillArray(indexes.length);
  }

  _forEach(fn, indexes, this._forEachFns, store);
};

function _forEach(fn, indexes, fnStore, store) {
  var fnKey = indexes.join(',');

  /* jshint evil:true */
  var fe = fnStore[fnKey] ||
    (fnStore[fnKey] = new Function('fn', 'store', generateForEachCode(indexes)));
  /* jshint evil:false */

  fe(fn, store);
}

function indexMap(vector) {
  return this._vectorIndex[vector];   //jshint ignore: line
}

function validateVectorsArray(array, defaultArray) {
  if (array) {
    array.forEach(validateVector);
    return array;
  }
  return defaultArray;
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
  return i === 0 ? 'store' : 's' + (i-1) + '[v' + (i-1) + ']';
}

mvp.validateVectorObject = function validateVectorObject(vectorObject, argName) {
  var vectors = this._vectors;
  for (var i = 0, len = vectors.length; i < len; ++i) {
    var requiredVector = vectors[i];
    var foundType = typeof vectorObject[requiredVector];
    if ('string' !== foundType && 'number' !== foundType) {
      assert.fail(
        foundType,
        'string|number',
        (argName || 'vectorObject') + ' does not have a string/number value for ' + requiredVector
      );
    }
  }
};

function validateVector(vector) {
  assert.strictEqual('string', typeof vector, vector);
  RESERVED_PROPS.forEach(function(reservedProp) {
    assert.notEqual(reservedProp, vector);
  });
  return vector;
}

function makeStore() {
  return Object.create(storeProto);
}

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

function lastContainedIndex(maxIndex, indexesArray) {
  while(indexesArray.indexOf(maxIndex) === -1) {
    maxIndex --;
  }
  return maxIndex;
}

function fillArray(len) {
  var arr = new Array(len);
  for (var i = 0; i < len; i ++) {
    arr[i] = i;
  }
  return arr;
}

var storeProto = Object.create(null);
var RESERVED_PROPS = ['__proto__', 'hasOwnProperty', 'toString', 'valueOf'];
RESERVED_PROPS.slice(1).forEach(function(reservedProp) {
  storeProto[reservedProp] = Object.prototype[reservedProp];
});
