/**
 * @description Simply hook 2 clients against eachother
 *
 */
const Game = require('./lib/Game');
const MCP = require('./lib/MCP');
const fs = require('fs');
const { McpRealm } = require('./lib/Enums');
const Config = require('./Config');

/** @param {string} dirPath
 * @param {string} relative
 */
const addDirectory = function (dirPath, relative) {
	const checkItem = item => {
		fs.stat(dirPath + '/' + item, (err, stats) => {
			if (!err) {
				if (stats.isDirectory()) {
					//return addDirectory(dirPath + '/' + item, relative + '/' + item); // Don't do that for now. Plugins will load their own dependencies in folders probably.
				} else if (item.endsWith('.js')) {
					let name = item.split('.js')[0];
					if (Config.hasOwnProperty(name) && Config[name].enable) {
						loadPlugin('./' + relative + '/' + item);
						console.log('Loaded', name);
					}
				}
			}
		})
	};

	fs.readdir(dirPath, (err, items) => {
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
		client.on.call(client, 'error', () => client.destroy());
		server.on.call(server, 'error', () => server.destroy());
		client.pipe(server);
		server.pipe(client);

		const dataHandler = (to, hooks, write) => buffer => {
			try {
				hooks.map(hook => hook.call(this, buffer)); // For every hook in hooks (of client or server), run the hook
			} catch(e) {
				console.log(e); // On running hook handle error
			} finally {
				if (write) to.write(buffer); // Finally write from source to target
				while (to.queue.length) to.write(to.queue.shift());
			}
		}

		this.hooks = {client: [], server: []}; // Unless someone wants to check out the raw stream, should always be just one hook per
		this.ip = ip;
		this.port = port;
		this.scfile = __dirname + '\\log\\s-c-' + ip + '-' + port + '-' + Date.now() + '.log';
		this.csfile = __dirname + '\\log\\c-s-' + ip + '-' + port + '-' + Date.now() + '.log';
		this.client = client;
		this.server = server;
		this.client.queue = [];
		this.server.queue = [];
		this.type = false;

		if (port === 4000) {
			this.type = 'D2GS';
			client.on('data', dataHandler(server, this.hooks.client));
			server.on('data', dataHandler(client, this.hooks.server));
			this.game = new Game(this);
		} else if (McpRealm.hasOwnProperty(ip)) {
			this.type = 'MCP';
			this.client.on('data', dataHandler(this.server, this.hooks.client));
			this.server.on('data', dataHandler(this.client, this.hooks.server));
			this.mcp = new MCP(this);
		} else {
			this.type = 'Other';
		}

		DiabloProxy.instances.push(this);
		client.on('close', () => this.destroy());
	}

	destroy() {
		if (this.type === 'MCP' && this.mcp.gameHash) {
			setTimeout(() => DiabloProxy.instances.splice(DiabloProxy.instances.indexOf(this), 1), 5000); // Delay so the d2gs connection has time to grab the infos
		} else {
			DiabloProxy.instances.splice(DiabloProxy.instances.indexOf(this), 1);
		}
	}

	static instances = [];
}

module.exports = DiabloProxy;