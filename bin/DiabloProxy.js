/**
 * @description Simply hook 2 clients against eachother
 *
 */
const Game = require('./lib/Game');
const fs = require('fs');

/** @param {string} dirPath
 * @param {string} relative
 */
const addDirectory = function (dirPath, relative) {
	const checkItem = item => {

		// Get stats of the file
		fs.stat(dirPath + '/' + item, (err, stats) => {
			if (!err) {
				if (stats.isDirectory()) {
					// If it is a directory, do this recursively
					return addDirectory(dirPath + '/' + item, relative + '/' + item);
				} else if (item.endsWith('.js')) {
					// if its just a file?
					loadPlugin('./' + relative + '/' + item);
				}
			}
		})
	};

	// get async a list of all files in the directory
	fs.readdir(dirPath, (err, items) => {
		// For all the files found in this directory
		items.forEach(checkItem);
	});
};

const loadPlugin = what => {
	require(what);
};

addDirectory(__dirname + '\\plugins', 'plugins');

class DiabloProxy {
	/**
	 * @param {Socket} client
	 * @param {Socket} server
	 * @param ip
	 * @param port
	 */
	constructor(client, server, ip, port) {
		this.proxyType = 'Diablo';
		
		client.on.call(client, 'error', () => client.destroy());
		server.on.call(server, 'error', () => server.destroy());

		if (port !== 4000) { // Just combine the 2 and be done with it
			client.pipe(server);
			server.pipe(client);
			return null;
		}

		const dataHandler = (to, hooks) => buffer => {
			try {
				hooks.map(hook => hook.call(this, buffer)); // For every hook in hooks (of client or server), run the hook
			} catch(e) {
				console.log(e); // On running hook handle error
			} finally {
				to.write(buffer); // Finally write from source to target
			}
		}
		
		this.hooks = {client: [], server: []};

		//client.pipe(server); // For now
		//server.pipe(client);
		client.on('data', dataHandler(server, this.hooks.client)); // On data from client, pass server and client hooks to datahandler
		server.on('data', dataHandler(client, this.hooks.server));

		this.ip = ip;
		this.port = port;
		this.scfile = __dirname + '\\log\\s-c-' + ip + '-' + port + '-' + Date.now() + '.log';
		this.csfile = __dirname + '\\log\\c-s-' + ip + '-' + port + '-' + Date.now() + '.log';
		this.client = client;
		this.server = server;
		this.initizialed = true;
		this.game = new Game(this);

		DiabloProxy.instances.push(this);
		client.on('close', () => this.destroy());
	}

	destroy() {
		DiabloProxy.instances.splice(DiabloProxy.instances.indexOf(this), 1);
	}

	static instances = [];
}

module.exports = DiabloProxy;