"use strict";

var fs = require('nano-promisify')(require('fs')),
    Promise = require('nano-promise'),
    Path = require('path');


function errnoError(errno, syscall, text) {
	var e = new Error(text);
	e.errno = e.code = errno;
	e.syscall = syscall;
	return e
}


function fs_listfiles(folder, re) {
	var files = [];

	function readdir(path) {
		var dir = Path.join(folder, path);
		return fs.readdir(dir).then(function (list) {
			return Promise.all(list.map(function (name) {
				return fs.stat(Path.join(dir, name)).then(function (stats) {
					var lpath = Path.join(path, name);
					if (stats.isFile()) {
						if (!re || re.test(lpath))
							files.push(lpath);
					} else
						/* istanbul ignore else */
						if (stats.isDirectory())
							return readdir(lpath);
				});
			}));
		});
	}

	return readdir('').then(function () {
		return files;
	});
}

function fs_mkpath(path, mode) {
	if (mode === undefined)
		mode = 511; // 0777

	if (path === '.')
		return Promise.resolve();

	return fs.mkdir(path, mode).catch(function (err) {
		switch (err.code) {
		case 'EEXIST':
			return fs.stat(path).then(function (stats) {
				if (!stats.isDirectory())
					throw errnoError("ENOTDIR", 'mkpath', [ path, " isnot a directory"].join(''));;
				return fs.chmod(path, mode);
			});
		case 'ENOENT':
			return fs_mkpath(Path.dirname(path), mode).then(function () {
				return fs.mkdir(path, mode).catch(function (err) {
					/* istanbul ignore if */
					if (err.code !== 'EEXIST')
						throw err;
				});
			});
		}
		throw err;
	});
}

function fs_copy(src, dst) {
	return fs.stat(src).then(function (stats) {
		return fs.mkpath(Path.dirname(dst), 511/*0777*/).then(function () {
			return new Promise(function (res, rej) {
				var sin = fs.createReadStream(src),
				    sout = fs.createWriteStream(dst, { mode: stats.mode });
				sin.pipe(sout);
				sin.on("error", rej);
				sin.on("end", res);
				sout.on("error", rej);
			});
		});
	});
}

function fs_remove(path, done) {
	return fs.lstat(path).then(function (stats) {
		if (stats.isDirectory())
			return fs.readdir(path).then(function (list) {
				return Promise.all(list.map(function (name) {
					return fs_remove(Path.join(path, name));
				})).then(function () {
					return fs.rmdir(path);
				});
			});
		return fs.unlink(path);
	});
}

function fs_empty(path) {
	return fs.lstat(path).then(function (stats) {
		if (stats.isDirectory()) {
			return fs.readdir(path).then(function (list) {
				return Promise.all(list.map(function (name) {
					return fs_remove(Path.join(path, name));
				}));
			});
		}
		throw errnoError("ENOTDIR", 'empty', [ path, " isnot a directory"].join(''));
	});
}

function fs_readtree(root) {
	return fs.lstat(root).then(function (stats) {
		if (stats.isDirectory()) {
			var obj = {};
			return fs.readdir(root).then(function (list) {
				return Promise.all(list.map(function (name) {
					return fs_readtree(Path.join(root, name)).then(function (v) {
						obj[name] = v;
					})
				})).then(function () {
					return obj;
				});
			});
		} else
			return fs.readFile(root, 'utf8');
	});
}

function fs_writetree(root, obj) {
	if (typeof obj !== 'object')
		return fs.writeFile(root, obj, 'utf8');

	return fs.mkpath(root)
		.then(function () {
			return Promise.all(
				Object.keys(obj)
					.map(function (name) {
						return fs_writetree(Path.join(root, name), obj[name]);
					}));
		});
}

module.exports = fs;

fs.copy = fs_copy;
fs.mkpath = fs_mkpath;
fs.listFiles = fs_listfiles;
fs.readTree = fs_readtree;
fs.writeTree = fs_writetree;
fs.remove = fs_remove;
fs.empty = fs_empty;
