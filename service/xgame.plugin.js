var common = require('../common/channel.common.js');
var event = require('./event');

void function(){
	/**
	 * 投票插件
	 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
	 */
	function XGamePlugin(channel, options){
		this.channel = channel;
		options = options || {};
		this.maxCount = options.maxCount || 20;
		/**
		 * 投过票的用户
		 */
		this.player = {};
		var votes = ['顶一个', '打酱油', '臭鸡蛋'];
		String(channel.id).replace(/-v([23456])$/, function(all, index){
			votes = {
				2: ['√', '×'],
				3: ['A', 'B', 'C'],
				4: ['A', 'B', 'C', 'D'],
				5: ['A', 'B', 'C', 'D', 'E'],
				6: ['A', 'B', 'C', 'D', 'E', 'F']
			}[index];
		});

		this.voteList = [];
		this.players = {};
		var i = 0;
		var me = this;

		common.forEach(votes, function(title){
			me.voteList.push({
				id: i++,
				title: title,
				count: 0,
				players: {} // 投过票的用户
				// ips: {} TODO : 限制IP
			});
		});
	}

	XGamePlugin.prototype.command = function(fields, passport, query) {
		if (!fields || !passport || !query)
			return;
		switch (query.command) {
			case "xgame":
			case "vote":
				var vote = this.voteList[query.id];
				if (!vote) return;
				if (this.players[passport.id]) return '你已经投过了。';
				if (vote.players[passport.id]) return '这项你已经投过了。'; // 投过票
				this.players[passport.id] = true;
				vote.players[passport.id] = true;
				vote.count++;
				fields.push({
					type: "xgameUpdate",
					votes: [{
						id: vote.id,
						count: vote.count
					}]
				});
				break;
		}
	};
	XGamePlugin.prototype.all = function(fields, passport, query) {
		fields.push({
			type: "xgameAll",
			votes: this.getXGameAll(passport)
		});
	};
	
	XGamePlugin.prototype.getXGameAll = function(passport) {
		var votes = [], me = this;
		common.forEach(this.voteList, function(vote) {
			votes.push({
				id: vote.id,
				title: vote.title,
				count: vote.count,
				voted: me.players[passport.id]
			});
		});
		return votes;
	};

	exports.create = function(channel, options) {
		return new XGamePlugin(channel, options);
	};
    
    event.emit('plugin-register', 'xgame', XGamePlugin);
}();