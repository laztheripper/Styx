/**
 * @description Reads an item from the packet
 *
 * @Author Jaenster
 * @credits Awesom-O source code helped me allot.
 */

const sha256 = require('js-sha256');
const BitReader = require('./BitReader');
const BufferHelper = require('./BufferHelper');
const {ItemFlags, ItemLocation, EquipmentLocation, ItemActionType, ItemQuality, ItemDestination, ItemAffixType} = require('./Enums');
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
	AutoAffix,
	SetItem,
	Color,
	Runeword,
	Unique,
	GemRune,
	Property,
	Skill,
	
	// Dicts
	BaseCodeIndex,
	TypeCodeIndex,
	ItemStatIndex,
	SetItemIndex,
	ColorCodeIndex,
	GemRuneCodeIndex,
	RunewordIndex,
	UnidSetIndex,
	UnidUniqueIndex,
	PropertyCodeIndex,
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

		return it;
	}

	constructor(buffer, game, fake) {
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
		this.fillers		= [];
		this.gfx 			= 0; // Gfx id for charms, jewels, amulets, etc
		this.color			= 21;
		this.items			= {};
		this.UnitId			= this.uid; // Just a shorthand
		this.UnitType		= this.type; // Just a shorthand
		this.singleskillreq = 0;

		if (typeof game === 'undefined') var game = {me:{uid:666}};

		if (buffer[0] === 0x9D) {
			this.ownerType = p.byte;
			this.ownerUID = p.dword;
		} else {
			this.ownerType = 0; // Its an private item, aka on us. We are an player
			this.ownerUID = 0;
		}

		const flags = p.dword;
		this.iflags = flags;
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

		if (this.flags.Ear) {
			this.charClass = p.bits(3);
			this.ilvl = p.bits(7);
			this.name = p.string();
			this.code = 'ear';
			this.classid = 556;
			this.baseItem = BaseItem[this.classid];
			return;
		}

		this.code = p.string(3);
		p.bits(8);
		this.classid = BaseCodeIndex[this.code];
		this.tier = this.getTier();
		
		if (!this.ownerUID && this.action !== ItemActionType.AddToShop) {
			this.ownerUID = game.me.uid; // "it either has no owner or it belongs to you or it belongs to shop. 9c never belongs to other players"
		}

		if (!fake) {
			switch (this.location) {
				case ItemLocation.Equipment:
				case ItemLocation.Inventory:
				case ItemLocation.Cube:
				case ItemLocation.Stash:
				case ItemLocation.Item:
					break;
				default:
					this.remove = true;
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
			}

			if (this.ownerType === 4 && !game.itemCollector.items.hasOwnProperty(this.ownerUID)) {
				this.remove = true;
			}

			if (this.ownerType === 0 && this.ownerUID !== game.me.uid) {
				this.remove = true;
			}

			if (this.ownerType === 1 && game.merc.uid && this.ownerUID !== game.merc.uid) {
				this.remove = true;
			}
		}

		this.baseItem = BaseItem[this.classid];
		if (this.baseItem.quest) this.quest = true;

		if (this.classid === 523) { // Gold
			//this.stats.Quantity = p.bits(p.bit ? 32 : 12);
			this.addStat(new SignedStat(ItemStat[ItemStatIndex.quantity], p.bits(p.bit ? 32 : 12)));
		}
		
		const itemTypeIndex = TypeCodeIndex[this.baseItem.type];
		const itemType = ItemType[itemTypeIndex];
		this.itype = itemTypeIndex; // Row id from types table

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

		this.ilvl = p.bits(7); // illvl
		this.quality = p.bits(4); // quality
		if (this.remove) return;
		if (p.boolean) this.gfx = p.bits(3); // Graphic : 1 : 3+1
		if (p.boolean) this.autoMod = p.bits(11); // Automod : 1 : 11+1

		if (this.flags.Identified) {
			switch (this.quality) {
				case ItemQuality.Inferior:
					this.prefix = new ItemAffix(ItemAffixType.InferiorPrefix, p.bits(3)); // affix.type === what kind of inferior item ie: 0=crude, 1=cracked, 2=...
					this.nameprefix = this.prefix.index; // Row of lowqualityitems.txt
					break;

				case ItemQuality.Superior:
					this.prefix = new ItemAffix(ItemAffixType.SuperiorPrefix, p.bits(3));
					this.nameprefix = this.prefix.index; // Row of qualityitems.txt (row doesn't matter tho, they're all "superior")
					break;

				case ItemQuality.Magic:
					let prefixIndex = p.bits(11) - 1;
					if (prefixIndex >= 0) this.prefix = new ItemAffix(ItemAffixType.MagicPrefix, prefixIndex); // Row index of MagicPrefix.txt
					let suffixIndex = p.bits(11) - 1;
					if (suffixIndex >= 0) this.suffix = new ItemAffix(ItemAffixType.MagicSuffix, suffixIndex); // Row index of MagicSuffix.txt
					break;

				case ItemQuality.Rare:
				case ItemQuality.Crafted:
					this.prefix = new ItemAffix(ItemAffixType.Rare, p.bits(8) - 1); // Row index of RarePrefix.txt
					this.suffix = new ItemAffix(ItemAffixType.Rare, p.bits(8) - 1); // Row index of RareSuffix.txt
					break;

				case ItemQuality.Set:
					this.setid = p.bits(12);
					break;

				case ItemQuality.Unique:
					if (this.code !== 'std') this.uniqueid = p.bits(12);
					break;
			}
		} else {
			if (this.quality === ItemQuality.Set && UnidSetIndex[this.code]) this.setid = UnidSetIndex[this.code];
			if (this.quality === ItemQuality.Unique && UnidUniqueIndex[this.code]) this.uniqueid = UnidUniqueIndex[this.code];
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

			this.runewordid = RunewordIndex[rwid];
			this.runewordName = Runeword[this.runewordid].runename;
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

		if (this.baseItem.stackable) {
			if (this.baseItem.useable) p.bits(5); // Items which can be .interact()'ed with ie Tomes, Scrolls, etc.
			//this.addStat('quantity', p.bits(9));
			this.addStat(new SignedStat(ItemStat[ItemStatIndex.quantity], p.bits(9)));
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

	readStatProp(statID, min, max, param, val) {
		if (typeof statID === 'string') statID = ItemStatIndex[statID];
		if (typeof statID === 'object') statID = statID.rowindex;

		let baseStat = ItemStat[statID];
		
		if (!baseStat.saveparambits) { // Has no value in this column in ItemStatCost
			if (baseStat.opbase === 'level') {
				return this.addStat(new PerLevelStat(baseStat, param));
			}
		
			switch (baseStat.rowindex) {
				case ItemStatIndex.itemmindamagepercent:
				case ItemStatIndex.itemmaxdamagepercent:
					baseStat = ItemStat[18]; // Always itemmindamagepercent since min and max are always same. except for %maxdmg/lvl
					return this.addStat(new DamageRangeStat(baseStat, min, max));

				case ItemStatIndex.firemindam:
				case ItemStatIndex.lightmindam:
				case ItemStatIndex.magicmindam:
					return this.addStat(new DamageRangeStat(baseStat, min, 0));
				case ItemStatIndex.firemaxdam: // Packet will only contain min, reading from gems table gives us min and max without these.
				case ItemStatIndex.lightmaxdam:
				case ItemStatIndex.magicmaxdam:
					return this.addStat(new DamageRangeStat(ItemStat[statID-1], 0, max));

				case ItemStatIndex.coldmindam:
					return this.addStat(new ColdDamageStat(baseStat, min, 0, param));
				case ItemStatIndex.coldmaxdam:
					return this.addStat(new ColdDamageStat(ItemStat[statID-1], 0, max, param));
	
				case ItemStatIndex.poisonmindam:
					return this.addStat(new PoisonDamageStat(baseStat, min, 0, param));
				case ItemStatIndex.poisonmaxdam:
					return this.addStat(new PoisonDamageStat(ItemStat[statID-1], 0, max, param));
				case ItemStatIndex.poisonlength:
					return this.addStat(new PoisonDamageStat(ItemStat[statID-2], 0, 0, param));

				case ItemStatIndex.itemreplenishdurability:
				case ItemStatIndex.itemreplenishquantity:
					return this.addStat(new ReplenishStat(baseStat, param));

				case ItemStatIndex.quantity:
					return this.addStat(new SignedStat(baseStat, max)); // For any varying prop, put max (as opposed to min)
	
				case ItemStatIndex.coldlength:
					return;

				default:
					if (baseStat.signed) {
						return this.addStat(new SignedStat(baseStat, max));
					} else {
						return this.addStat(new UnsignedStat(baseStat, max));
					}
			}
		} else {
			switch (baseStat.rowindex) {
				case ItemStatIndex.itemsingleskill:
				case ItemStatIndex.itemnonclassskill:
					if (this.singleskillreq < Skill[param].reqlevel) this.singleskillreq = Skill[param].reqlevel;
					return this.addStat(new SkillBonusStat(baseStat, param, max));

				case ItemStatIndex.itemaura:
					return this.addStat(new AuraStat(baseStat, param, max));

				case ItemStatIndex.itemelemskill:
					return this.addStat(new ElementalSkillsBonusStat(baseStat, val, max));
	
				case ItemStatIndex.itemaddclassskills:
					return this.addStat(new ClassSkillsBonusStat(baseStat, val, max));

				case ItemStatIndex.itemreanimate:
					return this.addStat(new ReanimateStat(baseStat, param, max)); // Mob id, ctc%
	
				case ItemStatIndex.itemskillonattack:
				case ItemStatIndex.itemskillonkill:
				case ItemStatIndex.itemskillondeath:
				case ItemStatIndex.itemskillonhit:
				case ItemStatIndex.itemskillonlevelup:
				case ItemStatIndex.itemskillongethit:
					return this.addStat(new SkillOnEventStat(baseStat, max, param, min)); // Level, skill, chance

				case ItemStatIndex.itemchargedskill:
					throw new Error('Fuck that. not supporting charged skills here');
					return this.addStat(new ChargedSkillStat(
						baseStat,
						level,
						param, // good
						charges,
						maxcharges
					));

				case ItemStatIndex.itemaddskilltab:
					return this.addStat(new SkillTabBonusStat(baseStat, param % 3, Math.floor(param / 3), 0, max)); // Tab, class, unk, val
			}
		}
		
		throw new Error('I don\'t know what to do here');
		return false;
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
					baseStat = ItemStat[18]; // Always itemmindamagepercent since min and max are always same. except for %maxdmg/lvl
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
				
				case ItemStatIndex.damagepercent:
					throw new Error('Damagepercent received from packet, wat?');

				default:
					if (baseStat.signed) {
						let val = p.bits(baseStat.savebits);
						//if (baseStat.saveadd > 0) val -= baseStat.saveadd;
						val -= baseStat.saveadd;
						return this.addStat(new SignedStat(baseStat, val));
					} else {
						let val = p.bits(baseStat.savebits);
						//if (baseStat.saveadd > 0) val -= baseStat.saveadd;
						val -= baseStat.saveadd;
						return this.addStat(new UnsignedStat(baseStat, val));
					}
			}
		} else {
			switch (baseStat.rowindex) {
				case ItemStatIndex.itemsingleskill:
				case ItemStatIndex.itemnonclassskill:
					let skillId = p.bits(baseStat.saveparambits);
					let val = p.bits(baseStat.savebits);
					if (this.singleskillreq < Skill[skillId].reqlevel) this.singleskillreq = Skill[skillId].reqlevel;
					return this.addStat(new SkillBonusStat(baseStat, skillId, val));

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
		for (let i = 0; i < this.stats.length; i++) {
			//if (stat.constructor !== this.stats[i].constructor) continue; // Kinda useless, name is enough
			if (stat.id !== this.stats[i].id) continue;
			
			switch (true) {
			case stat instanceof ReanimateStat:
				if (stat.monsterId !== this.stats[i].monsterId) break;
				this.stats[i].val += stat.val;
				return true;

			case stat instanceof ElementalSkillsBonusStat:
				if (stat.element !== this.stats[i].element) break;
				this.stats[i].val += stat.val;
				return true;

			case stat instanceof ClassSkillsBonusStat:
				if (stat.charClass !== this.stats[i].charClass) break;
				this.stats[i].val += stat.val;
				return true;

			case stat instanceof AuraStat:
				if (stat.skill !== this.stats[i].skill) break;
				this.stats[i].level += stat.level;
				return true;
				
			case stat instanceof SkillBonusStat:
				if (stat.skill !== this.stats[i].skill) break;
				this.stats[i].val += stat.val;
				return true;

			//case stat instanceof ChargedSkillStat: // Doesn't stack
			//case stat instanceof SkillOnEventStat: // Doesn't stack
			case stat instanceof SkillTabBonusStat:
				if (stat.tab !== this.stats[i].tab) break;
				if (stat.charClass !== this.stats[i].charClass) break;
				this.stats[i].val += stat.val;
				return true;

			case stat instanceof PoisonDamageStat:
			case stat instanceof ColdDamageStat:
				this.stats[i].min += stat.min;
				this.stats[i].max += stat.max;
				this.stats[i].frames += stat.frames;
				return true;

			case stat instanceof DamageRangeStat:
				this.stats[i].min += stat.min;
				this.stats[i].max += stat.max;
				return true;

			case stat instanceof PerLevelStat:
			case stat instanceof ReplenishStat:
			case stat instanceof SignedStat:
			case stat instanceof UnsignedStat:
				this.stats[i].val += stat.val;
				return true;
			}

			this.stats.push(stat); // Stat existed but it's not one we can merge, like skillonevent stuff
			return true;
		}

		this.stats.push(stat); // Stat didn't exist on the item, add new
		return true;
	}

	getTier() {
		const {normcode, ubercode, ultracode} = BaseItem[this.classid]; // Misc items don't have these, so it will return 0
		if (this.code === normcode) return 0;
		if (this.code === ubercode) return 1;
		if (this.code === ultracode) return 2;
		return 0;
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

	getDerivedStats() { // Totals at char level 99, visually the user will be able to adjust but the queries will be on 99 data
		if (!this.dstats) this.getFlatStats();

		if (!this.isMisc()) { 	// Stat Requirements - Only for non-misc
			let baseStr = (this.baseItem.reqstr || 0) - (this.flags.Ethereal ? 10 : 0);
			let baseDex = (this.baseItem.reqdex || 0) - (this.flags.Ethereal ? 10 : 0);

			if (this.dstats.hasOwnProperty(ItemStatIndex.itemreqpercent)) {
				baseStr += Math.floor((baseStr * this.dstats[ItemStatIndex.itemreqpercent]) / 100);
				baseDex += Math.floor((baseDex * this.dstats[ItemStatIndex.itemreqpercent]) / 100);
			}

			if (baseStr > 0) this.dstats['strreq'] = baseStr;
			if (baseDex > 0) this.dstats['dexreq'] = baseDex;
		}

		if (this.durability) { // Total durability. this.durability is the actual value, can be >= max before calc. Indestructible doesn't affect durability
			if (this.dstats.hasOwnProperty(ItemStatIndex.itemmaxdurabilitypercent)) // Percent bonus
				this.maxDurability += Math.floor((this.maxDurability * this.dstats[ItemStatIndex.itemmaxdurabilitypercent]) / 100);
			if (this.dstats.hasOwnProperty(ItemStatIndex.maxdurability)) // Flat bonus added
				this.maxDurability += this.dstats[ItemStatIndex.maxdurability];
			this.dstats['dura'] = Math.min(this.durability, 333); // Capped at 333
			this.dstats['maxdura'] = Math.min(this.maxDurability, 333);
		}

		var lvlreq = [this.getLevelRequirement()];
		for (var uid in this.items) lvlreq.push(this.items[uid].getLevelRequirement());
		lvlreq = Math.max(...lvlreq);
		if (lvlreq > 1) this.dstats['lvlreq'] = lvlreq;

		if (this.isWeapon()) { // Total 1handed min-max, 2handed min-max, Throw min-max - Only for weapons
			let minDamagePercent = 100 + (this.dstats[ItemStatIndex.damagepercent] || 0);
			let maxDamagePercent = minDamagePercent + Math.floor((this.dstats[ItemStatIndex.itemmaxdamagepercentperlevel] || 0) * 99);
			let minDamageBonus	 = (this.dstats[ItemStatIndex.mindamage] || 0) || (this.dstats[ItemStatIndex.secondarymindamage] || 0) || (this.dstats[ItemStatIndex.itemthrowmindamage] || 0) || 0;
			let maxDamageBonus	 = (this.dstats[ItemStatIndex.maxdamage] || 0) || (this.dstats[ItemStatIndex.secondarymaxdamage] || 0) || (this.dstats[ItemStatIndex.itemthrowmaxdamage] || 0) || Math.floor((this.dstats[ItemStatIndex.itemmaxdamageperlevel] || 0) * 99) || 0;

			let minOneHandDamage = this.baseItem.mindam 		? Math.floor((Math.floor(this.baseItem.mindam 		  * (this.flags.Ethereal ? 1.5 : 1)) * minDamagePercent) / 100) + minDamageBonus : 0;
			let minTwoHandDamage = this.baseItem['2handmindam'] ? Math.floor((Math.floor(this.baseItem['2handmindam'] * (this.flags.Ethereal ? 1.5 : 1)) * minDamagePercent) / 100) + minDamageBonus : 0;
			let minThrowDamage	 = this.baseItem.minmisdam		? Math.floor((Math.floor(this.baseItem.minmisdam 	  * (this.flags.Ethereal ? 1.5 : 1)) * minDamagePercent) / 100) + minDamageBonus : 0;

			let maxOneHandDamage = this.baseItem.maxdam 		? Math.floor((Math.floor(this.baseItem.maxdam 		  * (this.flags.Ethereal ? 1.5 : 1)) * maxDamagePercent) / 100) + maxDamageBonus : 0;
			let maxTwoHandDamage = this.baseItem['2handmaxdam'] ? Math.floor((Math.floor(this.baseItem['2handmaxdam'] * (this.flags.Ethereal ? 1.5 : 1)) * maxDamagePercent) / 100) + maxDamageBonus : 0;
			let maxThrowDamage	 = this.baseItem.maxmisdam		? Math.floor((Math.floor(this.baseItem.maxmisdam	  * (this.flags.Ethereal ? 1.5 : 1)) * maxDamagePercent) / 100) + maxDamageBonus : 0;
			
			if (minOneHandDamage && minOneHandDamage >= maxOneHandDamage) maxOneHandDamage = minOneHandDamage + 1;
			if (minTwoHandDamage && minTwoHandDamage >= maxTwoHandDamage) maxTwoHandDamage = minTwoHandDamage + 1;
			if (minThrowDamage	 && minThrowDamage   >= maxThrowDamage)   maxThrowDamage   = minThrowDamage	  + 1;

			if (minOneHandDamage) this.dstats['min1hdam'] = minOneHandDamage;
			if (minTwoHandDamage) this.dstats['min2hdam'] = minTwoHandDamage;
			if (minThrowDamage) this.dstats['minthrowdam'] = minThrowDamage;

			if (maxOneHandDamage) this.dstats['max1hdam'] = maxOneHandDamage;
			if (maxTwoHandDamage) this.dstats['max2hdam'] = maxTwoHandDamage;
			if (maxThrowDamage) this.dstats['maxthrowdam'] = maxThrowDamage;
		}

		if (this.isArmor()) {
			let def = Math.floor(this.baseDefense * (100 + (this.dstats[ItemStatIndex.itemarmorpercent] || 0)) / 100) + (this.dstats[ItemStatIndex.armorclass] || 0) + Math.floor((this.dstats[ItemStatIndex.itemarmorperlevel] || 0) * 99);
			if (def > 0) this.dstats['def'] = def;
		}

		if (this.baseItem.stackable) {
			this.dstats['maxquant'] = (this.dstats[ItemStatIndex.itemextrastack] || 0) + (this.baseItem.maxstack || 0);
		}
	}

	isUpped() {
		if (!this.dstats.hasOwnProperty(ItemStatIndex.itemlevelreq)) return 0; // +0
		if (this.dstats[ItemStatIndex.itemlevelreq] <= 7) return 1;
		return 2; // +7
	}

	getLevelRequirement() {
		var basereq = this.baseItem.levelreq, i, lvlreq, areq = 0,
			areqs = [],
			reqs = [basereq];

		if (this.flags.Identified) {
			switch (this.quality) {
				case ItemQuality.Magic: // Affixes
					if (this.prefix) areqs.push(MagicPrefix[this.prefix.index].levelreq || 0);
					if (this.suffix) areqs.push(MagicSuffix[this.suffix.index].levelreq || 0);
					if (this.autoMod) areqs.push(AutoAffix[this.autoMod].levelreq || 0);
					break;
				case ItemQuality.Rare:
					if (this.autoMod) areqs.push(AutoAffix[this.autoMod].levelreq || 0);
					break;
				case ItemQuality.Set:
					reqs.push(SetItem[this.setid].lvlreq || 0);
					break;
				case ItemQuality.Unique:
					reqs.push(Unique[this.uniqueid].lvlreq || 0);
					break;
			}

			if (this.magicPrefixes) {
				for (i = 0; i < this.magicPrefixes.length; i++) {
					areqs.push(MagicPrefix[this.magicPrefixes[i].index].levelreq);
				}
			}
	
			if (this.magicSuffixes) {
				for (i = 0; i < this.magicSuffixes.length; i++) {
					areqs.push(MagicSuffix[this.magicSuffixes[i].index].levelreq);
				}
			}

			areq = Math.max(...areqs);
			
			if (this.quality === ItemQuality.Crafted) {
				areq += 10;
				if (this.magicPrefixes) areq += 3 * this.magicPrefixes.length;
				if (this.magicSuffixes) areq += 3 * this.magicSuffixes.length;
			}

			reqs.push(areq);
		}

		reqs.push(this.singleskillreq || 0); // Staffmod level reqs
		lvlreq = Math.max(...reqs);
		if (this.dstats) lvlreq += this.dstats.itemlevelreq || 0; // When upped or double upped (+5 and +7 respectively, for a total of +12) socketed items are never upped, so no need to flatten stats
		return Math.min(98, lvlreq);
	}

	getFlatStats() {
		this.dstats = {};

		for (var i = 0; i < this.stats.length; i++) {
			var stat = this.stats[i];
			
			switch (stat.id) {
				case ItemStatIndex.itemmindamagepercent:
					this.dstats[ItemStatIndex.damagepercent] = stat.max; // Just always enhanced damage, min-max should always be same.
					break;

				case ItemStatIndex.firemindam:
				case ItemStatIndex.coldmindam:
				case ItemStatIndex.lightmindam:
				case ItemStatIndex.magicmindam:
					this.dstats[stat.id] = stat.min;
					this.dstats[stat.id+1] = stat.max;
					break;

				case ItemStatIndex.poisonmindam:
					this.dstats[stat.id] = stat.min;
					this.dstats[stat.id+1] = stat.max;
					this.dstats[stat.id+2] = stat.frames;
					break; 
				
				case ItemStatIndex.itemskillonattack:
				case ItemStatIndex.itemskillondeath:
				case ItemStatIndex.itemskillonhit:
				case ItemStatIndex.itemskillongethit:
				case ItemStatIndex.itemskillonkill:
				case ItemStatIndex.itemskillonlevelup:
					this.dstats[stat.id + '_' + stat.skill + '_level'] = stat.level;
					this.dstats[stat.id + '_' + stat.skill + '_chance'] = stat.chance;
					break;

				case ItemStatIndex.itemchargedskill:
					this.dstats[stat.id + '_' + stat.skill + '_level'] = stat.level;
					this.dstats[stat.id + '_' + stat.skill + '_charges'] = stat.charges;
					this.dstats[stat.id + '_' + stat.skill + '_maxcharges'] = stat.maxCharges;
					break;
				
				case ItemStatIndex.itemaura:
					this.dstats[stat.id + '_' + stat.skill + '_level'] = stat.level;
					break;

				case ItemStatIndex.itemaddskilltab:
					this.dstats[stat.id + '_' + (stat.charClass * 3 + stat.tab)] = stat.val; // Use 0-20 notation
					break;

				case ItemStatIndex.itemaddclassskills:
					this.dstats[stat.id + '_' + stat.charClass] = stat.val;
					break;
				
				case ItemStatIndex.itemsingleskill:
				case ItemStatIndex.itemnonclassskill:
					this.dstats[stat.id + '_' + stat.skill] = stat.val;
					break;

				case ItemStatIndex.itemreanimate:
					this.dstats[stat.id + '_' + stat.monsterId] = stat.val;
					break;
				
				case ItemStatIndex.itemelemskill: // stat.element is ignored ingame, always defaults to fire!
				default:
					this.dstats[stat.id] = stat.val; // Just let it error if I forgot a non-val stat
					break;
			}
		}
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
		if (!this.flags.Identified) return 21;
		if (this.quest) return 21;
		if (this.quality === ItemQuality.Set && SetItem[this.setid].invtransform) return ColorCodeIndex[SetItem[this.setid].invtransform];		
		if (this.quality === ItemQuality.Unique && Unique[this.uniqueid].invtransform) return ColorCodeIndex[Unique[this.uniqueid].invtransform];
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
		if (this.autoMod) {
			let transColorCode = AutoAffix[this.autoMod].transformcolor;
			return ColorCodeIndex[transColorCode];
		}
		return 21;
	}

	getGemStats(gem) {
		var row = GemRune[GemRuneCodeIndex[gem.code]],
			i, n, col, code, param, min, max, stat, val, prop;

		if (this.hasType('shld')) {
			col = 'shield';
		} else if (this.hasType('tors') || this.hasType('helm')) {
			col = 'helm';
		} else if (this.hasType('weap')) {
			col = 'weapon';
		}

		for (i = 1; i <= 3; i++) {
			code	= row[col + 'mod' + i + 'code'];
			if (!code) continue;
			param	= row[col + 'mod' + i + 'param'];
			min		= row[col + 'mod' + i + 'min'];
			max 	= row[col + 'mod' + i + 'max'];

			prop = Property[PropertyCodeIndex[code]];
			if (!prop.stat1) throw new Error('Forgot a stat for property: ' + prop.code);

			for (n = 1; n <= 7; n++) {
				stat = prop['stat' + n];
				if (!stat) break;
				val = prop['val' + n];
				gem.readStatProp(stat, min, max, param, val); // Val is from property
			}
		}
	}

	socketWith(item) {
		if (item.hasType('gem') || item.isType('rune')) {
			this.getGemStats(item);
		}

		for (var i = 0; i < item.stats.length; i++) {
			this.addStat(item.stats[i]);
		}

		//item.getFlatStats();

		if (this.color === 21 && !this.fillers && this.isColorAffected() && item.hasType('gem')) {
			let gem = GemRune[GemRuneCodeIndex[item.code]];
			if (gem.transform) this.color = gem.transform;
		}

		//this.fillers.push(item.classid + ':' + item.gfx);
	}

	getRowData(game) {
		var n, i, key, obj = {},
			temp = {};

		for (i = 0; i < Item.columns.length; i++) {
			key = Item.columns[i];

			switch (key) {
			case 'hash':
			case 'uhash':
				break;

			case 'stats':
				obj.stats = {};
				if (!this.dstats) break;
				let keys = Object.keys(this.dstats).sort();
				for (n = 0; n < keys.length; n++) {
					obj.stats[keys[n]] = this.dstats[keys[n]];
					if (keys[n].endsWith('_charges') || keys[n] === 'dura') continue;
					temp[keys[n]] = this.dstats[keys[n]];
				}
				break;
			
			case 'fillers':
				obj.fillers = this.fillers.join(',');
				break;

			case 'packet':
				obj.packet = BufferHelper.getByteStr(this.packet).replace(/ /g, '');
				break;
			
			case 'identified':
				obj.identified = this.flags.Identified;
				break;

			case 'ethereal':
				obj.ethereal = this.flags.Ethereal;
				break;
			
			case 'uniqueid':
			case 'runewordid':
			case 'setid':
				if (!this.hasOwnProperty(key)) {
					obj[key] = -1;
					break;
				}
				obj[key] = this[key];
				break;

			case 'prefix':
			case 'suffix':
				if (!this.hasOwnProperty(key)) {
					obj[key] = -1;
					break;
				}
				obj[key] = this[key].index;
				break;

			default:
				if (!this.hasOwnProperty(key)) {
					obj[key] = 0;
					break;
				}
				if (typeof this[key] === 'object') throw new Error('Cannot serialize nested objects');
				obj[key] = this[key];
			}
		}

		obj.hash = sha256(JSON.stringify({
			classid		: obj.classid,
			ethereal	: obj.ethereal,
			gfx			: obj.gfx,
			quality 	: obj.quality,
			sockets 	: obj.sockets,
			stats 		: temp,
		}));

		obj.uhash = sha256(JSON.stringify({
			charName	: game.me.name,
			realm		: game.mcp.realm,
			classid		: obj.classid,
			ethereal	: obj.ethereal,
			gfx			: obj.gfx,
			quality 	: obj.quality,
			sockets 	: obj.sockets,
			stats 		: obj.stats,
			location 	: obj.location,
			bodylocation: obj.bodylocation,
			x 			: obj.x,
			y 			: obj.y,
		}));

		this.row = obj;
		return obj;
	}

	static columns = [
		'uhash', // uhash str (specific to the item, two items with the same uhash are literally the same item in the same location, dura, etc...)
		'hash', // hash str (an equivalent item would have the same hash. same stat but maybe not same char or position etc...)
		'classid', // classid int
		'itype', // itype int
		'location', // location int
		'bodylocation', // bodylocation int
		'x', // x int
		'y', // y int
		'gfx', // gfx int
		'packet', // packet bytestr
		'stats', // stats JSON
		'sockets', // sockets int
		'fillers', // fillers array[classid]
		'quality', // quality int
		'tier', // tier int
		'color', // color int
		'ilvl', // ilvl int
		'ethereal', // ethereal bool
		'identified', // identified bool
		'prefix', // prefix int
		'suffix', // suffix int
		'uniqueid', // uniqueid int
		'setid', // setid int
		'runewordid', // runewordid int
		'iflags', // iflags int
	].sort();
}

module.exports = Item;
