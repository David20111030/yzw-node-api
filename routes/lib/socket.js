var io = require('socket.io')();
var current = require('./current.js');

io.on('connection', function (socket) {
    
    if (typeof (socket.client.request._query.user) != 'undefined') {
        var account = socket.client.request._query.user;

        var isConnection = false;
        for (var i in global.users) {
            if (global.users[i].account == account) {
                global.users[i].connectionid = socket.id;
                isConnection = true;
                break;
            }
        }
        
        if (!isConnection) {
            global.users.push({ account: account, connectionid: socket.id });
        }
    }
});

var sendToUser = function (message) {
    io.sockets.connected[message.connectionid].emit('message', message.message);
};

exports.sendToUser = sendToUser;
exports.listen = function (server) {
    return io.listen(server);
};