var fs = require('fs');
var path = require('path');
var glob = require('glob');
var ioHelper = require('./ioHelper.js');

// constants
var dutyCycleMin = 0.3;
var dutyCycleMax = 0.7;
var period = 1000000;

// bi-directional motor
function BiDirMotor(pwmPath, gpio1Path, gpio2Path) {
    var self = this;
    self._pwmPath = pwmPath;
    self._gpio1Path = gpio1Path;
    self._gpio2Path = gpio2Path;

    self.setRotation(0);
}

// The value should be a number between -1 and 1. Negative values cause CCW rotation and positive values cause CW rotation. A value of 0 stops the motor. The absolute value controls the pwm duty cycle (speed).
BiDirMotor.prototype.setRotation = function(value) {
    var self = this;

    if (value === 0) {
        ioHelper.setGpioSignal(self._gpio1Path, 0);
        ioHelper.setGpioSignal(self._gpio2Path, 0);
        ioHelper.sendPwmCommand(self._pwmPath, 'run', '0');
        return;
    }

    var duty = Math.round((1 - Math.min(Math.max(Math.abs(value), dutyCycleMin), dutyCycleMax)) * period);
    ioHelper.sendPwmCommand(self._pwmPath, 'period', period.toString());
    ioHelper.sendPwmCommand(self._pwmPath, 'duty', duty.toString());
    ioHelper.sendPwmCommand(self._pwmPath, 'run', '1');

    if (value > 0) {
        ioHelper.setGpioSignal(self._gpio1Path, 1);
        ioHelper.setGpioSignal(self._gpio2Path, 0);
    }
    else if (value < 0) {
        ioHelper.setGpioSignal(self._gpio1Path, 0);
        ioHelper.setGpioSignal(self._gpio2Path, 1);
    }
};

module.exports = BiDirMotor;