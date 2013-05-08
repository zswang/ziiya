/**
 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
 */
var http = require('http');
var event = require('./event');

require('./channel.manager.js');
require('./player.manager.js');
require('./chat.plugin.js');
require('./weibo.plugin.js');
require('./player.plugin.js');
require('./letter.plugin.js');
require('./vote.plugin.js');
require('./file-storage');

http.createServer(function(request, response){
    event.emit('request', request, response);
}).listen(process.argv[2] || "80");