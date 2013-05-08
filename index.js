/**
 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
 */
var http = require('http');
var event = require('./service/event');

require('./service/channel.manager.js');
require('./service/player.manager.js');
require('./service/chat.plugin.js');
require('./service/weibo.plugin.js');
require('./service/player.plugin.js');
require('./service/letter.plugin.js');
require('./service/vote.plugin.js');
require('./service/mongo-storage');

http.createServer(function(request, response){
    event.emit('request', request, response);
}).listen(process.argv[2] || 80);