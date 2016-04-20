[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

# nano-fs

Extended native file system library adopted for Promise object.

## Native functions

See https://nodejs.org/dist/latest-v5.x/docs/api/fs.html. All callback functions returns Promise object instead of call `callback` function.

## Additional functions

### listFiles(path[, regexp])

Resolve Promise object with `Array` of all files pathes filtered by optional RegExp.

```js
var fs = require('nano-fs');
fs.listFiles('./source').then(function (list) {
	console.log(list);
});
```
Prints something like
```js
[ "tet.jk", "a/file.txt", "a/fileaa" ]
```

### writeTree(path, object)

Write objects tree to file system tree.

```js
fs.writeTree('./test', {
	folder_a: {
		'file_a.txt': 'content',
		'file_b.txt': 'content'
	},
	folder_b: {
	},
	'file_c.txt': 'content'
});

```

### readTree(path)

Resolve a Promise with objects tree where folders will be objects contains files as strings.

```js
fs.readTree(path).then(function (o) {
	console.log(o);
});
```

### mkpath(path[, mode])

### copy(source_file_name, destination_file_name)

Copy file to another location. If destination path does not exists it will be created by mkpath() call.

### remove(path)

Recursively remove folder. It can remove file too.

### empty(folder_path)

Empty folder. Try it! :)


[bithound-image]: https://www.bithound.io/github/Holixus/nano-fs/badges/score.svg
[bithound-url]: https://www.bithound.io/github/Holixus/nano-fs

[gitter-image]: https://badges.gitter.im/Holixus/nano-fs.svg
[gitter-url]: https://gitter.im/Holixus/nano-fs

[npm-image]: https://badge.fury.io/js/nano-fs.svg
[npm-url]: https://badge.fury.io/js/nano-fs

[github-tag]: http://img.shields.io/github/tag/Holixus/nano-fs.svg
[github-url]: https://github.com/Holixus/nano-fs/tags

[travis-image]: https://travis-ci.org/Holixus/nano-fs.svg?branch=master
[travis-url]: https://travis-ci.org/Holixus/nano-fs

[coveralls-image]: https://coveralls.io/repos/github/Holixus/nano-fs/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/Holixus/nano-fs?branch=master

[david-image]: https://david-dm.org/Holixus/nano-fs.svg
[david-url]: https://david-dm.org/Holixus/nano-fs

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: LICENSE

[downloads-image]: http://img.shields.io/npm/dt/nano-fs.svg
[downloads-url]: https://npmjs.org/package/nano-fs
