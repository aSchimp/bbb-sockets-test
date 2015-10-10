#!/bin/bash
shopt -s extglob

cd /sys/devices/bone_capemgr.*

# serial port for LIDAR
echo BB-UART2 > slots

# PWM pin for LIDAR motor
echo am33xx_pwm > slots
echo bone_pwm_P9_14 > slots

# PWM pin for left drive motor
echo bone_pwm_P8_45 > slots

# PWM pin for right drive motor
echo bone_pwm_P9_29 > slots

# set baud rate for LIDAR serial port
stty -F /dev/ttyO2 115200

# ensure lidar pwm is off
cd /sys/devices/ocp.*/pwm_test_P9_14.*
echo 0 > run

# ensure drive motors are off
cd /sys/devices/ocp.*/pwm_test_P8_45.*
echo 0 > run
cd /sys/devices/ocp.*/pwm_test_P9_29.*
echo 0 > run

# gpio pins for drive motors

# P8_41
cd /sys/class/gpio
echo 74 > export
cd gpio74
echo out > direction
echo 0 > value

# P8_42
cd /sys/class/gpio
echo 75 > export
cd gpio75
echo out > direction
echo 0 > value

# P8_43
cd /sys/class/gpio
echo 72 > export
cd gpio72
echo out > direction
echo 0 > value

# P8_44
cd /sys/class/gpio
echo 73 > export
cd gpio73
echo out > direction
echo 0 > value
