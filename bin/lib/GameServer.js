const BitReader = require('./BitReader');
const {logPacket} = require('./Util');

class GameServer extends require('events') {
	constructor(game) {
		super();
		this.game = game;
		this.lastBuff = false;
		this.game.diabloProxy.hooks.server.push(buffer => {
			if (this.lastBuff) {
				if (this.lastBuff.length > 1260) {
					logPacket('Malformed packet stream: Server->Client', this.lastBuff);
				} else {
					buffer = Buffer.concat([this.lastBuff, buffer], this.lastBuff.length + buffer.length);
				}

				this.lastBuff = false;
			}

			//logPacket('Server->Client', buffer);

			while (buffer.length) {
				const size = GameServer.getPacketSize(buffer, buffer.length);

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
				//const packetBuffer = buffer.slice(0, size);
				buffer = buffer.slice(size, buffer.length);

				//if (packetBuffer[0] === 0x9C || packetBuffer[0] === 0x9D) {
				//	//logPacket('9c/9d: ', packetBuffer);
				//	console.log(packetBuffer);
				//}

				let packetData;
				packetData = GameServer.packetMap[packetBuffer[0]];
				packetData = packetData && packetData.hasOwnProperty('fromBuffer') ? packetData.fromBuffer(packetBuffer) : {PacketId: packetBuffer[0]};
				packetData.raw = packetBuffer;
				packetData.packetIdHex = packetData.PacketId.toString(16);

				this.emit(null, {packetData, game});
				this.emit(packetBuffer[0], {packetData, game});
				GameServer.hooks.forEach(hook => typeof hook === 'function' && hook.apply(this.game, [{raw: packetBuffer, ...packetData}]));
				if (packetBuffer[0] === 0xB0) break;
			}
		});
	}

	static serverPacketSizes = [
		1,	// 0x0
		8,	// 0x1
		1,	// 0x2
		12,	// 0x3
		1,	// 0x4
		1,	// 0x5
		1,	// 0x6
		6,	// 0x7
		6,	// 0x8
		11,	// 0x9
		6,	// 0xA
		6,	// 0xB
		9,	// 0xC
		13,	// 0xD
		12,	// 0xE
		16,	// 0xF
		16,	// 0x10
		8,	// 0x11
		26,	// 0x12
		14,	// 0x13
		18,	// 0x14
		11,	// 0x15
		-1,	// 0x16
		12,	// 0x17
		15,	// 0x18
		2,	// 0x19
		2,	// 0x1A
		3,	// 0x1B
		5,	// 0x1C
		3,	// 0x1D
		4,	// 0x1E
		6,	// 0x1F
		10,	// 0x20
		12,	// 0x21
		12,	// 0x22
		13,	// 0x23
		90,	// 0x24
		90,	// 0x25
		-1,	// 0x26
		40,	// 0x27
		103,// 0x28
		97,	// 0x29
		15,	// 0x2A
		-1,	// 0x2B
		8,	// 0x2C
		-1,	// 0x2D
		-1,	// 0x2E
		-1,	// 0x2F
		-1,	// 0x30
		-1,	// 0x31
		-1,	// 0x32
		-1,	// 0x33
		-1,	// 0x34
		-1,	// 0x35
		-1,	// 0x36
		-1,	// 0x37
		-1,	// 0x38
		-1,	// 0x39
		-1,	// 0x3A
		-1,	// 0x3B
		-1,	// 0x3C
		-1,	// 0x3D
		34,	// 0x3E
		8,	// 0x3F
		13,	// 0x40
		-1,	// 0x41
		6,	// 0x42
		-1,	// 0x43
		-1,	// 0x44
		13,	// 0x45
		-1,	// 0x46
		11,	// 0x47
		11,	// 0x48
		-1,	// 0x49
		-1,	// 0x4A
		-1,	// 0x4B
		16,	// 0x4C
		17,	// 0x4D
		7,	// 0x4E
		1,	// 0x4F
		15,	// 0x50
		14,	// 0x51
		42,	// 0x52
		10,	// 0x53
		3,	// 0x54
		-1,	// 0x55
		-1,	// 0x56
		14,	// 0x57
		7,	// 0x58
		26,	// 0x59
		40,	// 0x5A
		-1,	// 0x5B
		5,	// 0x5C
		6,	// 0x5D
		38,	// 0x5E
		5,	// 0x5F
		7,	// 0x60
		2,	// 0x61
		7,	// 0x62
		21,	// 0x63
		-1,	// 0x64
		7,	// 0x65
		7,	// 0x66
		16,	// 0x67
		21,	// 0x68
		12,	// 0x69
		12,	// 0x6A
		16,	// 0x6B
		16,	// 0x6C
		10,	// 0x6D
		1,	// 0x6E
		1,	// 0x6F
		1,	// 0x70
		1,	// 0x71
		1,	// 0x72
		32,	// 0x73
		10,	// 0x74
		13,	// 0x75
		6,	// 0x76
		2,	// 0x77
		21,	// 0x78
		6,	// 0x79
		13,	// 0x7A
		8,	// 0x7B
		6,	// 0x7C
		18,	// 0x7D
		5,	// 0x7E
		10,	// 0x7F
		4,	// 0x80
		20,	// 0x81
		29,	// 0x82
		-1,	// 0x83
		-1,	// 0x84
		-1,	// 0x85
		-1,	// 0x86
		-1,	// 0x87
		-1,	// 0x88
		2,	// 0x89
		6,	// 0x8A
		6,	// 0x8B
		11,	// 0x8C
		7,	// 0x8D
		10,	// 0x8E
		33,	// 0x8F
		13,	// 0x90
		26,	// 0x91
		6,	// 0x92
		8,	// 0x93
		-1,	// 0x94
		13,	// 0x95
		9,	// 0x96
		1,	// 0x97
		7,	// 0x98
		16,	// 0x99
		17,	// 0x9A
		7,	// 0x9B
		-1,	// 0x9C
		-1,	// 0x9D
		7,	// 0x9E
		8,	// 0x9F
		10,	// 0xA0
		7,	// 0xA1
		8,	// 0xA2
		24,	// 0xA3
		3,	// 0xA4
		8,	// 0xA5
		-1,	// 0xA6
		7,	// 0xA7
		-1,	// 0xA8
		7,	// 0xA9
		-1,	// 0xAA
		7,	// 0xAB
		-1,	// 0xAC
		-1,	// 0xAD
		-1,	// 0xAE
		2,	// 0xAF
		1,	// 0xB0
		-1, // 0xB1
		53, // 0xB2
		-1,	// 0xB3
		5	// 0xB4
	];

