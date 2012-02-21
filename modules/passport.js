var querystring = require('querystring');
var acestring = require('../lib/engine/ace-string.js');
var util = require('util');
var path = require('path');
require('../lib/engine/ace-core.js').addModule("passport", function(sandbox){
	var passports = {};
	var passportKey = 20110815;
	var guid = 0;
	function getPlayerMask(id, visa){
		return (passportKey ^ parseInt(visa, 36) ^ parseInt(id, 36)).toString(36);
	}

	function createPassport(request, response, callback){
		sandbox.log('begin createPassport');
		var now = +new Date;
		var url = path.join(request.connection.address().address, request.url);
		var ip = request.connection.remoteAddress;
		var visa = parseInt(Math.random() * 99999999).toString(36);
		var id = [
			(Math.abs(acestring.crc32(url)) % 36).toString(36),
			(Math.abs(acestring.crc32(String(now) + String(visa))) % 36).toString(36),
			(Math.abs(acestring.crc32(ip)) % 36).toString(36),
			(+guid).toString(36)
		].join('');
		sandbox.fire('storage-save', {
			table: 'passport',
			key: '@guid',
			value: guid++
		});
		var mask = getPlayerMask(id, visa);
		var passport = {
			id: id,
			visa: visa,
			nick: id,

			mask: mask,
			/**
			 * 来源url
			 */
			createUrl: url,
			/**
			 * 创建时间
			 */
			createTime: now,
			/**
			 * 创建IP
			 */
			createAddress: ip,
			/**
			 * 访问时间
			 */
			accessTime: now,
			/**
			 * 修改时间
			 */
			modifyTime: now,
			/**
			 * 验证时间，用来判断是否离线
			 */
			passportTime: now,
			/**
			 * 最后发送命令的时间，用来验证是否活跃
			 */
			commandTime: now
		};
		response.setHeader("Set-Cookie", [
			util.format(
				"passport=id=%s&visa=%s&mask=%s; expires=Mon, 31 Dec 2998 16:00:00 GMT; path=/;",
				id, visa, mask
			)
		]);
		savePassport(passport);
		passports[passport.id] = passport;
		callback('', passport);
		sandbox.log('end createPassport');
	}
	function savePassport(passport){
		sandbox.fire('storage-save', {
			table: 'passport',
			key: passport.id,
			value: passport
		});
	}
	function loadPassport(id, callback){
		sandbox.log('begin loadPassport');
		var passport = passports[id]
		if (passport) {
			callback('', passport);
		}
		sandbox.fire('storage-load', {
			table: 'passport',
			key: id,
			callback: function(err, value){
				sandbox.log('begin loadPassport callback');
				!err && value && (passports[value.id] = value);
				callback(err, value);
				sandbox.log('end loadPassport callback');
			}
		});
		sandbox.log('end loadPassport');
	}
	/**
	 * 根据cookie获取用户
	 */
	function getPassport(data){
		var request = data.request;
		var response = data.response;
		var callback = data.callback;

		var cookie = request.headers['cookie'] || "";
		var m = cookie.match(/\bpassport=([^;]+)/);
		var passport = m && querystring.parse(m[1]);
		var player = passports[passport.id];
		if (player && player.visa == passport.visa &&
			player.mask == getPlayerMask(passport.id, passport.visa)){
			player.passportTime = +new Date;
			callback('', player);
		} else {
			if (passport.id){
				loadPassport(passport.id, function(err, passport){
					if (err){
						sandbox.log(['getPassport error.', err]);
						createPassport(request, response, callback);
					} else {
						sandbox.log(['getPassport success.', JSON.stringify(passport)]);
						callback('', passport);
					}
				});
			} else{
				createPassport(request, response, callback);
			}
		}
	}
	/**
	 * 获取用户信息
	 */
	function getPlayer(data){
		var id = data.id;
		var player = loadPassport(id);
		if (!player) return;
		var players = data.players;
		player.accessTime = new Date;
		players.push(player);
	}
	return {
		init: function(){
			sandbox.fire('storage-load', {
				table: 'passport',
				key: '@guid',
				callback: function(err, value){
					if (!err) guid = +value;
				}
			});

			sandbox.on('getPassport', getPassport);
			sandbox.on('getPlayer', getPlayer);
		}
	}
});