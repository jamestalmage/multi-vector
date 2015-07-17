'use strict';
module.exports = MultiVector;

var assert = require('assert');

function MultiVector(vectors) {
  if (arguments.length > 1) {
    vectors = Array.prototype.slice.call(arguments);
  }
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
  vectors = this._normalizeArgs(arguments, 0);
  var copy = makeStore();
  this.forEach(_export.bind(copy), vectors);
  return copy;
};

function _export(value){
  var store = this;
  for (var i = 1; i + 1 < arguments.length; i++) {
    var vector = arguments[i];
    store = store[vector] || (store[vector] = makeStore());
  }
  store[arguments[arguments.length-1]] = value;
}

mvp.forEach = function(fn, vectors) {
  assert.equal('function', typeof fn);
  vectors = this._normalizeArgs(arguments, 1);

  var indexes = vectors.map(function(vector) {
    return this._vectorIndex[vector];
  }, this);

  var fnKey = indexes.join(',');

  /* jshint evil:true */
  var fe = this._forEachFns[fnKey] ||
    (this._forEachFns[fnKey] = new Function('fn', generateForEachCode(indexes)));
  /* jshint evil:false */

  fe.call(this, fn);
};

mvp._normalizeArgs = function(args, i) {
  var vectors;
  if (args.length > i + 1) {
    vectors = Array.prototype.slice.call(args, i);
  } else if (!args[i] || args[i] === this._vectors) {
    return this._vectors;
  } else {
    vectors = args[i];
  }
  vectors.forEach(validateVector);
  return vectors;
};

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
  return i === 0 ? 'this._store' : 's' + (i-1) + '[v' + (i-1) + ']';
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

var storeProto = Object.create(null);
var RESERVED_PROPS = ['__proto__', 'hasOwnProperty', 'toString', 'valueOf'];
RESERVED_PROPS.slice(1).forEach(function(reservedProp) {
  storeProto[reservedProp] = Object.prototype[reservedProp];
});
