var socket_io = require('socket.io');
var http = require('http');
var express = require('express');
var mongoose = require('mongoose');
var Chat = require('./models/model');
var users = [];

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

//Connected users counter
var connectCounter = 0;

io.on('connection', function (socket) {
    //Load old msgs
    var query = Chat.find({});
    query.sort('-date').limit(5).exec(function(err, data){
        if(err) throw err;
        socket.emit('load old msgs', data);
    });

    //Create username
    socket.on('join', function(name){
    	socket.nickname = name;
        console.log(name + ' connected');
        connectCounter++;
        console.log('Connected users: ' + connectCounter); 
        users.push(socket.nickname);
        updateUsers();
    });
    //Update users
    function updateUsers(){
        socket.emit('usernames', users);
        socket.broadcast.emit('usernames', users);
    };
    socket.on('disconnect', function() {
        connectCounter--;
        console.log('Connected users: ' + connectCounter);
        if(!socket.nickname) return;
        users.splice(users.indexOf(socket.nickname), 1);
        updateUsers();
    });
    //User is typing
    socket.on("sender", function (data) {
        socket.broadcast.emit("sender", data); 
    });

    socket.on('message', function(message) {
        var nickname = socket.nickname;
        console.log(nickname + ' said:', message);
    	socket.broadcast.emit('message', nickname + ': ' + message);
    	socket.emit('message', 'Me: ' + message);
        Chat.create({userName: nickname, msg: message}, function(err, chat){
            if(err){
                console.log('Error!');
            }
            console.log('Success!');
        });
    });
});

mongoose.connect('mongodb://localhost/');
mongoose.connection.on('error', function(err) {
    console.error('Could not connect.  Error:', err);
});

server.listen(8080);