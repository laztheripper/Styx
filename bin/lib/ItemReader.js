/**
 * @description Reads an item from the packet
 *
 * @Author Jaenster
 * @credits Awesom-O source code helped me allot.
 */

const BitReader = require('./BitReader');
const {ItemFlags, ItemContainer, EquipmentLocation, ItemActionType, ItemQuality, ItemDestination, ItemAffixType} = require('./Enums');
const {ReanimateStat, ElementalSkillsBonusStat, ClassSkillsBonusStat, AuraStat, SkillBonusStat, ChargedSkillStat, SkillOnEventStat, SkillTabBonusStat, PerLevelStat, DamageRangeStat, ColdDamageStat, PoisonDamageStat, ReplenishStat, SignedStat, UnsignedStat,} = require('./StatTypes');
const {
	// Tables
	BaseItem,
	ItemType,
	ItemStat,
	RarePrefix,
	RareSuffix,
	MagicPrefix,
	MagicSuffix,
	SetItem,
	Color,
	Runeword,
	
	// Dicts
	BaseCodeIndex,
	TypeCodeIndex,
	ItemStatIndex,
	SetItemIndex,
	SetCodeIndex,
	ColorCodeIndex,
	RunewordIndex,
} = require('./Tables');

items = [
	'9C 04 34 01 06 00 00 00 11 08 80 04 64 00 0C 52 47 07 07 32 ED 90 1D 28 0B F1 D4 98 0D FF 1F 2E B0 85 E7 FF 07 82 59 71 80 09 86 B1 11 FC 11 37 03 1E F2 1F',
//	'9C 04 30 06 CF 00 00 00 10 00 80 00 65 00 0C 32 26 76 07 82 90 21 0A 19 22 BF 11 35 8B 51 1E 48 3E 4C C0 E2 42 80 81 00 E7 91 67 C8 1E 6E FE 03', // Rare bow
//	'9C 04 1B 01 A8 00 00 00 10 00 80 00 65 00 0C 12 57 97 06 82 40 10 08 18 10 F8 0F', // Cracked Quilted Armor
//	'9C 04 1A 05 A0 00 00 00 10 00 80 00 65 00 0E 42 76 26 07 02 41 80 02 01 FF 01', // cRUDE DAGGER
//	'9C 04 1D 01 94 00 00 00 10 00 80 00 65 00 0C 22 E7 76 06 02 C6 A0 1D 68 68 80 F0 E0 3F', // 15% ed sup ring mail
//	'9C 04 1E 05 92 00 00 00 10 00 80 00 65 00 10 82 16 86 07 02 06 01 80 6F 70 70 A8 20 FC 07', // magic hand axe of worth
	//'9c 04 14 10 46 8b fd dd 10 00 a0 00 65 00 32 22 27 53 03 02',
	//'9c 04 14 10 a3 a5 fe 6e 10 00 a0 00 65 00 50 22 27 33 03 02',
	//'9c 04 14 10 d1 32 7f a7 10 00 a0 00 65 00 70 22 27 33 03 02',
	//'9c 04 14 10 68 99 bf c3 10 00 a0 00 65 00 30 22 27 33 03 02',
	//'9c 04 2c 10 b4 ac df 61 10 00 80 00 65 00 60 a2 56 76 07 02 a8 25 55 be b8 d8 29 d3 81 80 52 05 c3 42 e2 82 81 21 f1 c9 00 95 f8 0f',
//	'9c 0e 14 10 5a b6 ef 30 10 00 a2 00 65 08 00 80 06 17 03 02',
	//'9c 04 1a 05 2d bb 77 18 10 08 80 00 02 00 aa ca 56 76 06 02 83 20 24 42 fe 03',
	//'9c 04 14 10 96 bd 3b 9c 10 00 a2 00 65 00 52 92 36 37 06 02',
	//'9d 06 21 05 cb be 1d 4e 00 46 8b fd dd 11 00 82 00 65 84 08 30 37 47 07 82 80 40 41 61 0d 89 fc 07'
];

