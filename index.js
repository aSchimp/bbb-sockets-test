var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var lidar = require('./lidar.js')('/dev/ttyO2');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});

http.listen(3001, function(){
    console.log('listening on *:3001');
});

lidar.on('raw data', function(data){
    io.emit('lidar raw data', data.toString('hex'));
});

lidar.on('packet', function(packet){
    io.emit('lidar packet', packet);
});