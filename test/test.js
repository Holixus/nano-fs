"use strict";

var assert = require('core-assert'),
    json = require('nano-json'),
    timer = require('nano-timer'),
    Promise = require('nano-promise'),
    Path = require('path');

var fs = require('../index.js');


var source_folder = 'test/source/',
    polygon_folder = './polygon/';

var so = Object.create(null);

var join = function _join(self, obj) {
	for (var nm in obj)
		self[nm] = obj[nm];
	return self;
}


suite('nano-fs', function () {

	test('.readTree(dir)', function (done) {
		fs.readTree(source_folder).then(function (tree) {
			assert.deepStrictEqual(tree, {
				a: {
					'file.txt': 'file',
					fileaa: 'bbb'
				},
				'tet.jk': 'te'
				});
			done();
		}).catch(done);;
	});

	test('.listFiles(dir)', function (done) {
		fs.listFiles(source_folder).then(function (list) {
			assert.deepStrictEqual([
					"tet.jk",
					"a/file.txt",
					"a/fileaa"
				], list);
			done();
		}).catch(done);;
	});

	test('.listFiles(dir, re)', function (done) {
		fs.listFiles(source_folder, /^a/).then(function (list) {
			assert.deepStrictEqual([
					"a/file.txt",
					"a/fileaa"
				], list);
			done();
		}).catch(done);;
	});

	var mk_folder = polygon_folder+'one/two/three';

	test('.mkpath(dir)', function (done) {
		fs.mkpath(mk_folder, 511).then(function () {
			fs.stat(mk_folder).then(function (stats) {
				if (stats.isDirectory())
					return done();
				done(Error('not maked!'));
			});
		}).catch(done);
	});

	test('.mkpath(".")', function (done) {
		fs.mkpath('.', 511).then(done).catch(done);
	});

	test('.mkpath(dir) exist path', function (done) {
		fs.mkpath(mk_folder, 511).then(function () {
			fs.stat(mk_folder).then(function (stats) {
				if (stats.isDirectory())
					return done();
				done(Error('not maked!'));
			});
		}).catch(done);
	});

	test('.mkpath(dir) several times in parellel', function (done) {
		var rem_folder = polygon_folder+'system/momo';
		    mk_folder = polygon_folder+'system/momo/lol';

		fs.remove(rem_folder)
			.catch(function (err) {
				if (err.code !== 'ENOENT')
					throw err;
			})
			.then(function () {
				return Promise.resolve(
						fs.mkpath(mk_folder),
						fs.mkpath(mk_folder)
					);
			})
			.then(function () {
				fs.stat(mk_folder).then(function (stats) {
					if (stats.isDirectory())
						return fs.remove(rem_folder).then(done);
					done(Error('not maked!'));
				});
			}).catch(done);
	});

	test('.remove() not exist folder', function (done) {
		var dir = 'copy';

		fs.remove(dir).then(function () {
			done(Error('not failed!'));
		}).catch(function (e) {
			assert('ENOENT', e.code);
			done();
		});

	});

	test('.remove() exist folder', function (done) {
		var dir = polygon_folder+'folder';
		fs.mkpath(dir).then(function () {
			return fs.remove(dir).then(function () {
				fs.stat(dir).then(function (stats) {
					done(Error('not removed!'));
				}, function (e) {
					assert.strictEqual('ENOENT', e.code);
					done();
				});
			});
		}).catch(done);;
	});

	test('.copy()', function (done) {
		var dir = 'README.md',
		    dest_dir = polygon_folder+'copy/c/',
		    to  = dest_dir+'copy.js';

		fs.copy(dir, to).then(function () {
			return fs.listFiles(dest_dir).then(function (list) {
				assert.deepStrictEqual([
						"copy.js"
					], list);
				done();
			});
		}).catch(done);
	});

	test('.mkpath(dir) over existing file', function (done) {
		var dir = polygon_folder+'copy/c/copy.js';
		fs.mkpath(dir).then(function () {
			done(Error('not failed!'));
		}).catch(function (e) {
			assert.strictEqual(e.code, 'ENOTDIR');
			done();
		}).catch(done);
	});

	test('.mkpath(dir) not permitted', function (done) {
		var dir = '/sbin/o';
		fs.mkpath(dir).then(function () {
			done(Error('not failed!'));
		}).catch(function (e) {
			assert.strictEqual(e.code, 'EACCES');
			done();
		}).catch(done);
	});

	test('.empty() not a folder', function (done) {
		var dir = polygon_folder+'copy/c/copy.js';

		fs.empty(dir).then(function () {
			done(Error('not failed!'));
		}).catch(function (e) {
			assert.strictEqual('ENOTDIR', e.code);
			done();
		}).catch(done);;
	});

	test('.empty()', function (done) {
		var dir = polygon_folder;

		fs.empty(dir).then(function () {
			return fs.readdir(dir).then(function (list) {
				assert.strictEqual(0, list.length);
				done();
			});
		}).catch(done);
	});

	test('.writeTree(dir, o)', function (done) {
		var dir_a = polygon_folder,
		    tree_a = {
		    	file: 'aa',
		    	empty: {},
		    	dir1: {
		    		file: 'bb'
		    	},
		    	dir2: {
		    		file1: 'bb',
		    		file2: 'cc'
		    	}
		    },
		    dir_b = Path.join(dir_a, 'empty/file'),
		    tree_b = 'aa',
		    tree = {
		    	file: 'aa',
		    	empty: {
		    		file: 'aa'
		    	},
		    	dir1: {
		    		file: 'bb'
		    	},
		    	dir2: {
		    		file1: 'bb',
		    		file2: 'cc'
		    	}
		    };

		fs.empty(dir_a).then(function () {
			return fs.writeTree(dir_a, tree_a);
		}).then(function () {
			return fs.writeTree(dir_b, tree_b);
		}).then(function () {
			return fs.readTree(dir_a)
		}).then(function (t) {
			assert.deepStrictEqual(t, tree);
			return fs.empty(dir_a);
		}).then(function () {
			done();
		})
		.catch(done);
	});
});
