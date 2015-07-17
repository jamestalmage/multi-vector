# multi-vector 

easily iterate and restructure deeply nested trees

[![Build Status](https://travis-ci.org/jamestalmage/multi-vector.svg?branch=master)](https://travis-ci.org/jamestalmage/multi-vector)
[![Coverage Status](https://coveralls.io/repos/jamestalmage/multi-vector/badge.svg?branch=master&service=github)](https://coveralls.io/github/jamestalmage/multi-vector?branch=master)
[![Code Climate](https://codeclimate.com/github/jamestalmage/multi-vector/badges/gpa.svg)](https://codeclimate.com/github/jamestalmage/multi-vector)
[![Dependency Status](https://david-dm.org/jamestalmage/multi-vector.svg)](https://david-dm.org/jamestalmage/multi-vector)
[![devDependency Status](https://david-dm.org/jamestalmage/multi-vector/dev-status.svg)](https://david-dm.org/jamestalmage/multi-vector#info=devDependencies)

[![NPM](https://nodei.co/npm/multi-vector.png)](https://nodei.co/npm/multi-vector/)

## Usage

```js
var MultiVector = require('multi-vector');

var mv = new MultiVector('a', 'b', 'c'); // list the index names

mv.set({a: 'foo', b: 2, c: 3}, 'hello');
mv.set({a: 'foo', b: 2, c: 4}, 'howdy');

mv.get({a: 'foo', b: 2, c: 3});
//=> 'hello'

function logArgs() {
  console.log(Array.prototoype.join.call(arguments, ','));
}

// Iterate the trees 
mv.forEach(logArgs);   
// 'hello', 'foo', 2, 3
// 'howdy', 'foo', 2, 4

mv.forEach(logArgs, ['c', 'a', 'b']);   // custom ordering of callback arguments 
// 'hello', 3, 'foo', 2
// 'howdy', 4, 'foo', 2

mv.export();
/*{
  'foo': {
    '2': {
      '3': 'hello',
      '4': 'howdy'
    }
  }
}*/

mv.export(['c', 'a', 'b']);  // reshape or pivot the exported data
/*{
  '3': {
    'foo': {
      '2': 'hello'
    }
  },
  '4': {
    'foo': {
      '2': 'howdy'
    }
  }
}*/

```

## License

MIT © [James Talmage](http://github.com/jamestalmage)
