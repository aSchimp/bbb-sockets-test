var fs = require('fs');
var path = require('path');
var glob = require('glob');

var functions = {
    sendPwmCommand: function (pwmPath, name, value) {
        glob(path.join(pwmPath, name), { cwd: '/' }, function(err, files) {
            if (err || files.length < 1) {
                console.log('An error occurred sending pwm command \'' + name + '\' with value \'' + value + '\'. Could not resolve the pwm path ' + pwmPath + '. ' + err);
                return;
            }

            if (files.length > 1) {
                console.log('An error occurred sending pwm command \'' + name + '\' with value \'' + value + '\'. PWM path ' + pwmPath + ' resolved to more than one location. ' + err);
                return;
            }

            fs.writeFile(files[0], value, function(writeError) {
                if (writeError) {
                    console.log('An error occurred sending pwm command \'' + name + '\' with value \'' + value + '\' to path ' + pwmPath + '. ' + writeError);
                }
            });
        });
    },
    // value should be 0 or 1
    setGpioSignal: function (gpioPath, value) {
        fs.writeFile(path.join(gpioPath, 'value'), value ? '1' : '0', function(writeError) {
            if (writeError) {
                console.log('An error occurred setting the value for gpio pin at path ' + gpioPath + ' to ' + value + ' (' + (value ? '1' : '0') + '). ' + writeError);
            }
        });
    }
};

module.exports = functions;