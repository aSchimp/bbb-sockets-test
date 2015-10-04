var util = require('util');
var events = require('events');
var SerialPort = require("serialport").SerialPort;
var fs = require('fs');
var path = require('path');
var glob = require('glob');

function LidarPacket(index, speed, dist1, dist2, dist3, dist4){
    this.index = index;
    this.speed = speed;
    this.dist1 = dist1;
    this.dist2 = dist2;
    this.dist3 = dist3;
    this.dist4 = dist4;
}

/**
 * Computes and returns the checksum as an int.
 * @param {Array} data - The data to compute the checksum for. Must be 20 bytes.
 * @return {Number} The checksum as an integer.
 */
var computeChecksum = function(data) {
    // group the data by word, little-endian
    var dataList = [];
    for (var i = 0; i < 10; i++){
        dataList.push(data[2*i] + (data[2*i+1]<<8));
    }

    // compute the checksum on 32 bits
    var chk32 = 0;
    dataList.forEach(function(item){
        chk32 = (chk32 << 1) + item;
    });

    // return a value wrapped around on 15 bits, and truncated to still fit into 15 bits
    var checksum = (chk32 & 0x7FFF) + (chk32 >> 15); // wrap around to fit into 15 bits
    checksum = checksum & 0x7FFF; // truncate to 15 bits
    return checksum;
};

/**
 * Gets the lidar distance reading from a 4 byte data section.
 * @param {Array} bytes - Buffer with 4 bytes of data.
 * @return {Number} The distance reading as an integer.
 */
var parsePacketDataSection = function(bytes) {
    // if the 8th bit of the byte 1 is set, the data is invalid; the 7th bit of byte 1 is a strength warning (varies with material sometimes) flag, but we are ignoring it for now
    if (bytes[1] & 128 === 128)
        return -1;

    // get distance from byte 0 and byte 1; byte 2 and byte 3 contain signal strength data, which we are ignoring for now
    return bytes[0] + ((bytes[1] & 63) << 8);
};

var parsePacket = function(bytes) {
    // first byte in the packet must be 0xFA
    if (bytes[0] != 0xFA)
        return null;

    // verify data via checksum
    if (computeChecksum(bytes.slice(0, 20)) !== (bytes[20] + (bytes[21] << 8)))
        return null;

    // packet index must be between 0xA0 and 0xF9
    var index = bytes[1];
    if (index < 0xA0 || index > 0xF9)
        return null;

    // adjust index to 0 based index
    index = index - 0xA0;

    // speed unit used by the LIDAR is in 64ths of an RPM; we want the speed in RPMs
    var speed = (bytes[2] + (bytes[3]<<8))/64.0;

    var distances = [];
    for (var i = 1; i < 5; i++)
        distances.push(parsePacketDataSection(bytes.slice(4*i, 4*i+4)));

    return new LidarPacket(index, speed, distances[0], distances[1], distances[2], distances[3]);
};

function Lidar(serialPath, pwmPath) {
    var self = this;
    self._pwmPath = pwmPath;
    self._serialPort = new SerialPort(serialPath, {
        baudrate: 115200
    });

    self._serialPort.on("open", function () {
        console.log('serial port to lidar is open');

        var currentPacketData = [];
        self._serialPort.on('data', function(data) {
            console.log('data received from lidar: ' + data.toString('hex'));
            self.emit('raw data', data);

            for (var i = 0; i < data.length; i++) {
                var b = data[i];

                // if we're starting a new packet, but the current byte doesn't mark the beginning of the packet, skip it
                if (currentPacketData.length === 0 && b != 0xFA)
                    continue;

                currentPacketData.push(b);

                if (currentPacketData.length === 22) {
                    var packet = parsePacket(currentPacketData);
                    if (packet === null) {
                        // packet was invalid; check for 0xFA packet start marker in the last packet, as sometimes some bytes are dropped and the next packet is already started
                        var nextIndex = currentPacketData.slice(1).indexOf(0xFA) + 1;
                        if (nextIndex > 0)
                            currentPacketData = currentPacketData.slice(nextIndex);
                        else
                            currentPacketData = [];
                    }
                    else {
                        self.emit('packet', packet);

                        // reset currentPacketData
                        currentPacketData = [];
                    }
                }
            }
        });
    });
}

Lidar.prototype._sendPwmCommand = function (name, value) {
    var self = this;
    glob(path.join(self._pwmPath, name), { cwd: '/' }, function(err, files) {
        if (err || files.length < 1) {
            console.log('An error occurred sending pwm command \'' + name + '\' with value \'' + value + '\'. Could not resolve the pwm path. ' + err);
            return;
        }

        if (files.length > 1) {
            console.log('An error occurred sending pwm command \'' + name + '\' with value \'' + value + '\'. PWM path resolved to more than one location. ' + err);
            return;
        }

        fs.writeFile(files[0], value, function(writeError) {
            if (err) {
                console.log('An error occurred sending pwm command \'' + name + '\' with value \'' + value + '\'. ' + writeError);
            }
        });
    });
};

Lidar.prototype.start = function () {
    var self = this;

    console.log('Lidar starting.');

    self._sendPwmCommand('period', '1000000');
    self._sendPwmCommand('duty', '380000');
    self._sendPwmCommand('run', '1');
};

Lidar.prototype.stop = function () {
    var self = this;

    console.log('Lidar stopping.');

    self._sendPwmCommand('run', '0');
};

// Inherit the EventEmitter
util.inherits(Lidar, events.EventEmitter);

module.exports = Lidar;