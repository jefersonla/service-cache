var http = require('http'),
    url = require('url'),
    events = require('events'),
    request = require('request'),
    sensor = {'temperature': '',
              'humidity': '',
               'lamp': '',
	           'air':''};

// Get the Temperature value
function temperature(){
    request('http://10.0.0.100:8181/cxf/temp/devices/sensor/temperature', function (error, res, body) {
    if (!error && res.statusCode == 200) {
        sensor['temperature'] = body;
        console.log('Temperature Updated');
    }
    humidity();
});}

// Get the Humidity value
function humidity(){
    request('http://10.0.0.100:8181/cxf/humidity/devices/sensor/humidity', function (error, res, body) {
    if (!error && res.statusCode == 200) {
        sensor['humidity'] = body;
        console.log('Humidity Updated');
    }
    lamp();
});}
    
// Get the Lamp status 
function lamp(){
   request('http://10.0.0.100:8181/cxf/lamp/devices/actuator/lamp', function (error, res, body) {
    if (!error && res.statusCode == 200) {
        sensor['lamp'] = body;
        console.log('Lamp Updated');
    }
	//air();
});}

// Get the Air status
function air(){
    request('http://10.0.0.100:8181/cxf/air/devices/actuator/air', function (error, res, body) {
    if (!error && res.statusCode == 200) {
        sensor['air'] = body;
        console.log('Air Updated');
    }
});}

// Get all the sensor every 5 seconds
setInterval(function() {
    // Start the query
    temperature();    
}, 5000);

var eventEmitter = new events.EventEmitter();
eventEmitter.on('lampChangeValue', lamp);

http.createServer(function(req, res) {
    var path = url.parse(req.url).pathname,
        data = '{"Error":true}';
    
    switch(path){
        case '/sensor/temperature':
            data = sensor['temperature'];
            break;
        case '/sensor/humidity':
            data = sensor['humidity'];
            break;
        case '/actuator/lamp':
            data = sensor['lamp'];
            break;
	case '/actuator/air':
	    data = sensor['air'];
	    break;
    case '/update/actuators':
        eventEmitter.emit('lampChangeValue');
        data = '{"Error":false}';
        break;
    }

    console.log('Get JSON requisition of length ' + data.length + ' bytes');
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'access-control-allow-headers': 'Content-Type',
        'access-control-allow-methods': 'GET, POST, DELETE, PUT',
        'access-control-allow-origin': '*'
    });
    res.write(data, 'utf8');
    
    return res.end();
}).listen(8050);
console.log('Running Server on port 8050');
