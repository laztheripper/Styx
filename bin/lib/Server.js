/**
 * @description Just a wrapper around createServer with some settings
 * @author Jaenster
 */

const net = require('net');
const Connection = require('./Connection');
const {users = [], options = {allowNoAuth: false, listen: 0x50C4}} = require('./../Config.js');

net.createServer(socket => new Connection(socket, {users, options})).listen(options.listen);

console.log('Listening on port 127.0.0.1:' + (options.listen) + ' Socks5 (No auth? ' + options.allowNoAuth + ')');