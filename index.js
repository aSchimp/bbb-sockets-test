var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Lidar = require('./lidar.js');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var lidar = new Lidar('/dev/ttyO2', '/sys/devices/ocp.*/pwm_test_P9_14.*');
lidar.on('raw data', function(data){
    //io.emit('lidar raw data', data.toString('hex'));
});

var revIndex = 0;
var packetGroup = [];
lidar.on('packet', function(packet){
    if (packet.index === 0) {
        revIndex++;

        if (packetGroup.length > 0) {
            io.emit('lidar packet group', packet);
        }

        packetGroup = [];
    }

    if (revIndex % 2 === 0) {
        packetGroup.push(packet);
    }
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);

    // check for command messages
    switch (msg) {
        case 'lidarstart':
            lidar.start();
            break;
        case 'lidarstop':
            lidar.stop();
            break;
    }
  });
});

http.listen(3001, function(){
    console.log('listening on *:3001');
});
