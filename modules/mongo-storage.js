var mongo = require('mongoskin');
require('../lib/engine/ace-core.js').addModule("mongo-storage", function(sandbox){
	var db = mongo.db();

	function save(data){
		var table = data.table;
		var key = data.key;
		var value = data.value;
		/* TODO : save */
		db.bind(table);
		db.bind.save({ _id: key, value: value });
	}
	function load(data){
		var table = data.table;
		var key = data.key;
		var callback = data.callback;
		if (!callback) return;
		/* TODO : load */
		db.bind(table);
		db.bind.findOne({ _id: key }, function(err, data){
			callback(err, data && data.value);
		});
	}
	return {
		init: function(){
			sandbox.on('storage-save', save);
			sandbox.on('storage-load', load);
		}
	}
});