	/**
	 * @param {Buffer} bytes
	 * @param {number} size
	 * @param {number} offset
	 * @returns {number}
	 */
	static getPacketSize(bytes, size, offset = 0) {
		const packetId = bytes[0];

		switch (packetId) {
			case 0x26: // Chat msg
				offset = 9;
				while (size - ++offset > 0) if (bytes.readUInt8(offset) === 0x00) break;
				while (size - ++offset > 0) if (bytes.readUInt8(offset) === 0x00)
					return offset + 1;
				break;

			case 0x5B: // Player in game
				if (size >= 3) return bytes.readUInt16LE(offset + 1);
				break;

			case 0x94:
				if (size >= 2) return bytes[1] * 3 + 6;
				break;

			case 0xA8: // Set state
				if (size >= 7) return bytes[6];
				break;

			case 0xAA: // Add unit
				if (size >= 7) return bytes[6];
				break;

			case 0xAC: // Assign NPC
				if (size >= 13) return bytes[12];
				break;

			case 0xAE: // Warden request
				if (size >= 3) return bytes.readUInt16LE(offset + 1) + 1;
				break;

			case 0x3E: // 62 Item change
				if (size >= 2) return bytes[offset + 1];
				break;

			case 0x9C: // Item (in the world)
			case 0x9D: // Item (from unit)
				if (size >= 3) return bytes[offset + 2];
				break;

			case 0xBA: // Unknown
				return 1; // Best estimation so far
			case 0xFF:
				return 12;
			
			default:
				if (packetId < GameServer.serverPacketSizes.length)
					return GameServer.serverPacketSizes[packetId];
				break;
		}

		return -1;
	};

	static hooks = [];
	static packetMap = {}; // Filled in below
}

module.exports = GameServer;

const BYTE = 'byte', WORD = 'word', DWORD = 'dword', NULLSTRING = 'string';

