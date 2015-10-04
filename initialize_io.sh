#!/bin/bash

cd /sys/devices/bone_capemgr.*

# serial port for LIDAR
echo BB-UART2 > slots

# PWM pin for LIDAR motor
echo am3xx_pwm > slots
echo bone_pwm_P9_14 > slots

# set baud rate for LIDAR serial port
stty -F /dev/ttyO2 115200

# ensure lidar pwm is off
echo 0 > /sys/devices/ocp.*/pwm_test_P9_14.*/run