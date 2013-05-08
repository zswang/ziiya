var common = require('../common/channel.common.js');
var playerManager = require('./player.manager.js');

void function(){
	/**
	 * 私信集合
	 */
	var playerLetterList = {};
	var currId = 0;
	
	/**
	 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
	 */
	function LetterPlugin(channel, options){
		this.channel = channel;
		options = options || {};
	}
	
	LetterPlugin.prototype.command = function(fields, passport, query){
		if (!fields || !passport || !query) return;
		switch (query.command) {
			case "viewLetter":
				var playerLetter = playerLetterList[passport.id];
				if (!playerLetter) return;
				playerLetter.lastView = +new Date;
				break;
			case "letter":
				if (!query.text) return;
				if (common.checkLetter(query.text)) return;
				if (query.to == passport.id) return;
				var toPlayer = playerManager.getPlayer(query.to);
				if (!toPlayer) return;
				currId++;
				var message = {
					id: currId,
					to: toPlayer.id,
					toNick: toPlayer.nick,
					from: passport.id,
					nick: passport.nick,
					time: +new Date,
					message: query.text
				};
				var playerLetter = playerLetterList[query.to] = playerLetterList[query.to] || {
					messages: []
				};
				playerLetter.messages.push(message);
				var playerLetter = playerLetterList[passport.id] = playerLetterList[passport.id] || {
					messages: []
				};
				playerLetter.messages.push(message);
				fields.push({
					type: "letterAdd",
					whiteList: [passport.id, query.to],
					messages: [message]
				});
				while (playerLetter.messages.length > this.maxCount){
					playerLetter.messages.shift();
				}
				break;
		}
	};
	
	LetterPlugin.prototype.all = function(fields, passport, query){
		if (!fields || !passport) return;
		var playerLetter = playerLetterList[passport.id];
		if (!playerLetter) return;
		var messages = [];
		common.forEach(playerLetter.messages, function(message) {
			messages.push(message);
		});
		if (!messages) return;
		fields.push({
			type: "letterAll",
			messages: messages,
			lastView: playerLetter.lastView
		});
	};

	/**
	 * 清理已经掉线或离开的用户
	 */
	LetterPlugin.prototype.patrol = function(fields){
	};
	
	exports.create = function(channel, options){
		return new LetterPlugin(channel, options);
	};
}();
