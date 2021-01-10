const GameServer = require('./GameServer');
const GameClient = require('./GameClient');
const BaseLevel = require('./BaseLevel');
const UnitCollector = require('./UnitCollector');
const ItemCollector = require('./ItemCollector');

class Game {
	constructor(diabloProxy) {
		// ToDo: Hook myself upon the realm server proxy
		this.diabloProxy = diabloProxy;
		this.gameServer = new GameServer(this);
		//this.gameClient = new GameClient(this);

		// Collect units
		this.unitCollector = new UnitCollector(this);

		// Collect items (is also an unit)
		this.itemCollector = new ItemCollector(this);

		this.me = this.unitCollector.createMe();
		this.collectData(); // Do this in another function to prevent memory leaks
		delete this.collectData; // Doesnt need to be called again
	}

	destroy() {
		// For all items we have, we call the destroy function if need
		Object.keys(this).filter(key => this[key] && this[key].hasOwnProperty('destroy')).forEach(key => this[key].destroy());
	}

	collectData() {
		this.gameServer.once(0x01, ({packetData}) => {
			this.diff = packetData.Difficulty;
			this.hardcore = packetData.Hardcore !== 16;
			this.expansion = !!packetData.Expansion;
			this.ladder = !!packetData.Ladder;
		});
		this.gameServer.once(0x03, ({packetData}) => {
			this.mapid = packetData.Map_ID;
			this.area = packetData.Area_Id;
			this.act = packetData.Act;
		});

		// Upon game termination
		this.gameServer.once(0xB0, _ => this.destroy());
	}

}

module.exports = Game;