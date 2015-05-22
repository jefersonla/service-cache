var http = require('http'),
    url = require('url'),
    request = require('request'),
    sensor = {'temperature': '',
              'humidity': '',
               'lamp': ''};

// Get all the sensors every 4 seconds
setInterval(function() {
    // Get the Temperature value
    request('http://localhost:8094/cxf/temp/devices/sensor/temperature', function (error, res, body) {
        if (!error && res.statusCode == 200) {
            sensor['temperature'] = body;
            console.log('Temperature Updated');
        }
        humidity();
    });

    // Get the Humidity value
    function humidity(){
        request('http://localhost:8094/cxf/humidity/devices/sensor/humidity', function (error, res, body) {
        if (!error && res.statusCode == 200) {
            sensor['humidity'] = body;
            console.log('Humidity Updated');
        }
        lamp();
    });}
    
    // Get the Lamp status 
    function lamp(){
        request('http://localhost:8094/cxf/lamp/devices/actuator/lamp', function (error, res, body) {
        if (!error && res.statusCode == 200) {
            sensor['lamp'] = body;
            console.log('Lamp Updated');
        }
    });}
}, 4000);

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