class ItemAffix {
	constructor(type, index) {
		this.index = index;
		this.type = type;

		if (this.type < 3) {
			throw new Error('Invalid type for item affix');
		}

		if ((this.type & 3) === 0) {
			switch (this.type) {
				case ItemAffixType.Inferior:
				case ItemAffixType.Superior:
				case ItemAffixType.Magic:
					this.type |= ItemAffixType.Prefix;
					break;
				case ItemAffixType.Rare:
					if (this.index < RareSuffix.length) {
						this.type |= ItemAffixType.Suffix;
					} else {
						this.type |= ItemAffixType.Prefix;
						this.index -= RareSuffix.length;
					}
					break;
				default:
					throw new Error('Impossible affix type');
			}
		}
	}
}

class Item extends require('./Unit') {
	constructor(buffer) {
		super();
		this.packet = Buffer.alloc(buffer.length);
		buffer.copy(this.packet, 0);
		const br = new BitReader(buffer), item = {}, p = {};
		Object.defineProperties(p, BitReader.shortHandBr(br));
		br.pos = 8;

		this.type = 4;
		this.stats = {};
		this.action = p.byte;
		this.packetLength = p.byte;
		this.category = p.byte;
		this.uid = p.dword;

		if (buffer[0] === 0x9d) {
			this.ownerType = p.byte;
			this.ownerUID = p.dword;
		} else {
			this.ownerType = 0; // Its an private item, aka on us. We are an player
			this.ownerUID = 'myGID';
		}

		const flags = p.dword;
		this.flags = {
			None: (flags & ItemFlags.None) === ItemFlags.None,
			Equipped: (flags & ItemFlags.Equipped) === ItemFlags.Equipped,
			InSocket: (flags & ItemFlags.InSocket) === ItemFlags.InSocket,
			Identified: (flags & ItemFlags.Identified) === ItemFlags.Identified,
			x20: (flags & ItemFlags.x20) === ItemFlags.x20,
			SwitchedIn: (flags & ItemFlags.SwitchedIn) === ItemFlags.SwitchedIn,
			SwitchedOut: (flags & ItemFlags.SwitchedOut) === ItemFlags.SwitchedOut,
			Broken: (flags & ItemFlags.Broken) === ItemFlags.Broken,
			Duplicate: (flags & ItemFlags.Duplicate) === ItemFlags.Duplicate,
			Socketed: (flags & ItemFlags.Socketed) === ItemFlags.Socketed,
			OnPet: (flags & ItemFlags.OnPet) === ItemFlags.OnPet,
			x2000: (flags & ItemFlags.x2000) === ItemFlags.x2000,
			NotInSocket: (flags & ItemFlags.NotInSocket) === ItemFlags.NotInSocket,
			Ear: (flags & ItemFlags.Ear) === ItemFlags.Ear,
			StartItem: (flags & ItemFlags.StartItem) === ItemFlags.StartItem,
			Simple: (flags & ItemFlags.Simple) === ItemFlags.Simple,
			Ethereal: (flags & ItemFlags.Ethereal) === ItemFlags.Ethereal,
			Any: (flags & ItemFlags.Any) === ItemFlags.Any,
			Personalized: (flags & ItemFlags.Personalized) === ItemFlags.Personalized,
			Gamble: (flags & ItemFlags.Gamble) === ItemFlags.Gamble,
			Runeword: (flags & ItemFlags.Runeword) === ItemFlags.Runeword,
			x8000000: (flags & ItemFlags.x8000000) === ItemFlags.x8000000,
		};

		this.version = p.byte;
		this.unknown1 = p.bits(2);
		this.destination = p.bits(3);

		if (this.destination === ItemDestination.Ground) {
			this.x = p.word;
			this.y = p.word;
		} else {
			this.location = p.bits(4);
			this.x = p.bits(4);
			this.y = p.bits(4);
			this.container = p.bits(3);
		}

		if (this.action === ItemActionType.AddToShop || this.action === ItemActionType.RemoveFromShop) {
			let buff = this.container | 0x80;
			if ((buff & 1) === 1) {
				buff--;
				this.y += 8;
			}
			this.container = buff;
		} else if (this.container === ItemContainer.Unspecified) {
			if (this.location === EquipmentLocation.NotApplicable) {
				if ((flags & ItemFlags.InSocket) === ItemFlags.InSocket) {
					this.container = ItemContainer.Item;
					this.y = -1;
				} else if (this.action === ItemActionType.PutInBelt || this.action === ItemActionType.RemoveFromBelt) {
					this.container = ItemContainer.Belt;
					this.y = this.x / 4;
					this.x = this.x % 4;
				}
			} else {
				this.x = -1;
				this.y = -1;
			}
		}

		if (this.flags.Ear) {
			this.charClass = p.bits(3);
			this.level = p.bits(7);
			this.name = p.string();
			this.code = 'ear';
			this.classid = 556;
			return;
		}

		this.code = p.string(3);
		p.bits(8);
		this.classid = BaseCodeIndex[this.code];
		const baseItem = BaseItem[this.classid];

		if (this.classid === 523) { // Gold
			this.stats.Quantity = p.bits(p.bit ? 32 : 12);
			return;
		}
		
		const itemTypeIndex = TypeCodeIndex[baseItem.type];
		const itemType = ItemType[itemTypeIndex];

		if (this.hasType('blun')) {
			this.addStat('itemundeaddamagepercent', 50);
		}

		if (this.flags.Socketed) {
			this.usedSockets = p.bits(3);
		} else {
			p.bits(3);
		}

		if (this.flags.Simple || this.flags.Gamble) {
			return;
		}

		this.level = p.bits(7); // illvl
		this.quality = p.bits(4); // quality
		if (p.boolean) this.graphic = p.bits(3); // Graphic : 1 : 3+1
		if (p.boolean) this.autoMod = p.bits(11); // Automod : 1 : 11+1

		if (this.flags.Identified) {
			switch (this.quality) {
				case ItemQuality.Inferior:
					this.prefix = new ItemAffix(ItemAffixType.InferiorPrefix, p.bits(3)); // affix.type === what kind of inferior item ie: 0=crude, 1=cracked, 2=...
					break;

				case ItemQuality.Superior:
					this.prefix = new ItemAffix(ItemAffixType.SuperiorPrefix, p.bits(3));
					break;

				case ItemQuality.Magic:
					let prefixIndex = p.bits(11) - 1;
					if (prefixIndex >= 0) this.prefix = new ItemAffix(ItemAffixType.MagicPrefix, prefixIndex);
					let suffixIndex = p.bits(11) - 1;
					if (suffixIndex >= 0) this.suffix = new ItemAffix(ItemAffixType.MagicSuffix, suffixIndex);
					break;

				case ItemQuality.Rare:
				case ItemQuality.Crafted:
					this.prefix = new ItemAffix(ItemAffixType.Rare, p.bits(8) - 1);
					this.suffix = new ItemAffix(ItemAffixType.Rare, p.bits(8) - 1);
					break;

				case ItemQuality.Set:
					this.setItem = p.bits(12);
					break;

				case ItemQuality.Unique:
					if (this.code !== 'std') this.uniqueItem = p.bits(12);
					break;
			}
		} else {
			//if (this.quality === ItemQuality.Set) this.setItem = SetCodeIndex[this.code];
			//if (this.quality === ItemQuality.Unique) this.uniqueItem = UniqueCodeIndex[this.code];
		}

		if (this.quality === ItemQuality.Rare || this.quality === ItemQuality.Crafted) {
			this.magicPrefixes = [];
			this.magicSuffixes = [];

			for (let i = 0; i < 3; i++) {
				if (p.boolean) {
					let prefixIndex = p.bits(11) - 1;
					if (prefixIndex >= 0) this.magicPrefixes.push(new ItemAffix(ItemAffixType.MagicPrefix, prefixIndex));
				}

				if (p.boolean) {
					let suffixIndex = p.bits(11) - 1;
					if (suffixIndex >= 0) this.magicSuffixes.push(new ItemAffix(ItemAffixType.MagicSuffix, suffixIndex));
				}
			}
		}

		this.color = this.getColor();

		if (this.flags.Runeword) {
			let rwid = p.bits(12);
			let param = p.bits(4);

			if (param === 5) {
				rwid = rwid - param * 5;
				if (rwid < 100) rwid--;
			} else if (param === 2) {
				rwid = ((rwid & 0x3FF) >> 5) + 2;
			} else {
				throw new Error('Invalid runeword param: ' + param);
			}

			this.runeword = RunewordIndex[rwid];
			this.runewordName = Runeword[this.runeword].runename;
		}

		if (this.flags.Personalized) {
			this.named = br.readString(16, 7);
		}

		if (this.isArmor()) {
			this.baseDefense = p.bits(ItemStat[ItemStatIndex['armorclass']].savebits) - 10;
		}

		if (this.isArmor() || this.isWeapon()) {
			let maxDura = p.bits(ItemStat[ItemStatIndex['maxdurability']].savebits);

			if (maxDura > 0) {
				this.durability = p.bits(ItemStat[ItemStatIndex['durability']].savebits);
				this.maxDurability = maxDura;
			}
		}

		if (this.flags.Socketed) {
			this.sockets = br.bit(ItemStat[ItemStatIndex['itemnumsockets']].savebits);
		}

		if (baseItem.stackable) {
			if (baseItem.useable) p.bits(5); // Items which can be .interact()'ed with ie Tomes, Scrolls, etc.
			this.addStat('quantity', p.bits(9));
		}

		if (!this.flags.Identified) {
			return;
		}

		var setMods = 0;
		if (this.quality === ItemQuality.Set)
			setMods = p.bits(5);
		while (this.readStat(br));
		if (this.flags.Runeword) while (this.readStat(br));
		while (setMods-- > 0) this.readStat(br);
	}

