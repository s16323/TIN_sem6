/* jshint node: true */
var express = require('express');
var app = express();
var httpServer = require('http').createServer(app);         // setting up 'httpServer' variable to run the'app' on
var io = require('socket.io').listen(httpServer);    // create 'io' and make it listen to the 'httpServer'

users = [];         // array of users
connections = [];   // array of connections

// server.listen(3000);        //run the server on port 3000
httpServer.listen(process.env.PORT || 3000); //run the server where it can or on port 3000
console.log('httpServer is now running on localhost:3000');

app.get('/', function(req, res){        // when visiting '/' - root directory a function will run - taking request and response
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {     // Open connection using socket.io - all events to emit are here!
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Disconnect
    socket.on('disconnect', function (data){        // do this on disconnection:
        // if (!socket.username)return;                // if there are no more users do nothing here
        users.splice(users.indexOf(socket.username), 1);
        updateUserNames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);         // When someone disconnects we tell how many are still connected
    });

    // Send Message
    socket.on('send message', function (data) {         // on event of a 'send message':
        console.log(data);                              // log this message
        io.sockets.emit('new message',{msg: data, user: socket.username});     // and every time a 'send message' happens broadcast this 'new message'
        // io.sockets.emit('new message', data);     // and every time a 'send message' happens broadcast this 'new message'
    });

    // New User
    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUserNames();
    });
    
    function updateUserNames(){
        io.sockets.emit('get users', users);
    }


});