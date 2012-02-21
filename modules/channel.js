var http = require('http');
var url = require('url');
require('../lib/engine/ace-core.js').addModule("channel", function(sandbox){
	var channels = {};
	function createChannel(id, passport){
		var now = +new Date;
		var channel = {
			id: id,
			title: id,
			/**
			 * 创建时间
			 */
			createTime: now,
			/**
			 * 创建者
			 */
			creator: passport.id,
			/**
			 * 访问时间
			 */
			accessTime: now,
			/**
			 * 修改时间
			 */
			modifyTime: now,
			/*
			 * 用户列表
			 */
			players: []
		};
		saveChannel(channel);
		channels[channel.id] = channel;
		return channel;
	}
	function saveChannel(channel){
		sandbox.fire('storage-save', {
			table: 'channel',
			key: channel.id || '@',
			value: channel
		});
	}
	function loadChannel(id, callback){
		var channel = channels[id];
		if (channel){
			callback('', channel);
			channel.accessTime = +new Date;
		} else {
			sandbox.fire('storage-load', {
				table: 'channel',
				key: id || '@',
				callback: function(err, value){
					value && (channels[value.id] = value);
					callback(err, value);
				}
			});
		}
	}
	
	function doResponse(response, callback, data){
		response.writeHead(200, {'Content-Type': 'text/javascript'});
		var json = JSON.stringify(data);
		if (callback){
			response.end(util.format('%s(%s);', callback, json));
		} else {
			response.end(json);
		}
	}

	function doRequest(data){
		var request = data.request;
		var response = data.response;

		var uri = url.parse(request.url, true);
		var query = uri.query;
		if (query.callback && /[^\w_$]/.test(query.callback)){ // 错误的callback参数
			response.end("\/\* callback is invalid. \*\/");
			return;
		}
		query.channel = query.channel || 'home';
		if (query.channel && !(/^[\w_-]{1,50}$/.test(query.channel))){ // 错误的channel参数
			doResponse(response, query.callback, { err: 'channel is invalid.' });
			return;
		}

		sandbox.fire('getPassport', {
			request: request,
			response: response,
			passports: [],
			callback: function(err, passport){
				if (err){
					doResponse(response, query.callback, { err: err });
					return;
				}
				if (!passport) {
					doResponse(response, query.callback, { err: 'passport is invalid.' });
					return;
				}
				var channel = channels[query.channel];
				if (channel){
					doResponse(response, query.callback, { 
						uid: passport.id,
						cid: channel.id,
						cname: channel.title,
					});
				} else {
					loadChannel(query.channel, function(err, channel){
						if (err || !channel){
							channel = createChannel(query.channel, passport);
						}
						doResponse(response, query.callback, { 
							uid: passport.id,
							cid: channel.id,
							cname: channel.title,
						});
					});
				}
			}
		});

		/*
		switch (uri.pathname){
			case '/command':
				channel && channel.command(query, req, res);
				break;
			case '/pick':
				channel && channel.pick(query, req, res);
				break;
			default:
				response.writeHead(200, {'Content-Type': 'text/javascript'});
				response.end("\/\* pathname is invalid. \*\/");
				break;
		}
		*/
	}

	return {
		init: function(){
			sandbox.on('request', doRequest);
		}
	}
});