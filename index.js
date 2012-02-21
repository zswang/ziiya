require('./modules/channel.js');
require('./modules/mongo-storage.js');
require('./modules/passport.js');
//require('./modules/passport.js');
//require('./modules/player.js');
var ace = require('./lib/engine/ace-core.js');
ace.addModule("index", function(sandbox){
	return {
		init: function(){
			require('http').createServer(function(request, response){
				sandbox.fire('request', {
					request: request, 
					response: response
				});
			}).listen(process.argv[2] || 80);
		}
	}
});
ace.start();