	readStat(br) {
		const p = {};
		Object.defineProperties(p, BitReader.shortHandBr(br));
		
		let statID = p.bits(9);
		if (statID === 0x1FF) return false;
		let baseStat = ItemStat[statID];
		
		if (!baseStat.saveparambits) { // Has no value in this column in ItemStatCost
			if (baseStat.opbase === 'level') {
				return this.addStat(new PerLevelStat(baseStat, p.bits(baseStat.savebits)));
			}
		
			switch (baseStat.rowindex) {
				case ItemStatIndex.itemmindamagepercent:
				case ItemStatIndex.itemmaxdamagepercent:
					return this.addStat(new DamageRangeStat(baseStat, p.bits(baseStat.savebits), p.bits(baseStat.savebits)));

				case ItemStatIndex.firemindam:
				case ItemStatIndex.lightmindam:
				case ItemStatIndex.magicmindam:
					return this.addStat(new DamageRangeStat(baseStat, p.bits(baseStat.savebits), p.bits(ItemStat[statID+1].savebits)));
	
				case ItemStatIndex.coldmindam:
					return this.addStat(new ColdDamageStat(baseStat, p.bits(baseStat.savebits), p.bits(ItemStat[statID+1].savebits), p.bits(ItemStat[statID+2].savebits)));
	
				case ItemStatIndex.PoisonMinDamage:
					return this.addStat(new PoisonDamageStat(baseStat, p.bits(baseStat.savebits), p.bits(ItemStat[statID+1].savebits), p.bits(ItemStat[statID+2].savebits)));
		
				case ItemStatIndex.itemreplenishdurability:
				case ItemStatIndex.itemreplenishquantity:
					return this.addStat(new ReplenishStat(baseStat, p.bits(baseStat.savebits)));

				case ItemStatIndex.quantity:
					return this.addStat(new SignedStat(baseStat, p.bits(9)));
	
				default:
					if (baseStat.signed) {
						let val = p.bits(baseStat.savebits);
						if (baseStat.saveadd > 0) val -= baseStat.saveadd;
						return this.addStat(new SignedStat(baseStat, val));
					} else {
						let val = p.bits(baseStat.savebits);
						if (baseStat.saveadd > 0) val -= baseStat.saveadd;
						return this.addStat(new UnsignedStat(baseStat, val));
					}
			}
		} else {
			switch (baseStat.rowindex) {
				case ItemStatIndex.itemsingleskill:
				case ItemStatIndex.itemnonclassskill:
					return this.addStat(new SkillBonusStat(baseStat, p.bits(baseStat.saveparambits), p.bits(baseStat.savebits)));

				case ItemStatIndex.itemaura:
					return this.addStat(new AuraStat(baseStat, p.bits(baseStat.saveparambits), p.bits(baseStat.savebits)));

				case ItemStatIndex.itemelemskill:
					return this.addStat(new ElementalSkillsBonusStat(baseStat, p.bits(baseStat.saveparambits), p.bits(baseStat.savebits)));
	
				case ItemStatIndex.itemaddclassskills:
					return this.addStat(new ClassSkillsBonusStat(baseStat, p.bits(baseStat.saveparambits), p.bits(baseStat.savebits)));

				case ItemStatIndex.itemreanimate:
					return this.addStat(new ReanimateStat(baseStat, p.bits(baseStat.saveparambits), p.bits(baseStat.savebits)));
	
				case ItemStatIndex.itemskillonattack:
				case ItemStatIndex.itemskillonkill:
				case ItemStatIndex.itemskillondeath:
				case ItemStatIndex.itemskillonhit:
				case ItemStatIndex.itemskillonlevelup:
				case ItemStatIndex.itemskillongethit:
					return this.addStat(new SkillOnEventStat(baseStat, p.bits(6), p.bits(10), p.bits(baseStat.savebits)));

				case ItemStatIndex.itemchargedskill:
					return this.addStat(new ChargedSkillStat(baseStat, p.bits(6), p.bits(10), p.bits(8), p.bits(8)));

				case ItemStatIndex.itemaddskilltab:
					return this.addStat(new SkillTabBonusStat(baseStat, p.bits(3), p.bits(3), p.bits(10), p.bits(baseStat.savebits)));
			}

			p.bits(baseStat.saveparambits);
		}
		
		throw new Error('I don\'t know what to do here');
		return false;
	}

