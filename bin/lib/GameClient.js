const BitReader = require('./BitReader');
const { logPacket } = require('./Util');

class GameClient extends require('events') {
	constructor(game) {
		super();
		this.game = game;
		this.game.diabloProxy.hooks.client.push(buffer => {
			console.log(buffer);
		});
	}

	static hooks = [];
	static packetMap = {};
}

module.exports = GameClient;
