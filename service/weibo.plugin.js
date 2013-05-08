var common = require('../common/channel.common.js');
var event = require('./event');
var http = require('http');

void function(){
    /**
     * @author 王集鹄(wangjihu，http://weibo.com/zswang)
     */
    function WeiboPlugin(channel, options){
        this.channel = channel;
        options = options || {};
        /**
         * 最大人数
         */
        this.maxCount = options.maxCount || 300;
        this.playerCount = 0;
        this.players = {};
    }
    
    WeiboPlugin.prototype.command = function(fields, passport, query){
        if (!fields || !passport || !query) return;
        var me = this;
        switch (query.command) {
            case "enter":
                if (!query || !query.refer || passport.weibo || passport.processUrl) return;
                String(query.refer).replace(/^http:\/\/weibo.com\/(\w+)/g, function(url, id){
                    //http://zswang.duapp.com/api/?action=regex&regex=/%3Cimg%20class=%22W_face_radius%22%20src=%22([^%22]*)%22/&url=http://weibo.com/1486697205
                    http.get(url, function(res){
                        if (res.statusCode == 302){
                           // var location = res.getHeader('Location');
                            if (!res.headers.location) return;
                            var body = '';
                            http.get(res.headers.location, function(res){
                                res.on('data', function(chunk){
                                    body += chunk;
                                });
                                res.on('end', function(){
                                    String(body).replace(/<img class="[^"]*W_face_radius[^"]*" src="([^"]*)"[^>]*alt="([^"]*)" \/>/, function(all, face, nick){
                                        passport.update({
                                            weibo: !common.checkWeibo(url) ? url : passport.weibo,
                                            nick: !common.checkNick(nick) ? nick : passport.nick
                                        });
                                        var fields = [];
                                        fields.push({
                                            type: "playerUpdate",
                                            players: [{
                                                id: passport.id,
                                                nick: passport.nick,
                                                weibo: passport.weibo
                                            }]
                                        });
                                        me.channel.fire(fields);
                                        console.log(fields);
                                    });
                                });
                            }).on('error', function(e){
                                console.log("Got error: " + e.message);
                            });                
                        }
                    }).on('error', function(e){
                        console.log("Got error: " + e.message);
                    });                
                });
                break;
        }
    };

    WeiboPlugin.prototype.getWeiboAll = function(){
        var players = [];
        common.forEach(this.players, function(Weibo){
            players.push({
                id: Weibo.id,
                nick: Weibo.nick,
                weibo: Weibo.weibo,
                state: Weibo.state
            });
        });
        return players;
    };
    
    event.emit('plugin-register', 'weibo', WeiboPlugin);
}();
