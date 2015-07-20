'use strict';

var assert = require('assert');
var storeProto = require('./make-store').storeProto;

function validateVectorsArray(array, defaultArray) {
  if (array) {
    array.forEach(validateVector);
    return array;
  }
  return defaultArray;
}

function validateVector(vector) {
  assert.strictEqual('string', typeof vector, vector);
  assert(!(vector in storeProto), vector, 'bad vector name');
  return vector;
}

function validateVectorObject(vectorObject, vectors) {
  for (var i = 0, len = vectors.length; i < len; ++i) {
    var requiredVector = vectors[i];
    var foundType = typeof vectorObject[requiredVector];
    if ('string' !== foundType && 'number' !== foundType) {
      assert.fail(
        foundType,
        'string|number',
        'vectorObject does not have a string/number value for ' +
        requiredVector
      );
    }
  }
  return vectorObject;
}

module.exports = {
  vectorsArray: validateVectorsArray,
  vector: validateVector,
  vectorObject: validateVectorObject
};
