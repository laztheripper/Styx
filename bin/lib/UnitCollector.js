const BitReader = require('./BitReader');
const Unit = require('./Unit');

class UnitCollector extends require('events') {
	constructor(game) {
		super();
		this.game = game;
		this.collection = {
			0: {}, // Players
			1: {}, // Mobs, NPCs, Hirelings, Summons
			2: {}, // Tile entities
			3: {}, // Missiles
			4: {}, // Items
			5: {}, // Warps
		};
		this.collect();
		delete this.collect;
	}

	collect() {
		//const fetchUnit = callback => ({packetData}) =>
		//	(unit =>
		//		unit && callback(unit, packetData)
		//	)(this.collection.find(
		//		unit => unit.uid === packetData.UnitId && unit.type === packetData.UnitType)
		//	);
		
		// Just to set up
		//this.game.gameServer.on(0x15 /* Reassign */, fetchUnit((unit, packetData) => {
		//	unit.x = packetData.X;
		//	unit.y = packetData.Y;
		//}));
		
		// Remove units
		this.game.gameServer.on(0x0A /* Remove Unit */, ({packetData}) => {
			try { delete this.collection[packetData.UnitType][packetData.UnitId] } catch (e) {}
		});

	}

	destroy() {
		for (let unitType in this.collection) this.collection[unitType] = {};
		this.game = null;
	}

	add(newUnit) {
		this.collection[newUnit.UnitType][newUnit.UnitId] = newUnit;
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
}

module.exports = UnitCollector;