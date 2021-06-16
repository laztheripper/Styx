/**
 * @description Reads an item from the packet
 *
 * @Author Jaenster
 * @credits Awesom-O source code helped me allot.
 */

const BitReader = require('./BitReader');
const {ItemFlags, ItemLocation, EquipmentLocation, ItemActionType, ItemQuality, ItemDestination, ItemAffixType} = require('./Enums');
const ItemCollector = require('./ItemCollector');
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
	Unique,
	
	// Dicts
	BaseCodeIndex,
	TypeCodeIndex,
	ItemStatIndex,
	SetItemIndex,
	SetCodeIndex,
	ColorCodeIndex,
	RunewordIndex,
} = require('./Tables');

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
	static fromPacket(packet, game) {
		var it, bytes;

		try {
			bytes = Buffer.alloc(packet.length);
			packet.copy(bytes, 0);
			it = new Item(bytes, game);
		} catch(e) {
			console.log('Failed to parse item packet ', e);
			return false;
		}

		console.log(it.code, it.uid, it.ownerType, it.ownerUID);
		//console.log(it);
		return it;
	}

	constructor(buffer, game) {
		super();
		this.packet = Buffer.alloc(buffer.length);
		buffer.copy(this.packet, 0);
		const br = new BitReader(buffer), item = {}, p = {};
		Object.defineProperties(p, BitReader.shortHandBr(br));
		br.pos = 8;

		this.action			= p.byte; // To ground, to container, etc...
		this.packetLength	= p.byte;
		this.category		= p.byte;
		this.uid			= p.dword;

		this.type 			= 4; // Unit type (always item...)
		this.stats			= [];
		this.items			= {};
		this.UnitId			= this.uid; // Just a shorthand
		this.UnitType		= this.type; // Just a shorthand

		if (typeof game === 'undefined') var game = {me:{uid:666}};

		if (buffer[0] === 0x9D) {
			this.ownerType = p.byte;
			this.ownerUID = p.dword;
		} else {
			this.ownerType = 0; // Its an private item, aka on us. We are an player
			this.ownerUID = 0;
		}

		const flags = p.dword;
		this.flags = {
			None: (flags & ItemFlags.None) === ItemFlags.None,
			Equipped: (flags & ItemFlags.Equipped) === ItemFlags.Equipped,
			Cursor: (flags & ItemFlags.Cursor) === ItemFlags.Cursor,
			InSocket: (flags & ItemFlags.InSocket) === ItemFlags.InSocket,
			Identified: (flags & ItemFlags.Identified) === ItemFlags.Identified,
			Destroyed: (flags & ItemFlags.Destroyed) === ItemFlags.Destroyed,
			SwitchedIn: (flags & ItemFlags.SwitchedIn) === ItemFlags.SwitchedIn,
			SwitchedOut: (flags & ItemFlags.SwitchedOut) === ItemFlags.SwitchedOut,
			Broken: (flags & ItemFlags.Broken) === ItemFlags.Broken,
			Duplicate: (flags & ItemFlags.Duplicate) === ItemFlags.Duplicate,
			Socketed: (flags & ItemFlags.Socketed) === ItemFlags.Socketed,
			OnPet: (flags & ItemFlags.OnPet) === ItemFlags.OnPet,
			New: (flags & ItemFlags.New) === ItemFlags.New,
			Disabled: (flags & ItemFlags.Disabled) === ItemFlags.Disabled,
			Ear: (flags & ItemFlags.Ear) === ItemFlags.Ear,
			StartItem: (flags & ItemFlags.StartItem) === ItemFlags.StartItem,
			Simple: (flags & ItemFlags.Simple) === ItemFlags.Simple,
			Ethereal: (flags & ItemFlags.Ethereal) === ItemFlags.Ethereal,
			Any: (flags & ItemFlags.Any) === ItemFlags.Any,
			Personalized: (flags & ItemFlags.Personalized) === ItemFlags.Personalized,
			Gamble: (flags & ItemFlags.Gamble) === ItemFlags.Gamble,
			Runeword: (flags & ItemFlags.Runeword) === ItemFlags.Runeword,
			Magical: (flags & ItemFlags.Magical) === ItemFlags.Magical,
		};

		this.version = p.byte;
		//p.bits(2);
		this.destination = p.bits(5);

		if (this.destination === ItemDestination.Ground) { // location == doug.Container && bodylocation == doug.Location
			this.x = p.word;
			this.y = p.word;
			this.location = ItemLocation.Ground;
		} else {
			this.bodylocation = p.bits(4);
			this.x = p.bits(4);
			this.y = p.bits(4);
			this.location = p.bits(3);

			if (this.action === ItemActionType.AddToShop) {
				this.location |= 0x100;
			}
		}

		if (this.location === ItemLocation.Equipment) {
			if (this.bodylocation === EquipmentLocation.NotApplicable) {
				if (this.flags.InSocket) {
					this.location = ItemLocation.Item;
				} else {
					this.location = ItemLocation.Belt;
					this.y = this.x / 4;
					this.x = this.x % 4;
				}
			} else {
				this.x = -1;
				this.y = -1;
			}
		}

		switch (this.location) {
			case ItemLocation.Equipment:
			case ItemLocation.Inventory:
			case ItemLocation.Cube:
			case ItemLocation.Stash:
			case ItemLocation.Item:
				break;
			default:
				this.remove = true;
				return;
		}

		switch (this.action) {
			case ItemActionType.PutInContainer:
			case ItemActionType.Equip:
			case ItemActionType.IndirectlySwapBodyItem:
			case ItemActionType.SwapBodyItem:
			case ItemActionType.AddQuantity:
			case ItemActionType.SwapInContainer:
			case ItemActionType.AutoUnequip:
			case ItemActionType.ItemInSocket:
			case ItemActionType.UpdateStats:
			case ItemActionType.WeaponSwitch:
				break;
			default:
				this.remove = true;
				return;
		}

		switch (this.destination) {
			case ItemDestination.Container:
			case ItemDestination.Equipment:
			case ItemDestination.Item:
				break;
			case ItemDestination.Belt:
			case ItemDestination.Ground:
			case ItemDestination.Cursor:
			default:
				this.remove = true;
				return;
		}

		if (this.ownerType === 4 && !game.itemCollector.items.hasOwnProperty(this.ownerUID)) {
			this.remove = true;
			return;
		}
		
		if (!this.ownerUID && this.action !== ItemActionType.AddToShop) {
			this.ownerUID = game.me.uid; // "it either has no owner or it belongs to you or it belongs to shop. 9c never belongs to other players"
		}

		if (this.ownerType === 0 && this.ownerUID !== game.me.uid) {
			this.remove = true;
			return;
		}

		if (this.ownerType === 1 && game.merc.uid && this.ownerUID !== game.merc.uid) {
			this.remove = true;
			return;
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
			this.addStat(new SignedStat(ItemStat[ItemStatIndex.itemundeaddamagepercent], 50));
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

		var skipFirstEnd = this.flags.Runeword,
			setMods = 0,
			stat;
		 
		if (this.quality === ItemQuality.Set)
			setMods = p.bits(5);
		
		while (true) {
			stat = this.readStat(br);

			if (!stat) {
				if (skipFirstEnd) {
					skipFirstEnd = false;
					continue;
				}

				break;
			}
		}
		
		//while (setMods-- > 0) this.readStat(br);
	}

	readStat(br) {
		const p = {};
		Object.defineProperties(p, BitReader.shortHandBr(br));
		let statID = p.bits(9);

		if (statID === 0x1FF || statID >= ItemStatIndex.length) {
			//br.pos -= 9;
			return false;
		}

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
	
				case ItemStatIndex.poisonmindam:
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
		/*if (!this.stats.hasOwnProperty(stat.baseStat.stat)) {
			this.stats[stat.baseStat.stat] = stat;
			return true;
		}
		for (let key in stat) {
			if (typeof stat[key] !== 'number') continue;
			this.stats[key] += stat[key];
		}*/
		this.stats.push(stat);
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
		if (this.quality === ItemQuality.Set 	&& SetItem[this.setItem].invtransform) return ColorCodeIndex[SetItem[this.setItem].invtransform];		
		if (this.quality === ItemQuality.Unique && Unique[this.uniqueItem].invtransform) return ColorCodeIndex[Unique[this.uniqueItem].invtransform];
		if (!this.isColorAffected()) return 21; // 21 is "regular" aka no color, this is just so it works with ItemScreenshot lib, could be -1 instead
		if (this.magicSuffixes) {
			for (let i = 0; i < this.magicSuffixes.length; i++) {
				let transColorCode = MagicSuffix[this.magicSuffixes[i].index].transformcolor;
				if (transColorCode) return ColorCodeIndex[transColorCode];
			}
		}
		if (this.magicPrefixes) {
			for (let i = 0; i < this.magicPrefixes.length; i++) {
				let transColorCode = MagicPrefix[this.magicPrefixes[i].index].transformcolor;
				if (transColorCode) return ColorCodeIndex[transColorCode];
			}
		}
		return 21;
	}

	socketWith(item) {

	}
}

module.exports = Item;