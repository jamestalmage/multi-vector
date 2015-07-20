'use strict';
var assert = require('assert');

testDecl('raw', require('../lib/for-each-raw'));
testDecl('generated', require('../lib/for-each-generator'));

function testDecl(desc, _forEachImplementation) {
  var MultiVector = require('../lib/multi-vector')(_forEachImplementation);

  describe('multi-vector (' + desc + ')', function() {
    var mv;
    var mv2;
    var calls;

    function setup() {
      mv.set({a:'1', b:'2', c:'3'}, 'hello');
      mv.set({a:'1', b:'2', c:'4'}, 'howdy');

      var arr = [1, 2, 3, 4];

      arr.forEach(function(a) {
        arr.forEach(function(b) {
          arr.forEach(function(c) {
            arr.forEach(function(d) {
              mv2.set(
                {a:a, b:b, c:c, d:d},
                'a' + a + 'b' + b + 'c' + c + 'd' + d
              );
            });
          });
        });
      });

      calls = [];
    }

    beforeEach(function() {
      mv = new MultiVector(['a', 'b', 'c']);
      mv2 = new MultiVector(['a', 'b', 'c', 'd']);
      setup();
    });

    function logCalls() {
      calls.push(Array.prototype.slice.call(arguments));
    }

    logCalls.reset = function() {
      calls = [];
      return logCalls;
    };

    function getSetTest() {
      assert.equal('hello', mv.get({a:'1', b:'2', c:'3'}));
      mv.set({a:'1', b:'2', c:'3'}, 'goodbye');
      assert.equal('goodbye', mv.get({a:'1', b:'2', c:'3'}));
      assert.equal('howdy', mv.get({a:'1', b:'2', c:'4'}));

      assert.equal('a1b2c3d4', mv2.get({a:1, b:2, c:3, d:4}));
      assert.equal('a2b2c3d2', mv2.get({a:2, b:2, c:3, d:2}));
    }

    it('has get & set methods that work as you would expect', getSetTest);

    it('can be constructed with without using new keyword', function() {
      /* jshint newcap:false */
      mv = MultiVector(['a', 'b', 'c']);
      mv2 = MultiVector(['a', 'b', 'c', 'd']);
      setup();
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

      assert.deepEqual(
        mv2.sub({a:1, b:1, c:1}, ['a', 'b', 'c']),
        {
          '1': 'a1b1c1d1',
          '2': 'a1b1c1d2',
          '3': 'a1b1c1d3',
          '4': 'a1b1c1d4'
        }
      );

      assert.deepEqual(
        mv2.sub({a:1, b:2}, ['a', 'b']),
        [1, 2, 3, 4].reduce(function(obj, c) {
          obj[c] = [1, 2, 3, 4].reduce(function(obj, d) {
            obj[d] = 'a1b2c' + c + 'd' + d;
            return obj;
          }, {});
          return obj;
        }, {})
      );
    });

    it('#sub allows you to reorganize the fetched tree - in order', function() {
      assert.deepEqual(
        {'3': {'2': 'hello'}, '4': {'2': 'howdy'}},
        mv.sub({a:'1'}, ['a'], ['c', 'b'])
      );

      assert.deepEqual(
        mv2.sub({a:3, b:3}, ['a', 'b'], ['d', 'c']),
        [1, 2, 3, 4].reduce(function(obj, d) {
          obj[d] = [1, 2, 3, 4].reduce(function(obj, c) {
            obj[c] = 'a3b3c' + c + 'd' + d;
            return obj;
          }, {});
          return obj;
        }, {})
      );
    });

    it('#sub allows you to reorganize the fetched tree - out of order', function() {
      assert.deepEqual(
        {'3': {'1': 'hello'}, '4': {'1': 'howdy'}},
        mv.sub({b:'2'}, ['b'], ['c', 'a'])
      );

      assert.deepEqual(
        mv2.sub({c:2, b:1}, ['c', 'b'], ['d', 'a']),
        [1, 2, 3, 4].reduce(function(obj, d) {
          obj[d] = [1, 2, 3, 4].reduce(function(obj, a) {
            obj[a] = 'a' + a + 'b1c2d' + d;
            return obj;
          }, {});
          return obj;
        }, {})
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
        calls,
        [
          ['hello', '3', '1', '2'],
          ['howdy', '4', '1', '2']
        ]
      );

      calls = [];
      mv.set({a:'1', b:'2', c:'3'}, 'goodbye');
      mv.forEach(logCalls, ['a', 'c', 'b']);

      assert.deepEqual(
        calls,
        [
          ['goodbye', '1', '3', '2'],
          ['howdy', '1', '4', '2']
        ]
      );
    });

    it('forEach with less than full args', function() {
      mv.forEach(logCalls, ['b', 'a']);

      assert.deepEqual(
        calls,
        [
          [{'3': 'hello', '4': 'howdy'}, '2', '1']
        ]
      );

      calls = [];
      mv.forEach(logCalls, ['c']);

      assert.deepEqual(
        calls,
        [
          [{'1': {'2': 'hello'}}, '3'],
          [{'1': {'2': 'howdy'}}, '4']
        ]
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
        mv.export(['b', 'c']),
        {
          '2': {
            '3': {
              '1': 'hello'
            },
            '4': {
              '1': 'howdy'
            }
          }
        }
      );

      assert.deepEqual(
        mv.export(['b']),
        {
          '2': {
            '1': {
              '3': 'hello',
              '4': 'howdy'
            }
          }
        }
      );

      assert.strictEqual(
        mv.export(['b'])[2][1],
        mv._store[1][2],
        'inner object should be same instance'
      );
    });
  });
}
