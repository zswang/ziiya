require('../lib/engine/ace-core.js').addModule("net-storage", function(sandbox){
	function save(data){
		var table = data.table;
		var key = data.key;
		var value = data.value;
		/* TODO : save */
	}
	function load(data){
		var table = data.table;
		var key = data.key;
		var values = data.values;
		/* TODO : load */
	}
	return {
		init: function(){
			sandbox.on('storage-save', save);
			sandbox.on('storage-load', load);
		}
	}
});