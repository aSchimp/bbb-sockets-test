var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Lidar = require('./lidar.js');
var BiDirMotor = require('./biDirMotor.js');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var lidar = new Lidar('/dev/ttyO2', '/sys/devices/ocp.*/pwm_test_P9_14.*');
lidar.on('raw data', function(data){
    //io.emit('lidar raw data', data.toString('hex'));
});

var leftMotor = new BiDirMotor('/sys/devices/ocp.*/pwm_test_P8_45.*', '/sys/class/gpio/gpio74', '/sys/class/gpio/gpio75');
var rightMotor = new BiDirMotor('/sys/devices/ocp.*/pwm_test_P9_29.*', '/sys/class/gpio/gpio72', '/sys/class/gpio/gpio73');

var revIndex = 0;
var packetGroup = [];
var lastPacketIndex = 90;
lidar.on('packet', function(packet){
    if (packet.index <= lastPacketIndex) {
        revIndex++;

        if (packetGroup.length > 0) {
            io.emit('lidar packet group', packetGroup);
        }

        packetGroup = [];
    }

    if (revIndex % 2 === 0) {
        packetGroup.push(packet);
    }

    lastPacketIndex = packet.index;
});

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);

        var msgParts = msg.split(' ');

        // check for command messages
        switch (msgParts[0]) {
            case 'lidarstart':
                lidar.start();
                break;
            case 'lidarstop':
                lidar.stop();
                break;
            case 'leftmotor':
                if (msgParts.length > 1) {
                    var rotationVal = parseFloat(msgParts[1]);
                    if (rotationVal !== NaN) {
                        leftMotor.setRotation(rotationVal);
                    }
                }
                break;
            case 'rightmotor':
                if (msgParts.length > 1) {
                    var rotationVal = parseFloat(msgParts[1]);
                    if (rotationVal !== NaN) {
                        rightMotor.setRotation(rotationVal);
                    }
                }
                break;
        }
    });
});

http.listen(3001, function(){
    console.log('listening on *:3001');
});
