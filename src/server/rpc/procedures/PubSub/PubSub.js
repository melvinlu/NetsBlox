// This is a key value store that can be used across tables
'use strict';

var debug = require('debug'),
    log = debug('NetsBlox:RPCManager:PubSub:log'),
    trace = debug('NetsBlox:RPCManager:PubSub:trace');

var subs = {};

var removeSub = function(topic, msgType, socket) {
    var id;
    console.log(`removing ${socket.username} from ${topic}/${msgType}`);
    if (!subs[topic] || !subs[topic][msgType]) {
        return;
    }

    id = subs[topic][msgType].indexOf(socket);
    subs[topic][msgType].splice(id, 1);

    if (subs[topic][msgType].length === 0) {
        delete subs[topic][msgType];
        if (Object.keys(subs[topic]).length === 0) {
            delete subs[topic];
        }
    }
};

module.exports = {

    // This is very important => Otherwise it will try to instantiate this
    isStateless: true,

    // These next two functions are the same from the stateful RPC's
    getPath: function() {
        return '/pubsub';
    },

    getActions: function() {
        return ['pub', 'sub', 'unsub'];
    },

    sub: function(req, res) {
        var topic = req.query.topic.toLowerCase(),
            msgType = req.query.msgType,
            socket = req.netsbloxSocket;

        if (!subs[topic]) {
            subs[topic] = {};
        }
        if (!subs[topic][msgType]) {
            subs[topic][msgType] = [];
        }

        trace(`${socket.username} has subscribed to ${topic}/${msgType}`);
        subs[topic][msgType].push(socket);
        socket.onclose.push(removeSub.bind(null, topic, msgType, socket));
        res.sendStatus(200);
    },

    unsub: function(req, res) {
        var topic = req.query.topic.toLowerCase(),
            msgType = req.query.msgType,
            socket = req.netsbloxSocket;

        removeSub(topic, msgType, socket);
        res.sendStatus(200);
    },

    pub: function(req, res) {
        var topic = req.query.topic.toLowerCase(),
            msg = JSON.parse(req.query.content),
            content = msg.contents;

        // publish the message to all the subscribers
        console.log(Object.keys(subs));
        console.log(JSON.stringify(topic));
        console.log(Object.keys(subs[topic]));
        if (subs[topic] && subs[topic][msg.type]) {
            trace(`publishing ${content} to ${topic} as ${msg.type}`);
            subs[topic].forEach(socket => socket.send({
                type: 'message',
                dstId: socket.roleId,
                msgType: msg.type,
                content: content
            }));
        } else {
            log(`${topic}/${msg.type} has no subscribers`);
        }

        res.sendStatus(200);
    }
};
