var mongo = require('mongoskin');
require('../lib/engine/ace-core.js').addModule("mongo-storage", function(sandbox){
	var db = mongo.db('CJNcsThKoZKh:oFbE8nuAgo@127.0.0.1:20088/YiFnSjkcaqlZ');
	function save(data){
		var table = data.table;
		var key = data.key;
		var value = data.value;
		/* TODO : save */
		db.bind(table);
		sandbox.log(['save', table, key]);
		db[table].save({ _id: key, value: value });
	}
	function load(data){
		var table = data.table;
		var key = data.key;
		var callback = data.callback;
		if (!callback) return;
		/* TODO : load */
		sandbox.log(['load', key]);
		db.bind(table);
		db[table].findOne({ _id: key }, function(err, data){
			sandbox.log(['findOne', JSON.stringify(data)]);
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