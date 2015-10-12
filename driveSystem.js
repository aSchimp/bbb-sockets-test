function DriveSystem (leftMotor, rightMotor) {
    var self = this;
    self._leftMotor = leftMotor;
    self._rightMotor = rightMotor;
}

DriveSystem.prototype.moveStraight = function (speed) {
    var self = this;
    self._leftMotor.setRotation(speed);
    self._rightMotor.setRotation(-speed);
};

DriveSystem.prototype.stop = function (speed) {
    var self = this;
    self.moveStraight(0);
};

DriveSystem.prototype.turn = function (speed, radius) {

};

DriveSystem.prototype.rotate = function (speed) {
    self._leftMotor.setRotation(speed);
    self._rightMotor.setRotation(speed);
};

module.exports = DriveSystem;