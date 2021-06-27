const GameServer = require('./GameServer');
const GameClient = require('./GameClient');
const UnitCollector = require('./UnitCollector');
const ItemCollector = require('./ItemCollector');
const Unit = require('./Unit');
const BufferHelper = require('./BufferHelper');
const { MenuAction, ChatType, ChatColor } = require('./Enums');
const { logPacket } = require('./Util');
const Project = require('../../package.json');
const Manager = require('./Manager');

class Game {
	constructor(diabloProxy, mcp) {
		this.diabloProxy = diabloProxy; // extends Events so every packet handled by the hook can be emitted to this.diabloProxy
		this.gameServer = new GameServer(this);
		this.gameClient = new GameClient(this);

		this.unitCollector = new UnitCollector(this);
		this.itemCollector = new ItemCollector(this);

		this.me = new Unit();
		this.merc = new Unit();
		this.collect(); // Do this in another function to prevent memory leaks
		delete this.collect; // Doesnt need to be called again
	}

	getMessage(msg, color, type, nick) {
		var i, buff, ind = 0;
		
		if (color === undefined) color = ChatColor.White;
		if (type === undefined) type = ChatType.Print;
		if (nick === undefined) nick = this.me.charname || 'Styx';

		buff = Buffer.alloc(10 + nick.length + 1 + msg.length + 1);
		buff.writeUInt8(0x26, ind++); // Chat msg
		buff.writeUInt8(type, ind++); // Chat type
		buff.writeUInt8(0x00, ind++); // Locale
		buff.writeUInt8(0x02, ind++); // Unit type?
		buff.writeUInt32LE(0x00, ind+=4); // Unit gid?
		buff.writeUInt8(color, ind++); // Chat color
		buff.writeUInt8(0x04, ind++); // Subtype
		for (i = 0; i < nick.length; i++) buff.writeUInt8(nick[i].charCodeAt(0), ind++);
		buff.writeUInt8(0x00, ind++);
		for (i = 0; i < msg.length; i++) buff.writeUInt8(msg[i].charCodeAt(0), ind++);
		buff.writeUInt8(0x00, ind++);

		this.getPacket(buff); // Send
	}

	getPacket(buffer) {
		if (!this.gameServer.lastBuff) {
			this.diabloProxy.client.write(buffer);
			return true;
		}

		this.diabloProxy.client.queue.push(buffer); // Don't insert a packet in the middle of a stream!
		return true;
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
			//console.log('0x81', this.merc);
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

		this.gameServer.on(0x26, ({packetData}) => {
			// Nada
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
			//console.log('0x5A', this.me); // Last one received related to `me`
			this.getMessage(Project.name + ' ' + Project.version, ChatColor.BrightWhite, ChatType.Print);
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

		this.gameServer.once(0xB0, _ => {
			this.destroy();
		});
	}

	destroy() {
		Object.keys(this).filter(key => this[key] && this[key].hasOwnProperty('destroy')).forEach(key => this[key].destroy()); // Doesn't work for some reason, but doesn't matter cause somehow there's no memory leaks. Wat
	}
}

module.exports = Game;