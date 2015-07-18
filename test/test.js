'use strict';
var assert = require('assert');
var MultiVector = require('../');

describe('multi-vector', function() {
  var mv;
  var calls;

  beforeEach(function() {
    mv = new MultiVector(['a', 'b', 'c']);
    mv.set({a:'1', b:'2', c:'3'}, 'hello');
    mv.set({a:'1', b:'2', c:'4'}, 'howdy');
    calls = [];
  });

  function logCalls() {
    calls.push(Array.prototype.slice.call(arguments));
  }

  function getSetTest() {
    assert.equal('hello', mv.get({a:'1', b:'2', c:'3'}));
    mv.set({a:'1', b:'2', c:'3'}, 'goodbye');
    assert.equal('goodbye', mv.get({a:'1', b:'2', c:'3'}));
    assert.equal('howdy', mv.get({a:'1', b:'2', c:'4'}));
  }

  it('has get & set methods that work as you would expect', getSetTest);

  it('can be constructed with without using new keyword', function() {
    /* jshint newcap:false */
    mv = MultiVector(['a', 'b', 'c']);
    mv.set({a:'1', b:'2', c:'3'}, 'hello');
    mv.set({a:'1', b:'2', c:'4'}, 'howdy');
    getSetTest();
    /* jshint newcap:true */
  });

  it('#sub grabs a subtree', function() {
    assert.deepEqual(
      {'2': {'3': 'hello', '4': 'howdy'}},
      mv.sub({a:'1'}, ['a'])
    );
    assert.deepEqual(
      {'3': 'hello', '4': 'howdy'},
      mv.sub({a:'1', b:'2'}, ['a', 'b'])
    );
  });

  it('#sub allows you to reorganize the fetched tree - in order', function() {
    assert.deepEqual(
      {'3': {'2': 'hello'}, '4': {'2': 'howdy'}},
      mv.sub({a:'1'}, ['a'],['c', 'b'])
    );
  });

  xit('#sub allows you to reorganize the fetched tree - out of order', function() {
    assert.deepEqual(
      {'3': {'1': 'hello'}, '4': {'1': 'howdy'}},
      mv.sub({b:'2'}, ['b'],['c', 'a'])
    );
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
