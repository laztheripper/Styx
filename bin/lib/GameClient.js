const BitReader = require('./BitReader');
const { logPacket } = require('./Util');

class GameClient extends require('events') {
	constructor(game) {
		super();
		this.game = game;
		this.game.diabloProxy.hooks.client.push(buffer => {
			//console.log(buffer.length, buffer);

			if (this.lastBuff) {
				if (this.lastBuff.length > 1260) {
					logPacket('Malformed packet stream: Client->Server', this.lastBuff);
				} else {
					buffer = Buffer.concat([this.lastBuff, buffer], this.lastBuff.length + buffer.length);
				}

				this.lastBuff = false;
			}

			while (buffer.length) {
				const size = GameClient.getPacketSize(buffer, buffer.length);
				if (size === -1) console.log(buffer.length, buffer);

				if (size === -1 || buffer.length - size < 0) {
					if (buffer.length > 0) { // Packet is truncated, append the truncated part to the next packet that arrives..
						this.lastBuff = buffer;
					} else {
						logPacket('Malformed packet: Server->Client', buffer);
					}

					break;
				}

				const packetBuffer = Buffer.alloc(size);
				buffer.copy(packetBuffer, 0, 0, size);
				buffer = buffer.slice(size, buffer.length);

				let packetData;
				packetData = GameClient.packetMap[packetBuffer[0]];
				packetData = packetData && packetData.hasOwnProperty('fromBuffer') ? packetData.fromBuffer(packetBuffer) : {PacketId: packetBuffer[0]};
				packetData.raw = packetBuffer;
				packetData.packetIdHex = packetData.PacketId.toString(16);

				this.emit(null, {packetData, game});
				this.emit(packetBuffer[0], {packetData, game});
				GameClient.hooks.forEach(hook => typeof hook === 'function' && hook.apply(this.game, [{raw: packetBuffer, ...packetData}]));
				if (packetBuffer[0] === 0xB0) break;
			}
		});
	}

	static clientPacketSizes = [
		1,	// 0x00
		5,	// 0x01
		9,	// 0x02
		5,	// 0x03
		9,	// 0x04
		5,	// 0x05
		9,	// 0x06
		9,	// 0x07
		5,	// 0x08
		9,	// 0x09
		9,	// 0x0A
		1,	// 0x0B
		5,	// 0x0C
		9,	// 0x0D
		9,	// 0x0E
		5,	// 0x0F
		9,	// 0x10
		9,	// 0x11
		1,	// 0x12
		9,	// 0x13
		-1,	// 0x14
		-1,	// 0x15
		13,	// 0x16
		5,	// 0x17
		17,	// 0x18
		5,	// 0x19
		9,	// 0x1A
		9,	// 0x1B
		3,	// 0x1C
		9,	// 0x1D
		9,	// 0x1E
		17,	// 0x1F
		13,	// 0x20
		9,	// 0x21
		5,	// 0x22
		9,	// 0x23
		5,	// 0x24
		9,	// 0x25
		13,	// 0x26
		9,	// 0x27
		9,	// 0x28
		9,	// 0x29
		9,	// 0x2A
		-1,	// 0x2B
		-1,	// 0x2C
		-1,	// 0x2D
		-1,	// 0x2E
		9,	// 0x2F
		9,	// 0x30
		9,	// 0x31
		17,	// 0x32
		17,	// 0x33
		5,	// 0x34
		17,	// 0x35
		9,	// 0x36
		5,	// 0x37
		13,	// 0x38
		5,	// 0x39
		3,	// 0x3A
		3,	// 0x3B
		9,	// 0x3C
		5,	// 0x3D
		5,	// 0x3E
		3,	// 0x3F
		1,	// 0x40
		1,	// 0x41
		-1,	// 0x42
		-1,	// 0x43
		17,	// 0x44
		9,	// 0x45
		13,	// 0x46
		13,	// 0x47
		1,	// 0x48
		9,	// 0x49
		-1,	// 0x4A
		9,	// 0x4B
		5,	// 0x4C
		3,	// 0x4D
		-1,	// 0x4E
		7,	// 0x4F
		9,	// 0x50
		9,	// 0x51
		5,	// 0x52
		1,	// 0x53
		1,	// 0x54
		-1,	// 0x55
		-1,	// 0x56
		-1,	// 0x57
		3,	// 0x58
		17,	// 0x59
		-1,	// 0x5A
		-1,	// 0x5B
		-1,	// 0x5C
		7,	// 0x5D
		6,	// 0x5E
		5,	// 0x5F
		1,	// 0x60
		3,	// 0x61
		5,	// 0x62
		5,	// 0x63
		9,	// 0x64
		-1,	// 0x65
		-1,	// 0x66
		46,	// 0x67
		37,	// 0x68
		1,	// 0x69
		-1,	// 0x6A
		1,	// 0x6B
		-1,	// 0x6C
		13,	// 0x6D
		1,	// 0x6E
		-1,	// 0x6F
		1,	// 0x70
	];

