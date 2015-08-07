var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyO2", {
    baudrate: 115200
});

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data.toString('hex'));
    io.emit('lidar raw data', data.toString('hex'));
  });
});