/**
 * 部署在NAE环境
 * @see http://cnodejs.net/
 */

var event = require('./event');
var common = require('./channel.common');
var mongo = require('mongoskin');
var util = require('util');

var db = mongo.db('CJNcsThKoZKh:oFbE8nuAgo@127.0.0.1:20088/YiFnSjkcaqlZ');

event.on('storage-save', function(table, key, value, callback){
    db.bind(table);
    db[table].save({ _id: key, value: value });
});

event.on('storage-load', function(table, key, callback){
    if (!callback) return;
    db.bind(table);
    db[table].findOne({ _id: key }, function(err, data){
        callback(err, data && data.value);
    });
});