	static getPacketSize(bytes, size, offset=0) {
		const packetId = bytes[0];

		switch (packetId) {
			case 0x14: // Overhead chat
			case 0x15: // Chat
				offset = 2; // Byte before first nullstring
				while (size - ++offset > 0) if (bytes.readUInt8(offset) === 0x00) break;
				while (size - ++offset > 0) if (bytes.readUInt8(offset) === 0x00)
					return offset + 2;
				break;
			
			case 0x6C:
				if (size > 6) return 1 + bytes[1] + 4 + 1; // byte id + byte chunks + dword fullsize + byte * chunks + byte terminator 
				break;

			default:
				if (packetId < GameClient.clientPacketSizes.length)
					return GameClient.clientPacketSizes[packetId];
				break;
		}

		return -1;
	};

	static hooks = [];
	static packetMap = {};
}

module.exports = GameClient;

const BYTE = 'byte', WORD = 'word', DWORD = 'dword', NULLSTRING = 'string';

let structs = [
	//{id: 0x01, TargetX: WORD, TargetY: WORD,}, // D2GS_WALKTOLOCATION
	//{id: 0x02, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_WALKTOENTITY
	//{id: 0x03, TargetX: WORD, TargetY: WORD,}, // D2GS_RUNTOLOCATION
	//{id: 0x04, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_RUNTOENTITY
	//{id: 0x05, TargetX: WORD, TargetY: WORD,}, // D2GS_LEFTSKILLONLOCATION
	//{id: 0x06, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_LEFTSKILLONENTITY
	//{id: 0x07, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_LEFTSKILLONENTITYEX
	//{id: 0x08, TargetX: WORD, TargetY: WORD,}, // D2GS_LEFTSKILLONLOCATIONEX
	//{id: 0x09, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_LEFTSKILLONENTITYEX2
	//{id: 0x0A, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_LEFTSKILLONENTITYEX3
	//{id: 0x0C, TargetX: WORD, TargetY: WORD,}, // D2GS_RIGHTSKILLONLOCATION
	//{id: 0x0D, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_RIGHTSKILLONENTITY
	//{id: 0x0E, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_RIGHTSKILLONENTITYEX
	//{id: 0x0F, TargetX: WORD, TargetY: WORD,}, // D2GS_RIGHTSKILLONLOCATIONEX
	//{id: 0x10, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_RIGHTSKILLONENTITYEX2
	//{id: 0x11, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_RIGHTSKILLONENTITYEX3
	//{id: 0x12,}, // D2GS_SET_INFERNO_STATE
	//{id: 0x13, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_INTERACTWITHENTITY
	//{id: 0x14, Type: BYTE, LanguageCode: BYTE, Message: NULLSTRING, Target: NULLSTRING, Unknown: NULLSTRING,}, // D2GS_OVERHEADMESSAGE
	//{id: 0x15, Type: BYTE, LanguageCode: BYTE, Message: NULLSTRING, Target: NULLSTRING, Unknown: NULLSTRING,}, // D2GS_CHAT
	//{id: 0x16, ItemType: DWORD, ItemGUID: DWORD, bCursor: DWORD,}, // D2GS_PICKUPITEM
	//{id: 0x17, ItemGUID: DWORD,}, // D2GS_DROPITEM
	//{id: 0x18, ItemGUID: DWORD, TargetX: DWORD, TargetY: DWORD, Buffer: DWORD,}, // D2GS_ITEMTOBUFFER
	//{id: 0x19, ItemGUID: DWORD,}, // D2GS_PICKUPBUFFERITEM
	//{id: 0x1A, ItemGUID: DWORD, BodyLocation: DWORD,}, // D2GS_ITEMTOBODY
	//{id: 0x1B, ItemGUID: DWORD, BodyLocation: DWORD,}, // D2GS_SWAP2HANDEDITEM
	//{id: 0x1C, BodyLocation: WORD,}, // D2GS_PICKUPBODYITEM
	//{id: 0x1D, ItemGUID: DWORD, BodyLocation: DWORD,}, // D2GS_SWITCHBODYITEM
	//{id: 0x1E, ItemGUID: DWORD, BodyLocation: DWORD,}, // D2GS_SWITCH1H_2H
	//{id: 0x1F, ItemCursorGUID: DWORD, ItemTargetGUID: DWORD, TargetX: DWORD, TargetY: DWORD,}, // D2GS_SWITCHINVENTORYITEM
	//{id: 0x20, ItemGUID: DWORD, ItemX: DWORD, ItemY: DWORD,}, // D2GS_USEITEM
	//{id: 0x21, ItemCursorGUID: DWORD, ItemTargetGUID: DWORD,}, // D2GS_STACKITEM
	//{id: 0x22, ItemGUID: DWORD,}, // D2GS_REMOVESTACKITEM
	//{id: 0x23, ItemGUID: DWORD, Location: DWORD,}, // D2GS_ITEMTOBELT
	//{id: 0x24, ItemGUID: DWORD,}, // D2GS_REMOVEBELTITEM
	//{id: 0x25, ItemCursorGUID: DWORD, ItemTargetGUID: DWORD,}, // D2GS_SWITCHBELTITEM
	//{id: 0x26, ItemGUID: DWORD, bOnMerc: DWORD, Unused: DWORD,}, // D2GS_USEBELTITEM
	//{id: 0x27, ItemGUID: DWORD, ScroolGUID: DWORD,}, // D2GS_IDENTIFYITEM
	//{id: 0x28, ItemCursorGUID: DWORD, ItemTargetGUID: DWORD,}, // D2GS_INSERTSOCKETITEM
	//{id: 0x29, ItemCursorGUID: DWORD, ItemTargetGUID: DWORD,}, // D2GS_SCROLLTOTOME
	//{id: 0x2A, ItemCursorGUID: DWORD, CubeGUID: DWORD,}, // D2GS_ITEMTOCUBE
	//{id: 0x2F, ActionType: DWORD, UnitGUID: DWORD,}, // D2GS_NPC_INIT
	//{id: 0x30, ActionType: DWORD, UnitGUID: DWORD,}, // D2GS_NPC_CANCEL
	//{id: 0x31, UnitGUID: DWORD, MessageID: DWORD,}, // D2GS_QUESTMESSAGE
	//{id: 0x32, UnitGUID: DWORD, ItemGUID: DWORD, BuyType: DWORD, Cost: DWORD,}, // D2GS_NPC_BUY
	//{id: 0x33, NpcGUID: DWORD, ItemGUID: DWORD, Mode: BYTE, Padding[6]: BYTE,}, // D2GS_NPC_SELL
	//{id: 0x34, NpcGUID: DWORD,}, // D2GS_NPC_IDENTIFYITEMS
	//{id: 0x35, UnitGUID: DWORD, ItemGUID: DWORD, bRepairOne: DWORD, Unused: DWORD,}, // D2GS_REPAIR
	//{id: 0x36, UnitGUID: DWORD, MercID: DWORD,}, // D2GS_HIREMERC
	//{id: 0x37, ItemGUID: DWORD,}, // D2GS_IDENTIFYGAMBLE
	//{id: 0x38, Action: DWORD, UnitGUID: DWORD, Complement: DWORD,}, // D2GS_ENTITYACTION
	//{id: 0x3A, StatID: BYTE, CountSubOne: BYTE,}, // D2GS_ADDSTAT
	//{id: 0x3B, SkillID: WORD,}, // D2GS_ADDSKILL
	//{id: 0x3C, SkillID: WORD, Zero: BYTE, Hand: BYTE, ItemGUID: DWORD,}, // D2GS_SELECTSKILL
	//{id: 0x3D, UnitGUID: DWORD,}, // D2GS_UNKNOWN_3D
	//{id: 0x3E, ItemGUID: DWORD,}, // D2GS_ACTIVATEITEM
	//{id: 0x3F, PhraseID: WORD,}, // D2GS_CHARACTERPHRASE
	//{id: 0x40,}, // D2GS_UDPATEQUESTS
	//{id: 0x41,}, // D2GS_RESURRECT
	//{id: 0x44, OrificeType: DWORD, OrificeGUID: DWORD, StaffGUID: DWORD, EntityState: DWORD,}, // D2GS_STAFFINORIFICE
	//{id: 0x46, MercGUID: DWORD, UnitGUID: DWORD, UnitType: DWORD,}, // D2GS_MERC_INTERACT
	//{id: 0x47, MercGUID: DWORD, TargetX: WORD, PaddingX: WORD, TargetY: WORD, PaddingY: WORD,}, // D2GS_MERC_MOVE
	//{id: 0x48,}, // D2GS_BUSYSTATE_OFF
	//{id: 0x49, WaypointGUID: DWORD, Destination: DWORD,}, // D2GS_WAYPOINT
	//{id: 0x4B, UnitType: DWORD, UnitGUID: DWORD,}, // D2GS_REQUESTENTITYUPDATE
	//{id: 0x4C, ObjectGUID: DWORD,}, // D2GS_TRANSMORGIFY
	//{id: 0x4D, MonStatsId: WORD,}, // D2GS_PLAYNPCMESSAGE
	//{id: 0x4F, ButtonId: WORD, HiWORDGold: WORD, LoWORDGold: WORD,}, // D2GS_CLICKBUTTON
	//{id: 0x50, UnitGUID: DWORD, GoldAmount: DWORD,}, // D2GS_DROPGOLD
	//{id: 0x51, SkillID: BYTE, Hand: BYTE, Hotkey: WORD, ItemGUID: DWORD,}, // D2GS_BINDHOTKEY
	//{id: 0x53,}, // D2GS_STAMINA_ON
	//{id: 0x54,}, // D2GS_STAMINA_OFF
	//{id: 0x58, QuestID: WORD,}, // D2GS_QUESTCOMPLETED
	//{id: 0x59, UnitType: DWORD, UnitGUID: DWORD, TargetX: DWORD, TargetY: DWORD,}, // D2GS_MAKEENTITYMOVE
	//{id: 0x5D, ActionType: BYTE, bToggle: BYTE, PlayerGUID: DWORD,}, // D2GS_SQUELCH_HOSTILE
	//{id: 0x5E, ActionType: BYTE, PlayerGUID: DWORD,}, // D2GS_PARTY
	//{id: 0x5F, X: WORD, Y: WORD,}, // D2GS_UPDATEPLAYERPOS
	//{id: 0x60,}, // D2GS_SWAPWEAPON
	//{id: 0x61, Position: WORD,}, // D2GS_MERC_ITEM
	//{id: 0x62, UnitGUID: DWORD,}, // D2GS_MERC_RESSURECT
	//{id: 0x63, ItemGUID: DWORD,}, // D2GS_ITEM_TOBELT
	//{id: 0x66, StreamSize: WORD, Stream[nStreamSize]: BYTE,}, // D2GS_WARDEN
	//{id: 0x67, GameName[16]: BYTE, GameType: BYTE, CharClass: BYTE, Template: BYTE, SelectedDiff: BYTE, CharName[16]: BYTE, Unknown4: WORD, eArenaFlags: DWORD, Unknown6: BYTE, Unknown7: BYTE, LanguageCode: BYTE,}, // D2GS_GAMELOGON_SP
	{id: 0x68, GameHash: DWORD, GameToken: WORD, CharClass: BYTE, MinorGameVersion: DWORD, VersionConstant: DWORD, Constant: DWORD, LanguageCode: BYTE, CharName: NULLSTRING,}, // D2GS_GAMELOGON_MULTI
	//{id: 0x69,}, // D2GS_LEAVEGAME
	//{id: 0x6A,}, // D2GS_REQUESTHOSTEDGAMES
	//{id: 0x6B,}, // D2GS_JOINGAME
	//{id: 0x6C, ChunkSize: BYTE, FullSize: DWORD, Bytes[nChunkSize]: BYTE, Terminator: BYTE,}, // D2GS_UPLOADSAVE
	//{id: 0x6D, TickCount: DWORD, Delay: DWORD, WardenOrZero: DWORD,}, // D2GS_PING
	//{id: 0x6E,}, // D2GS_FINDME_6E
	//{id: 0x70,}, // D2GS_FINDME_70
];

structs.forEach(({id, ...rest}) => {
	GameClient.packetMap[id] = rest;
	if (!GameClient.packetMap[id].hasOwnProperty('fromBuffer')) GameClient.packetMap[id].fromBuffer = buffer => {
		buffer = new BitReader(buffer);
		buffer.bit(8); // First the ID obv
		return Object.entries(GameClient.packetMap[id]).filter(([key]) => key !== 'fromBuffer').reduce((acc, [key, value]) => {
			switch (value) {
				case 'byte':
					acc[key] = buffer.readUInt8();
					break;
				case 'word':
					acc[key] = buffer.readUInt16LE();
					break;
				case 'dword':
					acc[key] = buffer.readUInt32LE();
					break;
			}
			return acc;
		}, {PacketId: id})
	}
});