const BitReader = require('./BitReader');
const Unit = require('./Unit');

class UnitCollector extends require('events') {
	constructor(game) {
		super();
		this.game = game;
		this.collection = [];
		this.collectData();
		delete this.collectData;
	}

	collectData() {
		const fetchUnit = callback =>
			({packetData}) =>
				(unit =>
						unit && callback(unit, packetData)
				)(this.collection.find(
					unit => unit.uid === packetData.UnitId && unit.type === packetData.UnitType)
				);
		// Just to set up
		this.game.gameServer.on(0x15/*Reassign*/, fetchUnit((unit, packetData) => {
			unit.x = packetData.X;
			unit.y = packetData.Y;
		}));
		// Remove units
		this.game.gameServer.on(0x0A/*Remove Object.    */, fetchUnit((unit, packetData) => this.collection.splice(this.collection.indexOf(unit), 1)));

		this.game.gameServer.on(0x0B/*Game Handshake. */, fetchUnit((unit, packetData) => {
			console.log();
		}));
		this.game.gameServer.on(0x0C/*NPC Hit.       */, fetchUnit((unit, packetData) => {
			if (this.game.me.uid === packetData.uid) {
				// ToDo; Do something with the hit state of us (calculate how long it takes whatever)
				console.log();
			}
		}));
		this.game.gameServer.on(0x0D/*Player Stop.    */, fetchUnit((unit, packetData) => {
			unit.x = packetData.X;
			unit.y = packetData.Y;
			if (this.game.me === unit && packetData.X + packetData.Y !== unit.x + unit.y) {
				// We are desyncing.
				const sendBuff = Buffer.alloc(11);
				sendBuff.writeUInt8(0x15, 0); // reassign
				sendBuff.writeUInt8(0, 1); // Unit type
				sendBuff.writeUInt32LE(unit.uid, 2); // Unit uid
				sendBuff.writeUInt16LE(packetData.X, 2 + 4); // New x pos
				sendBuff.writeUInt16LE(packetData.Y, 2 + 4 + 2);
				sendBuff.writeUInt16LE(0x01 /*warp*/, 2 + 4 + 2 + 2);
				this.game.diabloProxy.client.write(sendBuff); // Send the client the reassign packet
			}
			unit.emit('stop'); // In case we track the unit walking
		}));
		this.game.gameServer.on(0x0E/*Object State.    */, fetchUnit((unit, packetData) => {
			console.log();
			//ToDO; make
		}));
		this.game.gameServer.on(0x0F/*Player Move.    */, fetchUnit((unit, packetData) => {
			console.log();
		}));
		this.game.gameServer.on(0x10/*Player ToTarget.  */, fetchUnit((unit, packetData) => {
			console.log();
		}));

	}

	destroy() {
		this.collection.splice(0, this.items.length);
		this.game = null;
	}

	add(newUnit) {
		this.collection.push(newUnit);
		this.emit('new', newUnit);
	}

	fromPacket(buffer) {
		let br = new BitReader(buffer);
		br.pos = 8; // The first byte is the packet identifyer
		let self = {};
		Object.defineProperties(self, BitReader.shortHandBr(br));

		//0xAC [DWORD Unit Id] [WORD Unit Code] [WORD X] [WORD Y] [BYTE Unit Life] [BYTE Packet Length] [VOID State Info]
		const unit = {
			UnitId: self.dword,
			UnitType: 1, // Npc's are always monsters
			UnitCode: self.word,
			x: self.word,
			y: self.word,
			life: self.byte,
		};
		const length = self.byte;
		this.add(new Unit(...Object.keys(unit).map(key => unit[key])));

	}

	createMe() {
		const me = new Unit();
		me.isMe = true;
		this.collection.push(me);
		this.game.gameServer.once(0x59, ({packetData}) => {
			me.uid = packetData.UnitId;
			me.x = packetData.x;
			me.y = packetData.y;
			me.classid = packetData.CharType;
		});
		return me;
	}
}

module.exports = UnitCollector;