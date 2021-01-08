/**
 * @description The class that gets init once a new socket comes
 * @author Jaenster
 */

const enums = {
	NO_AUTH: 0x00,
	AUTH: 0x02,
};

const preferredAuthMethods = [enums.AUTH, enums.NO_AUTH];

const BufferHelper = require('./BufferHelper');
const net = require('net');
//const { create } = require('domain');
const { Console } = require('console');

class Client {
	constructor(socket, settings = {users: [], options: {allowNoAuth: false, listen: 0x50C4, client: require('./ProxyClient')}}) { // ProxyClient is just a fallback!!
		this.socket = socket;
		this.settings = settings;
		socket.once('data', data => this.handshakeInit(data));
		socket.on('error', e => e);
		Client.instances.push(this);
	}

	connect(ipAddr, port, connectBuffer) {
		const remote = net.connect(port, ipAddr, () => {
			connectBuffer.writeUInt8(0x00, 1); // Success code
			this.socket.write(connectBuffer);
			this.destroy(false); // Dont close socket ;)
			
			if ([6112,6113,4000].includes(port)) {
				console.log(ipAddr + ':' + port);
				new this.settings.options.client(this.socket, remote, ipAddr, port, port);
				return;
			}

			this.socket.once('data', data1 => {
				remote.write(data1);
				var destPort = 0;
				var destHost = 'HOST';

				try {[destHost, destPort] = BufferHelper.getString(data1, data1.length, 0).split(' ')[1].split(':')} catch (e) {}

				if (data1.length >= 1 && data1.readUInt8(0) === 0x05) { // Todo add destHost for socks5 proxychains and test socks5 proxy
					this.socket.once('data', data3 => {
						remote.write(data3);

						this.socket.once('data', data5 => {
							remote.write(data5);

							if (data5.length >= 10 && data5[0] === 0x05 && data5[2] === 0x00) { // All of this block is just to get dest IP:PORT. lol
								let offset = 3;

								switch (data5[offset++]) {
									case 0x01: // ip address
										destHost = [offset++, offset++, offset++, offset++].map(offset => data5.readUInt8(offset).toString()).join('.');
										break;
									case 0x03: // domain name
										const sizeDomain = data5.readUInt8(offset++);
										destHost = BufferHelper.getString(data5, sizeDomain, offset);
										offset += sizeDomain;
										break;
									case 0x04: // IPV6
										ipAddr = [];
										for (let i = 0; i < 16; i++) ipAddr.push(offset++);
										destHost = ipAddr.map(offset => data5.readUInt8(offset).toString(16).padStart(2, '0')).reduce((a, c, i) => a + ((i && (i + 1) % 2) ? ':' + c : c), '')
										break;
								}

								destPort = data5.readUInt16BE(data5.length-2);
							}

							console.log(destPort ? destHost + ':' + destPort : ipAddr + ':' + port); // direct : proxychain
							new this.settings.options.client(this.socket, remote, ipAddr, port, parseInt(destPort));
						});
					});
	
					remote.once('data', data2 => {
						this.socket.write(data2);
	
						remote.once('data', data4 => {
							this.socket.write(data4);
						});
					});

					return;
				}

				console.log(destPort ? destHost + ':' + destPort : ipAddr + ':' + port); // direct : proxychain
				new this.settings.options.client(this.socket, remote, ipAddr, port, parseInt(destPort));
			});
		}).on('error', err => {
			connectBuffer.writeUInt8(!!err | 0, 1); // Success code
			this.socket.write(connectBuffer);
			this.destroy();

			// Remove this client from our instance list
			Client.instances.splice(Client.instances.indexOf(this), 1);
		});
	}



	handshakeInit(data) {
		let offset = 0;
		const version = data.readUInt8(0);
		//unsupported version
		if (version !== 5) return this.destroy(); // simply close the socket

		const typesSupported = data.readUInt8(1);

		// build supported types
		let auths = [];
		for (let i = 0; i < typesSupported; i++) auths.push(data.readUInt8(i + 2));

		// Filter out those we dont support.
		auths = auths.filter(type => type === enums.AUTH || (type === enums.NO_AUTH && this.settings.options.allowNoAuth));

		// unsupported auth
		if (!auths.length) return this.destroy();

		// The lowest of preferredAuthMethod's come first
		auths.sort((a, b) => preferredAuthMethods.indexOf(a) - preferredAuthMethods.indexOf(b));

		// What we want to auth with, comes first
		const auth = auths[0];

		const buffer = Buffer.alloc(2);
		buffer.writeUInt8(0x05, offset++); // version
		buffer.writeUInt8(auth, offset++); // Auth type

		// Send response
		// Reset is zero'd out
		this.socket.write(buffer);

		// once handshake part 1 is done, wait for part 2.
		if (auth === enums.AUTH) {
			this.socket.once('data', data => this.handshakeAuth(data));
		} else {
			this.socket.once('data', data => this.handshakeConnect(data));
		}
	}

	handshakeAuth(data) { // Waiting for username/password
		let offset = 0;
		let failed = 0x00; // didnt fail
		const type = data.readUInt8(offset++);
		if (type === 0x01) {
			const usernameLength = data.readUInt8(offset++);
			offset += usernameLength;

			const passwordLength = data.readUInt8(offset++);
			const uname = BufferHelper.getString(data, usernameLength, 2);
			const pass = BufferHelper.getString(data, passwordLength, offset);

			if (!this.settings.users.some(user => user.username === uname && user.password === pass)) {
				failed = 0x01; // We failed to find any user with that username/password
			}
		} else {
			failed = 0x01; // unsupported auth
		}
		const buffer = Buffer.alloc(2);
		buffer.writeUInt8(type, 0); // username/password response
		buffer.writeUInt8(failed, 1);

		this.socket.write(buffer);
		if (failed) return this.destroy();

		this.socket.once('data', data => this.handshakeConnect(data));
	}

	handshakeConnect(data) {
		let offset = 0;
		const command = data.readUInt8(++offset);
		offset += 2; // we dont care for the reverse byte
		const hostType = data.readUInt8(offset++);

		let ipAddr;
		switch (hostType) {
			case 0x01: // ip address
				ipAddr = [offset++, offset++, offset++, offset++].map(offset => data.readUInt8(offset).toString()).join('.');
				break;
			case 0x03: // domain name
				const sizeDomain = data.readUInt8(offset++);
				ipAddr = BufferHelper.getString(data, sizeDomain, offset);
				offset += sizeDomain;
				break;
			case 0x04: // IPV6
				ipAddr = [];
				for (let i = 0; i < 16; i++) ipAddr.push(offset++);
				ipAddr = ipAddr.map(offset => data.readUInt8(offset).toString(16).padStart(2, '0')).reduce((a, c, i) => a + ((i && (i + 1) % 2) ? ':' + c : c), '')
				break;
		}
		const port = data.readUInt16BE(offset);
		if (!port || !ipAddr) {
			data.writeUInt8(0x04 /*host unreachable*/, 1); // Success code
			return this.destroy();
		}

		this.connect(ipAddr, port, data);
	}

	static instances = [];

	destroy(socketDestroy = true) {
		// Remove this client from our instance list
		Client.instances.splice(Client.instances.indexOf(this), 1);

		socketDestroy && this.socket.destroy();
	}


}

module.exports = Client;