let structs = [
	{id: 0x00,}, // Loading
	{id: 0x01, Difficulty: BYTE, ArenaFlags: DWORD, Expansion: BYTE, Ladder: BYTE,}, // Game flags
	{id: 0x02,}, // Load success
	{id: 0x03, Act: BYTE, Map_ID: DWORD, Area_Id: WORD, Unknown: DWORD,}, // Load act
	{id: 0x04,}, // Load complete
	{id: 0x05,}, // Unload complete
	{id: 0x06,}, // Game exit success
	//{id: 0x07, Tile_X: WORD, Tile_Y: WORD, AreaId: BYTE,},
	//{id: 0x08, Tile_X: WORD, Tile_Y: WORD, AreaId: BYTE,},
	//{id: 0x09, WarpType: BYTE, WarpGid: DWORD, WarpClassId: BYTE, WarpX: WORD, WarpY: WORD,},
	{id: 0x0A, UnitType: BYTE, UnitId: DWORD,}, // Remove unit
	{id: 0x0B, UnitType: BYTE, UnitId: DWORD,}, // Game handshake
	//{id: 0x0C, UnitType: BYTE, UnitId: DWORD, AnimationId: WORD, Life: BYTE,}, // NPC hit
	//{id: 0x0D, UnitType: BYTE, UnitId: DWORD, Unknown: BYTE, UnitX: WORD, UnitY: WORD, Unknown2: BYTE, Life: BYTE,}, // Player stop
	//{id: 0x0E, UnitType: BYTE, UnitGUID: DWORD, PortalFlags: BYTE, FlagIsTargetable: BYTE, UnitState: DWORD,}, // Unit state
	//{id: 0x0F, UnitType: BYTE, UnitId: DWORD,/*0x01 = Walk || 0x23 = Run || 0x20 = Knockback*/WalkType: BYTE, TargetX: WORD, TargetY: WORD, null: BYTE, CurrentX: WORD, CurrentY: WORD,},
	//{id: 0x10, UnitType: BYTE, UnitId: DWORD,/*0x02 = Walk || 0x24 = Run*/WalkType: BYTE, TargetType: BYTE, TargetId: DWORD, CurrentX: WORD, CurrentY: WORD,},
	//{id: 0x11, UnitType: BYTE, UnitId: DWORD, Unknown: WORD,},
	//{id: 0x15, UnitType: BYTE, UnitId: DWORD, X: WORD, Y: WORD, /*0x01 = True || 0x00 = False*/bool: BYTE,}, // Reassign player
	//{id: 0x16, Unknown: BYTE, Unknown: BYTE, Count: BYTE, ARRAY[Count] (UnitType: BYTE, UnitGid: DWORD,X: WORD,Y: WORD,)},
	//{id: 0x17, UnitType: BYTE, UnitGid: DWORD, bUnknown0: BYTE, bUnknown1: BYTE, wUnknown2: WORD, wUnknown3: WORD,},
	//{id: 0x18, [BITS[15] HP] [BITS[15] MP] [BITS[15] Stamina] [BITS[7] HPRegen] [BITS[7] MPRegen] [BITS[16] x] [BITS[16] y] [BITS[8] Vx] [ BITS[8] Vy]},
	//{id: 0x19, Amount: BYTE,}, // Gold to inv
	//{id: 0x1A, Amount: BYTE,}, // Add exp
	//{id: 0x1B, Amount: WORD,}, // Add exp
	//{id: 0x1C, Amount: DWORD,}, // Add exp
	//{id: 0x1D, Attribute: BYTE, Amount: BYTE,}, // Base attr
	//{id: 0x1E, Attribute: BYTE, Amount: WORD,}, // Base attr
	//{id: 0x1F, Attribute: BYTE, Amount: DWORD,}, // Base attr
	//{id: 0x20, UnitId: DWORD, Attribute: BYTE, Amount: DWORD,},  // Attr update
	//{id: 0x21, Unknown: WORD, UnitId: DWORD, Skill: WORD, BaseLevel: BYTE, BonusAmount: BYTE, Unknown2: BYTE,}, // Update item oskill
	//{id: 0x22, Unknown/*(UnitType?)*/: WORD, UnitId: DWORD, Skill: WORD, Amount: BYTE, Unknown2: WORD,}, // Update item skill
	//{id: 0x23, UnitType: BYTE, UnitGid: DWORD, Hand/*(R=0, L =1)*/: BYTE, Skill: WORD, ItemGid: DWORD,}, // Set skill
	{id: 0x26, ChatType: BYTE, LocaleId: BYTE, UnitType: BYTE, UnitGid: DWORD, ChatColor: BYTE, ChatSubType: BYTE, Nick: NULLSTRING, Message: NULLSTRING,},
	//{id: 0x27, UnitType: BYTE, UnitId: DWORD,  Count: BYTE, Unknown: BYTE, ARRAY[Count] (Show: BYTE, Unused: BYTE, MessageId: WORD, )},
	//{id: 0x28, UpdateType: BYTE, UnitGid: DWORD, Timer: BYTE, ARRAY[96] (QuestBit: BYTE,)},
	//{id: 0x29, 96: BYTE, QuestBit},
	//{id: 0x2A, TradeType: BYTE, Result: BYTE, Unknown: DWORD, NpcGid: DWORD, GoldInInventory: DWORD,}, // NPC transaction
	//{id: 0x2C, UnitType: BYTE, UnitId: DWORD, Sound: WORD,}, // Play sound
	//{id: 0x3E, *}, // Update item stats
	//{id: 0x3F, SellIcon: BYTE, ItemGid: DWORD, SkillId: WORD,}, // Use stackable item
	//{id: 0x40, ItemGid: DWORD, Unknown: DWORD, Unknown2: DWORD,},
	//{id: 0x42, UnitType: BYTE, PlayerId: DWORD,}, // Clear cursor
	//{id: 0x47, UnitType: BYTE, Gap: BYTE, UnitId: DWORD, Unused: DWORD,},
	//{id: 0x48, UnitType: BYTE, Gap: BYTE, UnitId: DWORD, Unused: DWORD,},
	//{id: 0x4C, UnitType: BYTE, UnitId: DWORD, Skill: WORD, Unknown: BYTE, Unknown2: BYTE, TargetId: DWORD, NULL: WORD,},
	//{id: 0x4D, UnitType: BYTE, UnitId: DWORD, Skill: DWORD, Unknown: BYTE, X: WORD, Y: WORD, NULL: WORD},
	//{id: 0x4E, MercNameString: WORD, Seed: DWORD,},
	//{id: 0x4F,},
	//{id: 0x50, MessageType: WORD, Argument: WORD[6],},
	//{id: 0x51, ObjectType: BYTE, ObjectId: DWORD, ObjectCode: WORD, X: WORD, Y: WORD, State: BYTE, InteractionType: BYTE,},
	//{id: 0x52, 41: BYTE, QuestArray},
	//{id: 0x53, ActTBC: DWORD, AngleTBC: DWORD, Darkness: BYTE,},
	//{id: 0x57, MonsterGid: DWORD, MonsterType: BYTE, MonsterNameIDX: WORD, anEnchant1: BYTE, anEnchant2: BYTE, anEnchant3: BYTE, Filler: BYTE, MonsterIsChampion: WORD,},
	//{id: 0x58, UnitGid: DWORD, UIType: BYTE, Bool: BYTE,},
	{id: 0x59, UnitId: DWORD, CharType: BYTE, CharName: NULLSTRING, X: WORD, Y: WORD,}, // Assign Player
	{id: 0x5A, MessageType: BYTE, Color: BYTE, Arg: DWORD, ArgTypes: BYTE, Name1: NULLSTRING, NAME2: NULLSTRING,}, // Event message
	//{id: 0x5B, PacketLength: WORD, PlayerId: DWORD, CharType: BYTE, CharName: NULLSTRING, CharLvl: WORD, PartyId: WORD, NULL: DWORD, NULL2: DWORD}, // Player joined
	//{id: 0x5C, PlayerId: DWORD,}, // Player left
	//{id: 0x5D, QuestId: BYTE, AlertFlags: BYTE, FilterStatus: BYTE, Extra: WORD,},
	//{id: 0x5E, 37: BYTE, Quest]},
	//{id: 0x5F, Unknown: DWORD,},
	//{id: 0x60, State: BYTE, AreaId: BYTE, UnitId: DWORD,},
	//{id: 0x61, Act: BYTE,},
	//{id: 0x62, UnitType: BYTE, UnitGid: DWORD, Unused: BYTE,},
	//{id: 0x63, WaypointGid: DWORD, SetOrDel: WORD, Waypoint1: DWORD, Waypoint2: DWORD, NULL: DWORD, NULL2: DWORD},
	//{id: 0x65, PlayerId: DWORD, Count: WORD,},
	//{id: 0x67, NpcGid: DWORD, /*0x01 = Walk || 0x17 = Run*/RunType: BYTE, X: WORD, Y: WORD, Unknown: WORD, Unknown2: BYTE, Unknown3: WORD, Unknown4: BYTE,},
	//{id: 0x68, NpcGid: DWORD, RunType: BYTE,/*0x00 = Walk || 0x18 = Run*/X: WORD, Y: WORD, TargetUnitType: BYTE, TargetId: DWORD, Unknown: WORD, Unknown2: BYTE, Unknown3: WORD, Unknown4: BYTE,},
	//{id: 0x69, NpcGid: DWORD, State: BYTE, X: WORD, Y: WORD, UnitLife: BYTE, Unknown: BYTE,},
	//{id: 0x6A, NpcGid: DWORD, Unknown0: BYTE, Unknown1: BYTE, Unknown2: DWORD, Unknown3: BYTE,},
	//{id: 0x6B, NpcGid: DWORD, Action: BYTE, NULL: DWORD, NULL2: WORD, X: WORD, Y: WORD,},
	//{id: 0x6C, NpcGid: DWORD, AttackType: WORD, TargetId: DWORD, TargetType: BYTE, X: WORD, Y: WORD,},
	//{id: 0x6D, NpcGid: DWORD, X: WORD, Y: WORD, UnitLife: BYTE,},
	//{id: 0x73, Unused: DWORD, Unknown: WORD, Unknown2: DWORD, Unknown3: DWORD, Unknown4: DWORD, Unknown5: DWORD, Unknown6: WORD, OwnerType: BYTE, OwnerGid: DWORD, Unknown7: BYTE, PierceIdxValue: BYTE,},
	//{id: 0x74, Assign: BYTE, OwnerId: DWORD, CorpseId: DWORD,},
	//{id: 0x75, UnitId: DWORD, PartyId: WORD, CharLevel: WORD, Relationship: WORD, InYourParty: WORD,},
	//{id: 0x76, UnitType: BYTE, UnitId: BYTE,},
	{id: 0x77, Action: BYTE,}, // Menu action
	{id: 0x78, CharName: NULLSTRING, UnitId: DWORD,}, // Trade initiated with *player*
	//{id: 0x79, GoldOwner: BYTE, Amount: DWORD,},
	//{id: 0x7A, ChangeType: BYTE, Skill: BYTE, PetType: WORD, OwnerId: DWORD, PetId: DWORD,},
	//{id: 0x7B, Slot: BYTE, Skill: BYTE, /*0x00 = Right || 0x80 = Left*/Type: BYTE, Item: DWORD},
	//{id: 0x7C, Type: BYTE, ItemId: DWORD,},
	{id: 0x7D, UnitType: BYTE, UnitGid: DWORD, ItemGid: DWORD, AndValue: DWORD, dwFlagsAfterAnd: DWORD,}, // Set item flags
	//{id: 0x7E, Unknown: DWORD},
	//{id: 0x7F, UnitType: BYTE, UnitLife: WORD, UnitId: DWORD, UnitAreaId: WORD,},
	{id: 0x81, Unknown: BYTE, MercKind: WORD, OwnerId: DWORD, MercId: DWORD, Unknown2: DWORD, Unknown3: DWORD,},
	//{id: 0x82, OwnerGid: DWORD, OwnerName: NULLSTRING, PortalGid: DWORD, DestinationId: DWORD,},
	//{id: 0x89, EventId: BYTE,},
	//{id: 0x8A, UnitType: BYTE, UnitId: DWORD,},
	//{id: 0x8B, UnitId: DWORD, /*0x00 = No Party || 0x01 = In Party || 0x02 = Wants to Party*/PartyFlag: BYTE,},
	//{id: 0x8C, Player1Id: DWORD, Player2Id: DWORD, RelationState: WORD,},
	//{id: 0x8D, PlayerId: DWORD, PartyId: WORD,},
	//{id: 0x8E, /*0x00 = Unassign || 0x01 = Assign*/Type: BYTE, OwnerId: DWORD, CorpseId: DWORD,},
	//{id: 0x8F, [BYTES[32] 0x00]},
	//{id: 0x90, PlayerId: DWORD, PlayerX: DWORD, PlayerY: DWORD,},
	//{id: 0x91, ACT: BYTE, 12: WORD, Str/NPCId]},
	//{id: 0x92, UnitType: BYTE, UnitGid: DWORD,},
	//{id: 0x93, PlayerGid: DWORD, signedUnknown: BYTE, Unknown: BYTE, Unknown2: BYTE,},
	//{id: 0x94, Count: BYTE, PlayerId: DWORD, ARRAY[Count] ( SkillId: WORD, Level: BYTE, )},
	//{id: 0x95, [BITS[15] HP] [BITS[15] MP] [BITS[15] Stamina] [BITS[7] HPRegen] [BITS[7] MPRegen] [BITS[16] x] [BITS[16] y] [BITS[8] Vx] [ BITS[8] Vy]},
	//{id: 0x96, [BITS[15] Stamina] [BITS[16] x] [BITS[16] y] [BITS[8 Vx] [BITS[8] Vy]},
	//{id: 0x97,},
	//{id: 0x98, UnitGid: DWORD, Value: WORD,},
	//{id: 0x99, AttackerType: BYTE, AttackerGid: DWORD, SkillId: WORD, SkillLevel: BYTE, TargetType: BYTE, TargetGid: DWORD, Unknown: WORD,},
	//{id: 0x9A, AttackerType: BYTE, AttackerGid: DWORD, SkillId: WORD, Unused: WORD, SkillLevel: BYTE, TargetX: WORD, TargetY: WORD, Unnown: WORD,},
	//{id: 0x9B, MercNameId: WORD, ReviveCost: DWORD,},
	//{id: 0x9C, *},
	//{id: 0x9D, *},
	//{id: 0x9E, StatId: BYTE, MercGid: DWORD, NewValue: BYTE,},
	//{id: 0x9F, StatId: BYTE, MercGid: DWORD, NewValue: WORD,},
	//{id: 0xA0, StatId: BYTE, MercGid: DWORD, NewValue: DWORD,},
	//{id: 0xA1, StatId: BYTE, MercGid: DWORD, AddValue: BYTE,},
	//{id: 0xA2, StatId: BYTE, MercGid: DWORD, AddValue: WORD,},
	//{id: 0xA3, AuraStat: BYTE, SkillId: WORD, SkillLevel: WORD, UnitType: BYTE, UnitGid: DWORD, TargetType: BYTE, TargetGid: DWORD, TargetX: DWORD, TargetY: DWORD,},
	//{id: 0xA4, ClassId: WORD,},
	//{id: 0xA5, UnitType: BYTE, UnitGid: DWORD, SkillId: WORD,},
	//{id: 0xA6,},
	//{id: 0xA7, UnitType: BYTE, UnitId: DWORD, State: BYTE,},
	//{id: 0xA8, UnitType: BYTE, UnitId: DWORD, PacketLength: BYTE, State: BYTE, [VOID State Effects]},
	//{id: 0xA9, UnitType: BYTE, UnitId: DWORD, State: BYTE,},
	//{id: 0xAA, UnitType: BYTE, UnitId: DWORD, PacketLength: BYTE, [VOID State Info]},
	//{id: 0xAB, UnitType: BYTE, UnitId: DWORD, UnitLife: BYTE,},
	//{id: 0xAC, UnitId: DWORD, UnitCode: WORD, X: WORD, Y: WORD, UnitLife: BYTE, PacketLength: BYTE, [VOID State Info]},
	//{id: 0xAE, LengthNoHeader: WORD, [VOID Data]},
	{id: 0xAF, Compression: BYTE,},
	{id: 0xB0,}, // Game disconnected
	{id: 0xB2, Unk1: NULLSTRING, Unk2: NULLSTRING, Unk3: NULLSTRING, nClientsCount: WORD, nGameToken: WORD,}, // Gameinfo
	//{id: 0xB3, ChunkSize: BYTE, FirstPart: BOOL, FullSize: DWORD, ChunkSize2: BYTE, RawBytes},
	{id: 0xB4, Reason: DWORD,}, // Timeout
];

structs.forEach(({id, ...rest}) => {
	GameServer.packetMap[id] = rest;
	if (!GameServer.packetMap[id].hasOwnProperty('fromBuffer')) GameServer.packetMap[id].fromBuffer = buffer => {
		buffer = new BitReader(buffer);
		buffer.bit(8); // First the ID obv
		return Object.entries(GameServer.packetMap[id]).filter(([key]) => key !== 'fromBuffer').reduce((acc, [key, value]) => {
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
