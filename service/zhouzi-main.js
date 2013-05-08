/**
 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
 */
var http = require('http');
var url = require('url');
var channelManager = require('./channel.manager.js');
var playerManager = require('./player.manager.js');
var chatPlugin = require('./chat.plugin.js');
var playerPlugin = require('./player.plugin.js');
var letterPlugin = require('./letter.plugin.js');
var zhouziPlugin = require('./zhouzi.plugin.js');

http.createServer(function(req, res){
	var reqUrl = url.parse(req.url, true);
	var query = reqUrl.query;
	if (/[^\w_$]/.test(query.callback)) { // 错误的callback参数
		res.writeHead(200, {
			'Content-Type': 'text/html'
		});
		res.end("/* callback is invalid. */");
		return;
	}
	switch (reqUrl.pathname) {
		case "/passport":
			playerManager.getPassport(req, res);
			res.end('Completed.');
			return;
		case "/hello":
			res.writeHead(200, {
				'Content-Type': 'text/javascript'
			});
			var json = {
				result: 'error'
			};
			var passport = playerManager.getPassport(req, res, true);
			if (passport){
				json = {
					result: 'ok',
					passport: {
						id: passport.id
					}
				};
			}
			res.end([query.callback || '', "(", JSON.stringify(json), ");"].join(""));
			return;
	}
	var channel = channelManager.getChannel(query.channel, {
		chat: {
			create: chatPlugin.create,
			options: {
				maxCount: 20
			}
		},
		player: {
			create: playerPlugin.create,
			options: {
				maxCount: 1000
			}
		},
		letter: {
			create: letterPlugin.create,
			options: {
				maxCount: 20
			}
			
		},
		zhouzi: {
			create: zhouziPlugin.create,
			options: {
				colCount: 9,
				rowCount: 9
			}
		}
	});
	switch (reqUrl.pathname) {
		case "/command":
			channel && channel.command(query, req, res);
			break;
		case "/pick":
			channel && channel.pick(query, req, res);
			break;
	}
	
}).listen(process.argv[2] || "80");