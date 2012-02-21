var fs = require('fs');
var path = require('path');
require('../lib/engine/ace-core.js').addModule("file-storage", function(sandbox){
	var root = 'storage';
	function save(data){
		var table = data.table;
		var key = data.key;
		var value = data.value;

		/* DONE : save */
		var dir = root;
		if (!path.existsSync(dir)){
			fs.mkdirSync(dir, 0777);
			sandbox.log(['mk', dir]);
		}
		var dir = path.join(dir, table);
		if (!path.existsSync(dir)){
			fs.mkdirSync(dir, 0777);
			sandbox.log(['mk', dir]);
		}
		fs.writeFile(path.join(dir, key), JSON.stringify(value));
	}
	function load(data){
		var table = data.table;
		var key = data.key;
		var filename = path.join(root, table, key);
		var callback = data.callback;
		if (!callback) return;
		if (!path.existsSync(filename)){
			sandbox.log(['file not found.', filename]);
			callback('file not found.');
			return;
		}
		/* DONE : load */
		fs.readFile(filename, function(err, data){
			if (err){
				callback(err);
				sandbox.log(err);
				return;
			}
			callback(err, data && JSON.parse(data));
			sandbox.log([filename, '' + data]);
		});
	}
	return {
		init: function(){
			sandbox.on('storage-save', save);
			sandbox.on('storage-load', load);
		}
	}
});