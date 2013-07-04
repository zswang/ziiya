/**
 * 部署在BAE环境
 * @see http://developer.baidu.com/
 */

var event = require('./event');
var common = require('../common/channel.common');
var util = require('util');
var mongodb = require('mongodb');

// 数据库配置信息
var db_name = 'GkGFwcCoIkAxnbwseKox';                 // 数据库名，从云平台获取
var db_host = process.env.BAE_ENV_ADDR_MONGO_IP;      // 数据库地址
var db_port = process.env.BAE_ENV_ADDR_MONGO_PORT;    // 数据库端口
var username = process.env.BAE_ENV_AK;                // 用户名
var password = process.env.BAE_ENV_SK;                // 密码
 
var url = util.format("mongodb://%s:%s@%s:%s/%s", username, password, db_host, db_port, db_name);

// 连接数据库
mongodb.MongoClient.connect(url, function(err, db){
	if (err){
  		console.log(err);
  		return;
	}

	event.on('storage-save', function(table, key, value, callback){
	    db.createCollection(table, function(err, collection){
	  		collection.update({ id : key }, value, { upsert: true }, function(err){
	  			callback && callback(err);
	  		});
	  	}); 
	});

	event.on('storage-load', function(table, key, callback){
	    if (!callback) return;
	    db.createCollection(table, function(err, collection){
	  		collection.findOne({ id : key }, function(err, value){
	  			callback && callback(err, value);
	  		});
	    });
	});
});