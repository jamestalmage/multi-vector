'use strict';
var assert = require('assert');
var MultiVector = require('../');

describe('multi-vector', function() {
  var mv;
  var calls;

  beforeEach(function() {
    mv = new MultiVector(['a', 'b', 'c']);
    calls = [];
  });

  function logCalls() {
    calls.push(Array.prototype.slice.call(arguments));
  }

  function getSetTest() {
    mv.set({a:'1', b:'2', c:'3'}, 'hello');
    mv.set({a:'1', b:'2', c:'4'}, 'howdy');
    assert.equal('hello', mv.get({a:'1', b:'2', c:'3'}));
    mv.set({a:'1', b:'2', c:'3'}, 'goodbye');
    assert.equal('goodbye', mv.get({a:'1', b:'2', c:'3'}));
    assert.equal('howdy', mv.get({a:'1', b:'2', c:'4'}));
  }

  it('has get & set methods that work as you would expect', getSetTest);

  it('can be constructed with a single array argument', function() {
    mv = new MultiVector(['a', 'b', 'c']);
    getSetTest();
  });

  it('can be constructed with without using new keyword', function() {
    /* jshint newcap:false */
    mv = MultiVector(['a', 'b', 'c']);
    getSetTest();
    mv = MultiVector(['a', 'b', 'c']);
    getSetTest();
    /* jshint newcap:true */
  });

  it('will validate vectorObject input', function() {
    assert.throws(function() {
      mv.get({a:'1'});
    });
    assert.throws(function() {
      mv.get({a:'1', 'b': '2', c:{}});
    });
  });

  it('forEach', function() {
    mv.set({a:'1', b:'2', c:'3'}, 'hello');
    mv.set({a:'1', b:'2', c:'4'}, 'howdy');
    mv.forEach(logCalls);

    assert.deepEqual(
      [
        ['hello', '1', '2', '3'],
        ['howdy', '1', '2', '4']
      ],
      calls
    );

    calls = [];
    mv.set({a:'1', b:'2', c:'3'}, 'goodbye');
    mv.forEach(logCalls);

    assert.deepEqual(
      [
        ['goodbye', '1', '2', '3'],
        ['howdy', '1', '2', '4']
      ],
      calls
    );
  });

  it('forEach with custom parameter ordering', function() {
    mv.set({a:'1', b:'2', c:'3'}, 'hello');
    mv.set({a:'1', b:'2', c:'4'}, 'howdy');
    mv.forEach(logCalls, ['c', 'a', 'b']);

    assert.deepEqual(
      [
        ['hello', '3', '1', '2'],
        ['howdy', '4', '1', '2']
      ],
      calls
    );

    calls = [];
    mv.set({a:'1', b:'2', c:'3'}, 'goodbye');
    mv.forEach(logCalls, ['a', 'c', 'b']);

    assert.deepEqual(
      [
        ['goodbye', '1', '3', '2'],
        ['howdy', '1', '4', '2']
      ],
      calls
    );
  });

  it('forEach with less than full args', function() {
    mv.set({a:'1', b:'2', c:'3'}, 'hello');
    mv.set({a:'1', b:'2', c:'4'}, 'howdy');
    mv.forEach(logCalls, ['b', 'a']);

    assert.deepEqual(
      [
        [{'3': 'hello', '4': 'howdy'}, '2', '1']
      ],
      calls
    );

    calls = [];
    mv.forEach(logCalls, ['c']);

    assert.deepEqual(
      [
        [{'1': {'2': 'hello'}}, '3'],
        [{'1': {'2': 'howdy'}}, '4']
      ],
      calls
    );
  });

  it('export', function() {
    mv.set({a:'1', b:'2', c:'3'}, 'hello');
    mv.set({a:'1', b:'2', c:'4'}, 'howdy');

    assert.deepEqual(
      {
        '1': {
          '2': {
            '3': 'hello',
            '4': 'howdy'
          }
        }
      },
      mv.export()
    );

    mv.set({a:'1', b:'2', c:'3'}, 'goodbye');

    assert.deepEqual(
      {
        '1': {
          '2': {
            '3': 'goodbye',
            '4': 'howdy'
          }
        }
      },
      mv.export()
    );
  });

  it('export with custom parameter ordering', function() {
    mv.set({a:'1', b:'2', c:'3'}, 'hello');
    mv.set({a:'1', b:'2', c:'4'}, 'howdy');

    assert.deepEqual(
      {
        '2': {
          '1': {
            '3': 'hello',
            '4': 'howdy'
          }
        }
      },
      mv.export(['b', 'a', 'c'])
    );

    mv.set({a:'1', b:'2', c:'3'}, 'goodbye');

    assert.deepEqual(
      {
        '3': {
          '1': {
            '2': 'goodbye'
          }
        },
        '4': {
          '1': {
            '2': 'howdy'
          }
        }
      },
      mv.export(['c', 'a', 'b'])
    );
  });

  it('export with less than full parameter list', function() {
    mv.set({a:'1', b:'2', c:'3'}, 'hello');
    mv.set({a:'1', b:'2', c:'4'}, 'howdy');

    assert.deepEqual(
      {
        '2': {
          '3': {
            '1': 'hello'
          },
          '4': {
            '1': 'howdy'
          }
        }
      },
      mv.export(['b', 'c'])
    );

    assert.deepEqual(
      {
        '2': {
          '1': {
            '3': 'hello',
            '4': 'howdy'
          }
        }
      },
      mv.export(['b'])
    );

    assert.strictEqual(
      mv._store[1][2],
      mv.export(['b'])[2][1],
      'inner object does not get copied'
    );
  });
});
