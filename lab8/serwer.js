/* jshint node: true */
var express = require('express');
var app = express();
var httpServer = require("http").Server(app);
var io = require("socket.io")(httpServer);
var chatData = "";
var onlineData = "";

var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

io.sockets.on("connection", function (socket) {
    socket.on("message", function (data) {
        io.sockets.emit("echo", "Dostałem: " + data);
    });
    socket.on("error", function (err) {
        console.dir(err);
    });
    socket.on("nick", function(data){
        socket.nick = data;
        chatData += data+"\n";
        //onlineData += data.match("^\\S+.")+"\n";    // tu filtr!
        io.sockets.emit("nick_ok", chatData);
        //io.sockets.emit("online_ok", chatData); // tu
        io.sockets.emit("online_ok", onlineData); // tu

    });
    socket.on("online", function(data){
        socket.online = data;
        onlineData += data+"\n";
        io.sockets.emit("online_ok", onlineData);
    });
    socket.on("ofline", function(data){
        socket.ofline = data;
        onlineData = onlineData.replace(data+"\n", "");
        io.sockets.emit("online_ok", onlineData);
    });
});
// io.socket.on('disconnect', function () {
//     // socket.ofline = data;
//     onlineData = onlineData.replace(data, "");
//     io.sockets.emit("online_ok", onlineData);
//
// });
httpServer.listen(3000, function () {
    console.log('Serwer HTTP działa na porcie ' + 3000);
});