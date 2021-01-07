/**
 * @description Just a wrapper around createServer with some settings
 * @author Jaenster
 */


const net = require('net');
const client = require('./client');

const {users = [], options = {allowNoAuth: false, listen: 0x50C4}} = require('./config.js');
net.createServer(socket => new client(socket, {users, options})).listen(options.listen); // sock in hex
// net.createServer(func(sock)).listen(bind to port); 1st arg is a function where createServer will pass a socket for every new connection
// then Client instance, on first packet sent to this server will begin socks5 Client.handshakeInit(data);
// If auth required in settings, do Client.handshakeAuth()
// Once auth (or no auth) is done, do Client.handshakeConnect() to figure out next host ip:port in the chain
// Do Client.connect() to make a new remote socket to proxy server and write the first packet to the socket
//
// D2 ---------+
//             |
//             +-- Localhost server --+-- Client() -------+----- Socks5/HTTPS proxy ----- Battle.net
//             |
// Proxifier --+
//
//
//

console.log('Listening on port 127.0.0.1:' + (options.listen) + ' Socks5 (No auth? ' + options.allowNoAuth + ')');