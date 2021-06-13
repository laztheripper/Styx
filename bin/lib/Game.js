const GameServer = require('./GameServer');
const GameClient = require('./GameClient');
const UnitCollector = require('./UnitCollector');
const ItemCollector = require('./ItemCollector');
const Unit = require('./Unit');
const Item = require('./ItemReader');
const BufferHelper = require('./BufferHelper');
const { MenuAction } = require('./Enums');
const { logPacket } = require('./Util');

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

		this.me = new Unit();
		this.merc = new Unit();
		this.collect(); // Do this in another function to prevent memory leaks
		//delete this.collect; // Doesnt need to be called again
	}

	destroy() {
		// For all items we have, we call the destroy function if need
		Object.keys(this).filter(key => this[key] && this[key].hasOwnProperty('destroy')).forEach(key => this[key].destroy());
	}

	collect() {
		this.gameServer.on(0x81, ({packetData}) => {
			if (packetData.OwnerId !== this.me.uid) return;
			if (this.merc.uid && packetData.MercId !== this.merc.uid)
				delete this.unitCollector.collection[1][this.merc.uid];
			this.merc.oid = packetData.OwnerId;
			this.merc.uid = packetData.MercId;
			this.merc.type = 1;
			this.unitCollector.collection[1][this.merc.uid] = this.merc;
			console.log('0x81', this.merc);
		});

		this.gameServer.on(0x77, ({packetData}) => {
			switch (packetData.Action) {
				case MenuAction.TradeRequestAccepted:
					this.me.inTrade = true;
					break;
				case MenuAction.TradeDeclined:
					if (this.me.inTrade) this.itemCollector.clearOwner(this.me);
				case MenuAction.TradeCompleted:
					this.me.inTrade = false;
					break;
			}
		});

		this.gameServer.on(0x03, ({packetData}) => {
			this.me.act = packetData.Act + 1;
		});

		this.gameServer.once(0x59, ({packetData}) => {
			this.me.uid = packetData.UnitId;
			this.me.x = packetData.X;
			this.me.y = packetData.Y;
			this.me.classid = packetData.CharType;
			this.me.isMe = true;
			this.me.type = 0;
			this.unitCollector.collection[0][this.me.uid] = this.me;
		});

		this.gameServer.once(0x5A, ({packetData}) => {
			this.me.charname = BufferHelper.getCString(packetData.raw, 16, 8);
			this.me.account = BufferHelper.getCString(packetData.raw, 16, 24);
			console.log('0x5A', this.me); // Last one received related to `me` 
		});

		this.gameServer.once(0x01, ({packetData}) => {
			this.diff		= packetData.Difficulty;
			this.hardcore	= !!(packetData.ArenaFlags & 0x00000800);
			this.expansion	= !!packetData.Expansion;
			this.ladder		= !!packetData.Ladder;

			this.me.diff		= this.diff;
			this.me.hardcore	= this.hardcore;
			this.me.expansion	= this.expansion;
			this.me.ladder		= this.ladder;
		});

		this.gameServer.on(0x9C, ({packetData}) => {
			const item = Item.fromPacket(packetData.raw, this);
			if (!item) return;
			this.itemCollector.newItem(item);
		});

		this.gameServer.on(0x9D, ({packetData}) => {
			const item = Item.fromPacket(packetData.raw, this);
			if (!item) return;
			this.itemCollector.newItem(item);
		});

		// Upon game termination
		this.gameServer.once(0xB0, _ => {
			this.destroy();
			console.log('Game exit');
			console.log(this.itemCollector.items);
		});
	}

}

module.exports = Game;