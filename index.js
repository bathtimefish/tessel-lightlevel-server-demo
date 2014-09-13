var tessel = require('tessel');
var wifi = require('wifi-cc3000');
var ambientlib = require('ambient-attx4');
var ws = require("nodejs-websocket");

var ambient = ambientlib.use(tessel.port['A']);

// See https://github.com/tessel/docs/blob/master/hardware-api.md#wifi
var wifiSettings = {
	ssid: "[your ssid]",
	password: "[your pass phrase]",
	security: "wpa2", // optional
	timeout: 20 // optional
};

var port = 8001;

var detectLightLevel = function(conn) {
    setInterval(function() {
      ambient.getLightLevel(function(err, ldata) {
        if(err) throw err;
        console.log("Light level:", ldata.toFixed(8));
        conn.sendText(ldata.toFixed(8));
      });
    }, 1000);
};

var connectedWss = function() {
  console.log("Web Socket Server started, listening port", port);
};

var startWss = function(err, res) {
  console.log("Wifi connected, IP address is", res.ip);
  var server = ws.createServer(function(conn) {
    console.log("Accepted new connection...");
    conn.sendText("connected from server");
    // detecting ambient sensor.
    detectLightLevel(conn);
    conn.on('close', function(code, reason) {
	  console.log('Connection closed');
    });
  }).listen(port, connectedWss);
};

ambient.on('ready', function() {
  console.log("Ambient sensor is ready.");
  console.log("Connecting wifi...");
  wifi.connect(wifiSettings, startWss);
});

ambient.on('error', function (err) {
	console.log("Error at ambient sensor.", err);
});
