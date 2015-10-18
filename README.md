# bbb-sockets-test
Experimental NodeJS Socket.IO application for BeagleBone Black

This experiment is complete and will form the base code for T1-B (https://github.com/aSchimp/T1-B)

# Installation

````
git clone https://github.com/aSchimp/bbb-sockets-test
cd bbb-sockets-test
npm install
chmod +x initialize_io.sh
````

On startup, run this

````
cd bbb-sockets-test
./initialize_io.sh
````

To start, run

````
nodejs index.js
````

Then navigate to {bbb_ip_address}:3001. The IP address will probably be 192.168.7.2 if you are connected via USB. If you are connected through WiFi or ethernet, I recommend that you assign a permanent IP address to your BBB in your router's DHCP settings.