	addStat(stat) { // s:statname v:value
		this.stats[stat.baseStat.stat] = stat;

		return true;
	}

	isType(t) { // Immediate type
		if (typeof t === 'string') return TypeCodeIndex[BaseItem[this.classid].type] === TypeCodeIndex[t];
		if (typeof t === 'number') return TypeCodeIndex[BaseItem[this.classid].type] === t;
		throw new Error('Invalid item type: ' + t);
	}

	hasType(t) { // Has immediate type or one of the subtypes
		if (typeof t === 'string') return !!ItemType[TypeCodeIndex[BaseItem[this.classid].type]].types.includes(TypeCodeIndex[t]);
		if (typeof t === 'number') return !!ItemType[TypeCodeIndex[BaseItem[this.classid].type]].types.includes(t);
		throw new Error('Invalid item type: ' + t);
	}

	isWeapon() {
		if (this.classid <= 305) return true;
		return false;
	}

	isArmor() {
		if (this.classid >= 306 && this.classid <= 507) return true;
		return false;
	}

	isMisc() {
		if (this.classid >= 508) return true;
		return false;
	}

	isColorAffected() { // ... By affixes or socketed items
		if (this.quality === ItemQuality.Set)		return false;
		if (this.quality === ItemQuality.Unique)	return false;
		if (this.quality === ItemQuality.Crafted)	return false;
		if (this.flags.Runeword)					return false;
		if (this.hasType('misc'))					return false; // Rings, amulets, runes, jewels, pots, etc..
		return true;
	}

	getColor() {
		if (!this.isColorAffected()) return 21; // 21 is "regular" aka no color, this is just so it works with ItemScreenshot lib, could be -1 instead
		for (let i = 0; i < this.magicSuffixes.length; i++) {
			let transColorCode = MagicSuffix[this.magicSuffixes[i].index].transformcolor;
			if (transColorCode) return ColorCodeIndex[transColorCode];
		}
		for (let i = 0; i < this.magicPrefixes.length; i++) {
			let transColorCode = MagicPrefix[this.magicPrefixes[i].index].transformcolor;
			if (transColorCode) return ColorCodeIndex[transColorCode];
		}
		return 21;
	}
}

for (let i = 0; i < items.length; i++) {
	var s = Buffer.from(items[i].replace(/ /g, ''), 'hex');
	var n = Buffer.alloc(s.length);
	s.copy(n, 0);
	items[i] = n;
	
	var it = new Item(items[i]);
	console.log(it);
	//console.log(n.length);
}