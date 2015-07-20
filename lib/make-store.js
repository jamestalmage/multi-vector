'use strict';

module.exports = makeStore;

var storeProto = makeStore.storeProto = Object.create(null);

var RESERVED_PROPS = makeStore.RESERVED_PROPS =
  ['__proto__', 'hasOwnProperty', 'toString', 'valueOf'];

RESERVED_PROPS.slice(1).forEach(function(reservedProp) {
  storeProto[reservedProp] = Object.prototype[reservedProp];
});

function makeStore() {
  return Object.create(storeProto);
}
