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

class DiabloClient {
	/**
	 * @param {Socket} client
	 * @param {Socket} server
	 * @param ip
	 * @param port
	 */
	constructor(client, server, ip, port, destPort=0) {
		client.on.call(client, 'error', () => client.destroy());
		server.on.call(server, 'error', () => server.destroy());

		if (destPort !== 4000) { // Just combine the 2 and be done with it
			client.pipe(server);
			server.pipe(client);
			return null;
		}
		const dataHandler = (from, to, hooks) => buffer => !hooks.map(client => client.call(this, buffer) === DiabloClient.BLOCK).some(_ => _) && to.write(buffer);

		this.hooks = {client: [], server: []};
		client.on('data', dataHandler(client, server, this.hooks.client));
		server.on('data', dataHandler(server, client, this.hooks.server));

		this.ip = ip;
		this.port = port;
		this.scfile = __dirname + '\\log\\s-c-' + ip + '-' + port + '-' + Date.now() + '.log';
		this.csfile = __dirname + '\\log\\c-s-' + ip + '-' + port + '-' + Date.now() + '.log';
		this.client = client;
		this.server = server;
		this.initizialed = true;

		DiabloClient.instances.push(this);
		this.game = new Game(this);
	}

	static instances = [];
	static BLOCK = Symbol('block');
}


module.exports = DiabloClient;