const fs = require('fs');
const {ItemType, ItemCategory} = require("./Enums");


class BaseItem {
	constructor() {
		this.id = BaseItem.instances.push(this);
	}

	static instances = [];
	static ItemCount = 0;

	static BASE_ARMOR_START = 150;
	static BASE_WEAPON_START = 351;

	isWeapon() {
		return this instanceof BaseWeapon;
	}

	isArmor() {
		return this instanceof BaseArmor;
	}

	static getByID(cat, id) {
		switch (cat) {
			case ItemCategory.Armor:
			case ItemCategory.Helm:
			case ItemCategory.Shield:
				for (let i = BaseItem.BASE_ARMOR_START; i < BaseItem.BASE_WEAPON_START; i++) {
					if (BaseItem.instances[i].id === id) return BaseItem.instances[i];
				}
				break;
			case ItemCategory.Weapon:
				for (let i = BaseItem.BASE_WEAPON_START; i < BaseItem.ItemCount; i++) {
					if (BaseItem.instances[i].id === id) return BaseItem.instances[i];
				}
				break;
			// case ItemCategory.Weapon2:  // But sometimes shields...
			// case ItemCategory.Misc:     // Can be boots, gloves etc...
			// case ItemCategory.Special:
			case undefined: // Just look by id
			default:
				for (let i = 0; i < BaseItem.ItemCount - 1; i++) {
					if (BaseItem.instances[i]) {
						if (BaseItem.instances[i].id === id) return BaseItem.instances[i];
					}
				}

		}
		return {};
	}

	static getByCode(code) {
		return this.instances.find(instance => instance.code === code);
	}
}

class BaseMiscItem extends BaseItem {
	constructor(args) {
		super(args);
		const Index = BaseItem.ItemCount++;
		this.type = Index;
		this.typeName = ItemType[Index];
		this.index = Index;
		this.tableIndex = Index;

		this.baseType = BaseItemType.getByCode(args[33]);
		this.baseType2 = BaseItemType.getByCode(args[33]);

		this.code = args[14];
		this.id = GetIdFromCode(args[14]);

		this.nightmareUpgrade = args[161] === "xxx" ? 0 : GetIdFromCode(args[161]);
		this.hellUpgrade = args[162] === "xxx" ? 0 : GetIdFromCode(args[162]);

		this.name = args[0];
		this.Name2 = args[1];
		this.SzFlavorText = args[2];
		this.compactSave = args[3];
		this.version = args[4];
		this.level = args[5];
		this.levelReq = args[6];
		this.rarity = args[7];
		this.spawnable = args[8];
		this.speed = args[9];
		this.noDurability = args[10];
		this.cost = args[11];
		this.gambleCost = args[12];
		this.autoPrefix = args[13];

		this.alternateGfx = args[15];
		this.nameString = args[16];
		this.component = args[17];
		this.invWidth = args[18];
		this.invHeight = args[19];
		this.hasInv = args[20];
		this.gemSockets = args[21];
		this.gemApplyType = args[22];
		this.flippyFile = args[23];
		this.invFile = args[24];
		this.uniqueInvFile = args[25];
		this.Special = args[26];
		this.Transmogrify = args[27];
		this.TMogType = args[28];
		this.TMogMin = args[29];
		this.TMogMax = args[30];
		this.useable = args[31];
		this.Throwable = args[32];

		this.dropSound = args[35];
		this.dropSfxFrame = args[36];
		this.useSound = args[37];
		this.unique = args[38];
		this.transparent = args[39];
		this.transTbl = args[40];
		this.lightRadius = args[41];
		this.belt = args[42];
		this.AutoBelt = args[43];
		this.stackable = args[44];
		this.minStack = args[45];
		this.maxStack = args[46];
		this.SpawnStack = args[47];
		this.quest = args[48];
		this.QuestDiffCheck = args[49];
		this.missileType = args[50];
		this.SpellIcon = args[51];
		this.pSpell = args[52];
		this.State = args[53];
		this.CState1 = args[54];
		this.CState2 = args[55];
		this.Len = args[56];
		this.Stat1 = args[57];
		this.Calc1 = args[58];
		this.Stat2 = args[59];
		this.Calc2 = args[60];
		this.Stat3 = args[61];
		this.Calc3 = args[62];
		this.SpellDesc = args[63];
		this.SpellDescStr = args[64];
		this.SpellDescCalc = args[65];
		this.durabilityWarning = args[66];
		this.quantityWarning = args[67];
		this.gemOffset = args[68];
		this.BetterGem = args[69];
		this.bitField1 = args[70];
		this.charsiMin = args[71];
		this.charsiMax = args[72];
		this.charsiMagicMin = args[73];
		this.charsiMagicMax = args[74];
		this.charsiMagicLvl = args[75];
		this.gheedMin = args[76];
		this.gheedMax = args[77];
		this.gheedMagicMin = args[78];
		this.gheedMagicMax = args[79];
		this.gheedMagicLvl = args[80];
		this.akaraMin = args[81];
		this.akaraMax = args[82];
		this.akaraMagicMin = args[83];
		this.akaraMagicMax = args[84];
		this.akaraMagicLvl = args[85];
		this.faraMin = args[86];
		this.faraMax = args[87];
		this.faraMagicMin = args[88];
		this.faraMagicMax = args[89];
		this.faraMagicLvl = args[90];
		this.lysanderMin = args[91];
		this.lysanderMax = args[92];
		this.lysanderMagicMin = args[93];
		this.lysanderMagicMax = args[94];
		this.lysanderMagicLvl = args[95];
		this.drognanMin = args[96];
		this.drognanMax = args[97];
		this.drognanMagicMin = args[98];
		this.drognanMagicMax = args[99];
		this.drognanMagicLvl = args[100];
		this.hraltiMin = args[101];
		this.hraltiMax = args[102];
		this.hraltiMagicMin = args[103];
		this.hraltiMagicMax = args[104];
		this.hraltiMagicLvl = args[105];
		this.alkorMin = args[106];
		this.alkorMax = args[107];
		this.alkorMagicMin = args[108];
		this.alkorMagicMax = args[109];
		this.alkorMagicLvl = args[110];
		this.ormusMin = args[111];
		this.ormusMax = args[112];
		this.ormusMagicMin = args[113];
		this.ormusMagicMax = args[114];
		this.ormusMagicLvl = args[115];
		this.elzixMin = args[116];
		this.elzixMax = args[117];
		this.elzixMagicMin = args[118];
		this.elzixMagicMax = args[119];
		this.elzixMagicLvl = args[120];
		this.ashearaMin = args[121];
		this.ashearaMax = args[122];
		this.ashearaMagicMin = args[123];
		this.ashearaMagicMax = args[124];
		this.ashearaMagicLvl = args[125];
		this.cainMin = args[126];
		this.cainMax = args[127];
		this.cainMagicMin = args[128];
		this.cainMagicMax = args[129];
		this.cainMagicLvl = args[130];
		this.halbuMin = args[131];
		this.halbuMax = args[132];
		this.halbuMagicMin = args[133];
		this.halbuMagicMax = args[134];
		this.halbuMagicLvl = args[135];
		this.jamellaMin = args[136];
		this.jamellaMax = args[137];
		this.jamellaMagicMin = args[138];
		this.jamellaMagicMax = args[139];
		this.jamellaMagicLvl = args[140];
		this.larzukMin = args[141];
		this.larzukMax = args[142];
		this.larzukMagicMin = args[143];
		this.larzukMagicMax = args[144];
		this.larzukMagicLvl = args[145];
		this.malahMin = args[146];
		this.malahMax = args[147];
		this.malahMagicMin = args[148];
		this.malahMagicMax = args[149];
		this.malahMagicLvl = args[150];
		this.drehyaMin = args[151];
		this.drehyaMax = args[152];
		this.drehyaMagicMin = args[153];
		this.drehyaMagicMax = args[154];
		this.drehyaMagicLvl = args[155];
		this.sourceArt = args[156];
		this.gameArt = args[157];
		this.transform = args[158];
		this.invTrans = args[159];
		this.skipName = args[160];

		this.minDamage = args[163];
		this.maxDamage = args[164];
		this.PermStoreItem = args[165];
		this.MultiBuy = args[166];
		this.nameable = args[167];
	}
}

class BaseArmor extends BaseItem {
	constructor(args) {
		super(args);
		const Index = BaseItem.ItemCount++;
		this.type = Index;
		this.index = Index;
		this.tableIndex = Index - BaseItem.BASE_ARMOR_START;

		this.____test = args[48];
		this.baseType = BaseItemType.getByCode(args[48]);
		this.baseType2 = BaseItemType.getByCode(args[49]);

		this.code = args[17];
		this.id = GetIdFromCode(args[17]);

		this.nightmareUpgrade = args[159] === "xxx" ? 0 : GetIdFromCode(args[159]);
		this.hellUpgrade = args[160] === "xxx" ? 0 : GetIdFromCode(args[160]);

		this.NormalID = GetIdFromCode(args[23]);
		this.ExceptionalID = GetIdFromCode(args[24]);
		this.EliteID = GetIdFromCode(args[25]);

		this.name = args[0];
		this.version = args[1];
		this.compactSave = args[2];
		this.rarity = args[3];
		this.spawnable = args[4];
		this.MinAc = args[5];
		this.MaxAc = args[6];
		this.Absorbs = args[7];
		this.speed = args[8];
		this.ReqStr = args[9];
		this.Block = args[10];
		this.Durability = args[11];
		this.noDurability = args[12];
		this.level = args[13];
		this.levelReq = args[14];
		this.cost = args[15];
		this.gambleCost = args[16];

		this.nameString = args[18];
		this.MagicLevel = args[19];
		this.autoPrefix = args[20];
		this.alternateGfx = args[21];
		this.OpenBetaGfx = args[22];

		this.SpellOffset = args[26];
		this.component = args[27];
		this.invWidth = args[28];
		this.invHeight = args[29];
		this.hasInv = args[30];
		this.gemSockets = args[31];
		this.gemApplyType = args[32];
		this.flippyFile = args[33];
		this.invFile = args[34];
		this.uniqueInvFile = args[35];
		this.SetInvFile = args[36];
		this.lArm = args[37];
		this.rArm = args[38];
		this.Torso = args[39];
		this.Legs = args[40];
		this.rSPad = args[41];
		this.lSPad = args[42];
		this.useable = args[43];
		this.Throwable = args[44];
		this.stackable = args[45];
		this.minStack = args[46];
		this.maxStack = args[47];

		this.dropSound = args[50];
		this.dropSfxFrame = args[51];
		this.useSound = args[52];
		this.unique = args[53];
		this.transparent = args[54];
		this.transTbl = args[55];
		this.Quivered = args[56];
		this.lightRadius = args[57];
		this.belt = args[58];
		this.quest = args[59];
		this.missileType = args[60];
		this.durabilityWarning = args[61];
		this.quantityWarning = args[62];
		this.minDamage = args[63];
		this.maxDamage = args[64];
		this.StrBonus = args[65];
		this.DexBonus = args[66];
		this.gemOffset = args[67];
		this.bitField1 = args[68];
		this.charsiMin = args[69];
		this.charsiMax = args[70];
		this.charsiMagicMin = args[71];
		this.charsiMagicMax = args[72];
		this.charsiMagicLvl = args[73];
		this.gheedMin = args[74];
		this.gheedMax = args[75];
		this.gheedMagicMin = args[76];
		this.gheedMagicMax = args[77];
		this.gheedMagicLvl = args[78];
		this.akaraMin = args[79];
		this.akaraMax = args[80];
		this.akaraMagicMin = args[81];
		this.akaraMagicMax = args[82];
		this.akaraMagicLvl = args[83];
		this.faraMin = args[84];
		this.faraMax = args[85];
		this.faraMagicMin = args[86];
		this.faraMagicMax = args[87];
		this.faraMagicLvl = args[88];
		this.lysanderMin = args[89];
		this.lysanderMax = args[90];
		this.lysanderMagicMin = args[91];
		this.lysanderMagicMax = args[92];
		this.lysanderMagicLvl = args[93];
		this.drognanMin = args[94];
		this.drognanMax = args[95];
		this.drognanMagicMin = args[96];
		this.drognanMagicMax = args[97];
		this.drognanMagicLvl = args[98];
		this.hraltiMin = args[99];
		this.hraltiMax = args[100];
		this.hraltiMagicMin = args[101];
		this.hraltiMagicMax = args[102];
		this.hraltiMagicLvl = args[103];
		this.alkorMin = args[104];
		this.alkorMax = args[105];
		this.alkorMagicMin = args[106];
		this.alkorMagicMax = args[107];
		this.alkorMagicLvl = args[108];
		this.ormusMin = args[109];
		this.ormusMax = args[110];
		this.ormusMagicMin = args[111];
		this.ormusMagicMax = args[112];
		this.ormusMagicLvl = args[113];
		this.elzixMin = args[114];
		this.elzixMax = args[115];
		this.elzixMagicMin = args[116];
		this.elzixMagicMax = args[117];
		this.elzixMagicLvl = args[118];
		this.ashearaMin = args[119];
		this.ashearaMax = args[120];
		this.ashearaMagicMin = args[121];
		this.ashearaMagicMax = args[122];
		this.ashearaMagicLvl = args[123];
		this.cainMin = args[124];
		this.cainMax = args[125];
		this.cainMagicMin = args[126];
		this.cainMagicMax = args[127];
		this.cainMagicLvl = args[128];
		this.halbuMin = args[129];
		this.halbuMax = args[130];
		this.halbuMagicMin = args[131];
		this.halbuMagicMax = args[132];
		this.halbuMagicLvl = args[133];
		this.jamellaMin = args[134];
		this.jamellaMax = args[135];
		this.jamellaMagicMin = args[136];
		this.jamellaMagicMax = args[137];
		this.jamellaMagicLvl = args[138];
		this.larzukMin = args[139];
		this.larzukMax = args[140];
		this.larzukMagicMin = args[141];
		this.larzukMagicMax = args[142];
		this.larzukMagicLvl = args[143];
		this.malahMin = args[144];
		this.malahMax = args[145];
		this.malahMagicMin = args[146];
		this.malahMagicMax = args[147];
		this.malahMagicLvl = args[148];
		this.drehyaMin = args[149];
		this.drehyaMax = args[150];
		this.drehyaMagicMin = args[151];
		this.drehyaMagicMax = args[152];
		this.drehyaMagicLvl = args[153];
		this.sourceArt = args[154];
		this.gameArt = args[155];
		this.transform = args[156];
		this.invTrans = args[157];
		this.skipName = args[158];

		this.minDamage = args[161];
		this.maxDamage = args[162];
		this.nameable = args[163];
	}

}

class BaseWeapon extends BaseItem {
	constructor(args) {
		super(args);
		const Index = BaseItem.ItemCount++;

		this.type = ItemType[Index];
		this.index = Index;
		this.tableIndex = Index - BaseItem.BASE_WEAPON_START;

		this.baseType = args[1] === "" ? null : BaseItemType.getByCode(args[1]);
		this.baseType2 = args[2] === "" ? null : BaseItemType.getByCode(args[2]);

		this.code = args[3];
		this.id = GetIdFromCode(args[3]);

		this.nightmareUpgrade = args[162] === "xxx" ? 0 : GetIdFromCode(args[162]);
		this.hellUpgrade = args[163] === "xxx" ? 0 : GetIdFromCode(args[163]);

		this.NormalID = GetIdFromCode(args[34]);
		this.ExceptionalID = GetIdFromCode(args[35]);
		this.EliteID = GetIdFromCode(args[36]);

		this.name = args[0];

		this.alternateGfx = args[4];
		this.nameString = args[5];
		this.version = args[6];
		this.compactSave = args[7];
		this.rarity = args[8];
		this.spawnable = args[9];
		this.minDamage = args[10];
		this.maxDamage = args[11];
		this.OneOrTwoHanded = args[12];
		this.TwoHanded = args[13];
		this.TwoHandMinDamage = args[14];
		this.TwoHandMaxDamage = args[15];
		this.MinMisDamage = args[16];
		this.MaxMisDamage = args[17];
		this.Unknown = args[18];
		this.RangeAdder = args[19];
		this.speed = args[20];
		this.StrBonus = args[21];
		this.DexBonus = args[22];
		this.ReqStr = args[23];
		this.ReqDex = args[24];
		this.Durability = args[25];
		this.noDurability = args[26];
		this.level = args[27];
		this.levelReq = args[28];
		this.cost = args[29];
		this.gambleCost = args[30];
		this.MagicLevel = args[31];
		this.autoPrefix = args[32];
		this.OpenBetaGfx = args[33];

		this.WeaponClass = args[37];
		this.TwoHandedWeaponClass = args[38];
		this.component = args[39];
		this.HitClass = args[40];
		this.invWidth = args[41];
		this.invHeight = args[42];
		this.stackable = args[43];
		this.minStack = args[44];
		this.maxStack = args[45];
		this.SpawnStack = args[46];
		this.flippyFile = args[47];
		this.invFile = args[48];
		this.uniqueInvFile = args[49];
		this.SetInvFile = args[50];
		this.hasInv = args[51];
		this.gemSockets = args[52];
		this.gemApplyType = args[53];
		this.Special = args[54];
		this.useable = args[55];
		this.dropSound = args[56];
		this.dropSfxFrame = args[57];
		this.useSound = args[58];
		this.unique = args[59];
		this.transparent = args[60];
		this.transTbl = args[61];
		this.Quivered = args[62];
		this.lightRadius = args[63];
		this.belt = args[64];
		this.quest = args[65];
		this.QuestDiffCheck = args[66];

		this.missileType = args[67];
		this.durabilityWarning = args[68];
		this.quantityWarning = args[69];
		this.gemOffset = args[70];
		this.bitField1 = args[71];
		this.charsiMin = args[72];
		this.charsiMax = args[73];
		this.charsiMagicMin = args[74];
		this.charsiMagicMax = args[75];
		this.charsiMagicLvl = args[76];
		this.gheedMin = args[77];
		this.gheedMax = args[78];
		this.gheedMagicMin = args[79];
		this.gheedMagicMax = args[80];
		this.gheedMagicLvl = args[81];
		this.akaraMin = args[82];
		this.akaraMax = args[83];
		this.akaraMagicMin = args[84];
		this.akaraMagicMax = args[85];
		this.akaraMagicLvl = args[86];
		this.faraMin = args[87];
		this.faraMax = args[88];
		this.faraMagicMin = args[89];
		this.faraMagicMax = args[90];
		this.faraMagicLvl = args[91];
		this.lysanderMin = args[92];
		this.lysanderMax = args[93];
		this.lysanderMagicMin = args[94];
		this.lysanderMagicMax = args[95];
		this.lysanderMagicLvl = args[96];
		this.drognanMin = args[97];
		this.drognanMax = args[98];
		this.drognanMagicMin = args[99];
		this.drognanMagicMax = args[100];
		this.drognanMagicLvl = args[101];
		this.hraltiMin = args[102];
		this.hraltiMax = args[103];
		this.hraltiMagicMin = args[104];
		this.hraltiMagicMax = args[105];
		this.hraltiMagicLvl = args[106];
		this.alkorMin = args[107];
		this.alkorMax = args[108];
		this.alkorMagicMin = args[109];
		this.alkorMagicMax = args[110];
		this.alkorMagicLvl = args[111];
		this.ormusMin = args[112];
		this.ormusMax = args[113];
		this.ormusMagicMin = args[114];
		this.ormusMagicMax = args[115];
		this.ormusMagicLvl = args[116];
		this.elzixMin = args[117];
		this.elzixMax = args[118];
		this.elzixMagicMin = args[119];
		this.elzixMagicMax = args[120];
		this.elzixMagicLvl = args[121];
		this.ashearaMin = args[122];
		this.ashearaMax = args[123];
		this.ashearaMagicMin = args[124];
		this.ashearaMagicMax = args[125];
		this.ashearaMagicLvl = args[126];
		this.cainMin = args[127];
		this.cainMax = args[128];
		this.cainMagicMin = args[129];
		this.cainMagicMax = args[130];
		this.cainMagicLvl = args[131];
		this.halbuMin = args[132];
		this.halbuMax = args[133];
		this.halbuMagicMin = args[134];
		this.halbuMagicMax = args[135];
		this.halbuMagicLvl = args[136];
		this.jamellaMin = args[137];
		this.jamellaMax = args[138];
		this.jamellaMagicMin = args[139];
		this.jamellaMagicMax = args[140];
		this.jamellaMagicLvl = args[141];
		this.larzukMin = args[142];
		this.larzukMax = args[143];
		this.larzukMagicMin = args[144];
		this.larzukMagicMax = args[145];
		this.larzukMagicLvl = args[146];
		this.drehyaMin = args[147];
		this.drehyaMax = args[148];
		this.drehyaMagicMin = args[149];
		this.drehyaMagicMax = args[150];
		this.drehyaMagicLvl = args[151];
		this.malahMin = args[152];
		this.malahMax = args[153];
		this.malahMagicMin = args[154];
		this.malahMagicMax = args[155];
		this.malahMagicLvl = args[156];
		this.sourceArt = args[157];
		this.gameArt = args[158];
		this.transform = args[159];
		this.invTrans = args[160];
		this.skipName = args[161];

		this.nameable = args[164];
		this.PermStoreItem = args[165];
	}
}

class BaseItemType {
	constructor(args) {
		this.id = BaseItemType.instances.push(this);
		const Index = BaseItemType.ItemCount++;

		this.Index = Index;
		this.Type = Index; // ItemKind

		this.Name = args[0];
		this.Code = args[1];
		this.Equiv1 = args[2];
		this.Equiv2 = args[3];
		this.Repair = args[4];
		this.Body = args[5];
		this.BodyLoc1 = args[6];
		this.BodyLoc2 = args[7];
		this.Shoots = args[8];
		this.Quiver = args[9];
		this.Throwable = args[10];
		this.Reload = args[11];
		this.ReEquip = args[12];
		this.AutoStack = args[13];
		this.Magic = args[14];
		this.Rare = args[15];
		this.Normal = args[16];
		this.Charm = args[17];
		this.Gem = args[18];
		this.Beltable = args[19];
		this.MaxSock1 = args[20];
		this.MaxSock25 = args[21];
		this.MaxSock40 = args[22];
		this.TreasureClass = args[23];
		this.Rarity = args[24];
		this.StaffMods = args[25]; //(CharacterClass.CharacterClass)
		this.CostFormula = args[26];
		this.Class = args[27]; // (CharacterClass::CharacterClass)
		this.VarInvGfx = args[28];
		this.InvGfx1 = args[29];
		this.InvGfx2 = args[30];
		this.InvGfx3 = args[31];
		this.InvGfx4 = args[32];
		this.InvGfx5 = args[33];
		this.InvGfx6 = args[34];
		this.Page = args[35]; //(StorePage::StorePage)
	}

	static ItemCount = 0;
	static instances = [];

	static getByCode(code) {
		return this.instances.find(instance => instance.Code === code);
	}
}

class ItemCode {
	constructor(code) {
		this.set(code);
	}

	set(code) {
		this.data = new DataView(new ArrayBuffer(4));

		if (typeof code === 'number') {
			this.data.setUint32(0, code, true);
		} else if (typeof code === 'string') {
			for (let i = 0; i < 4; i++)
				this.data.setUint8(i, code.charCodeAt(i) || 0x20);
		}
	}

	toString() {
		let ret = [];
		for (let i = 0; i < 4; i++)
			ret[i] = this.data.getUint8(i);
		return String.fromCharCode(...ret).trim();
	}

	toUint32(littleEndian = true) {
		return this.data.getUint32(0, true);
	}
}

function GetIdFromCode(code) {
	return new ItemCode(code, true).toUint32();
}

class BaseStat {
	constructor(args) {
		this.Name = args[0];
		this.Stat = args[1];
		this.TableIndex = this.Index = args[2];
		BaseStat.instances[this.Index] = this;

		this.Type = args[2];// (StatType::StatType)

		this.SendOther = !!args[3];
		this.Signed = !!args[4];
		this.SendBits = args[5];
		this.SendParamBits = args[6];
		this.UpdateAnimRate = args[7];
		this.Saved = args[8];
		this.CSvSigned = args[9];
		this.CSvBits = args[10];
		this.CSvParam = args[11];
		this.fCallback = args[12];
		this.fMin = args[13];
		this.MinAccr = args[14];
		this.Encode = args[15];
		this.Add = args[16];
		this.Multiply = args[17];
		this.Divide = args[18];
		this.ValShift = args[19];
		this.SaveBits_1_09 = args[20];
		this.SaveAdd_1_09 = args[21];
		this.SaveBits = args[22];
		this.SaveAdd = args[23];
		this.SaveParamBits = args[24];
		this.KeepZero = !!args[25];
		this.Op = args[26];
		this.OpParam = args[27];
		this.OpBase = args[28]; // (StatType::StatType)
		this.OpStat1 = args[29]; // (StatType::StatType)
		this.OpStat2 = args[30]; // (StatType::StatType)
		this.OpStat3 = args[31]; // (StatType::StatType)
		this.Direct = !!args[32];
		this.MaxStat = args[33]; // (StatType::StatType)
		this.ItemSpecific = !!args[34];
		this.DamageRelated = !!args[35];
		this.ItemEvent1 = args[36]; // (ItemEventType::ItemEventType)
		this.ItemEventFunc1 = args[37];
		this.ItemEvent2 = args[38]; // (ItemEventType::ItemEventType)
		this.ItemEventFunc2 = args[39];
		this.DescPriority = args[40];
		this.DescFunc = args[41];
		this.DescVal = args[42];
		this.DescStrPos = args[43];
		this.DescStrNeg = args[44];
		this.DescStr2 = args[45];
		this.DGrp = args[46];
		this.DGrpFunc = args[47];
		this.DGrpval = args[48];
		this.DGrpStrPos = args[49];
		this.DGrpStrNeg = args[50];
		this.DGrpStr2 = args[51];
		this.Stuff = args[52];
	}

	static instances = {};

	static get(type) {
		return Object.keys(BaseStat.instances).filter(key => BaseStat.instances[key] instanceof BaseStat && BaseStat.instances[key].Index === type).map(key => BaseStat.instances[key])[0];
	}

}

class BaseUniqueItem {
	constructor(args) {
		let Index = BaseUniqueItem.ItemCount++;

		this.Index = Index;
		this.Id = Index; // (UniqueItemType::UniqueItemType)

		if (!args.length) {
			return;
		}

		this.Item = BaseItem.getByCode(args[8]);

		this.Name = args[0];
		this.Version = args[1];
		this.Enabled = args[2];
		this.Ladder = args[3];
		this.Rarity = args[4];
		this.NoLimit = args[5];
		this.DropLevel = args[6];
		this.RequiredLevel = args[7];

		this.BaseItemName = args[9];
		this.Uber = args[10];
		this.Carry1 = args[11];
		this.CostMultiply = args[12];
		this.CostAdd = args[13];
		this.CharTransform = args[14];
		this.InvTransform = args[15];
		this.FlippyFile = args[16];
		this.InvFile = args[17];
		this.DropSound = args[18];
		this.DropSfxFrame = args[19];
		this.UseSound = args[20];

		this.Property1 = args[21].toString().length ? args[21] : null;
		this.Param1 = args[22];
		this.Min1 = args[23];
		this.Max1 = args[24];

		this.Property2 = args[25].toString().length ? args[25] : null;
		this.Param2 = args[26];
		this.Min2 = args[27];
		this.Max2 = args[28];

		this.Property3 = args[29].toString().length ? args[29] : null;
		this.Param3 = args[30];
		this.Min3 = args[31];
		this.Max3 = args[32];

		this.Property4 = args[33].toString().length ? args[33] : null;
		this.Param4 = args[34];
		this.Min4 = args[35];
		this.Max4 = args[36];

		this.Property5 = args[37].toString().length ? args[37] : null;
		this.Param5 = args[38];
		this.Min5 = args[39];
		this.Max5 = args[40];

		this.Property6 = args[41].toString().length ? args[41] : null;
		this.Param6 = args[42];
		this.Min6 = args[43];
		this.Max6 = args[44];

		this.Property7 = args[45].toString().length ? args[45] : null;
		this.Param7 = args[46];
		this.Min7 = args[47];
		this.Max7 = args[48];

		this.Property8 = args[49].toString().length ? args[49] : null;
		this.Param8 = args[50];
		this.Min8 = args[51];
		this.Max8 = args[52];

		this.Property9 = args[53].toString().length ? args[53] : null;
		this.Param9 = args[54];
		this.Min9 = args[55];
		this.Max9 = args[56];

		this.Property10 = args[57].toString().length ? args[57] : null;
		this.Param10 = args[58];
		this.Min10 = args[59];
		this.Max10 = args[60];

		this.Property11 = args[61].toString().length ? args[61] : null;
		this.Param11 = args[62];
		this.Min11 = args[63];
		this.Max11 = args[64];

		this.Property12 = args[65].toString().length ? args[65] : null;
		this.Param12 = args[66];
		this.Min12 = args[67];
		this.Max12 = args[68];
	}
}

class D2Objects {
	constructor(args) {
		let i = 0;
		this.Name = args[i++];
		this.description = args[i++];
		this.Id = args[i++];
		this.Token = args[i++];
		this.SpawnMax = args[i++];
		this.Selectable0 = args[i++];
		this.Selectable1 = args[i++];
		this.Selectable2 = args[i++];
		this.Selectable3 = args[i++];
		this.Selectable4 = args[i++];
		this.Selectable5 = args[i++];
		this.Selectable6 = args[i++];
		this.Selectable7 = args[i++];
		this.TrapProb = args[i++];
		this.SizeX = args[i++];
		this.SizeY = args[i++];
		this.nTgtFX = args[i++];
		this.nTgtFY = args[i++];
		this.nTgtBX = args[i++];
		this.nTgtBY = args[i++];
		this.FrameCnt0 = args[i++];
		this.FrameCnt1 = args[i++];
		this.FrameCnt2 = args[i++];
		this.FrameCnt3 = args[i++];
		this.FrameCnt4 = args[i++];
		this.FrameCnt5 = args[i++];
		this.FrameCnt6 = args[i++];
		this.FrameCnt7 = args[i++];
		this.FrameDelta0 = args[i++];
		this.FrameDelta1 = args[i++];
		this.FrameDelta2 = args[i++];
		this.FrameDelta3 = args[i++];
		this.FrameDelta4 = args[i++];
		this.FrameDelta5 = args[i++];
		this.FrameDelta6 = args[i++];
		this.FrameDelta7 = args[i++];
		this.CycleAnim0 = args[i++];
		this.CycleAnim1 = args[i++];
		this.CycleAnim2 = args[i++];
		this.CycleAnim3 = args[i++];
		this.CycleAnim4 = args[i++];
		this.CycleAnim5 = args[i++];
		this.CycleAnim6 = args[i++];
		this.CycleAnim7 = args[i++];
		this.Lit0 = args[i++];
		this.Lit1 = args[i++];
		this.Lit2 = args[i++];
		this.Lit3 = args[i++];
		this.Lit4 = args[i++];
		this.Lit5 = args[i++];
		this.Lit6 = args[i++];
		this.Lit7 = args[i++];
		this.BlocksLight0 = args[i++];
		this.BlocksLight1 = args[i++];
		this.BlocksLight2 = args[i++];
		this.BlocksLight3 = args[i++];
		this.BlocksLight4 = args[i++];
		this.BlocksLight5 = args[i++];
		this.BlocksLight6 = args[i++];
		this.BlocksLight7 = args[i++];
		this.HasCollision0 = args[i++];
		this.HasCollision1 = args[i++];
		this.HasCollision2 = args[i++];
		this.HasCollision3 = args[i++];
		this.HasCollision4 = args[i++];
		this.HasCollision5 = args[i++];
		this.HasCollision6 = args[i++];
		this.HasCollision7 = args[i++];
		this.IsAttackable0 = args[i++];
		this.Start0 = args[i++];
		this.Start1 = args[i++];
		this.Start2 = args[i++];
		this.Start3 = args[i++];
		this.Start4 = args[i++];
		this.Start5 = args[i++];
		this.Start6 = args[i++];
		this.Start7 = args[i++];
		this.EnvEffect = args[i++];
		this.IsDoor = args[i++];
		this.BlocksVis = args[i++];
		this.Orientation = args[i++];
		this.Trans = args[i++];
		this.OrderFlag0 = args[i++];
		this.OrderFlag1 = args[i++];
		this.OrderFlag2 = args[i++];
		this.OrderFlag3 = args[i++];
		this.OrderFlag4 = args[i++];
		this.OrderFlag5 = args[i++];
		this.OrderFlag6 = args[i++];
		this.OrderFlag7 = args[i++];
		this.PreOperate = args[i++];
		this.Mode0 = args[i++];
		this.Mode1 = args[i++];
		this.Mode2 = args[i++];
		this.Mode3 = args[i++];
		this.Mode4 = args[i++];
		this.Mode5 = args[i++];
		this.Mode6 = args[i++];
		this.Mode7 = args[i++];
		this.Yoffset = args[i++];
		this.Xoffset = args[i++];
		this.Draw = args[i++];
		this.Red = args[i++];
		this.Green = args[i++];
		this.Blue = args[i++];
		this.HD = args[i++];
		this.TR = args[i++];
		this.LG = args[i++];
		this.RA = args[i++];
		this.LA = args[i++];
		this.RH = args[i++];
		this.LH = args[i++];
		this.SH = args[i++];
		this.S1 = args[i++];
		this.S2 = args[i++];
		this.S3 = args[i++];
		this.S4 = args[i++];
		this.S5 = args[i++];
		this.S6 = args[i++];
		this.S7 = args[i++];
		this.S8 = args[i++];
		this.TotalPieces = args[i++];
		this.SubClass = args[i++];
		this.Xspace = args[i++];
		this.Yspace = args[i++];
		this.NameOffset = args[i++];
		this.MonsterOK = args[i++];
		this.OperateRange = args[i++];
		this.ShrineFunction = args[i++];
		this.Restore = args[i++];
		this.Parm0 = args[i++];
		this.Parm1 = args[i++];
		this.Parm2 = args[i++];
		this.Parm3 = args[i++];
		this.Parm4 = args[i++];
		this.Parm5 = args[i++];
		this.Parm6 = args[i++];
		this.Parm7 = args[i++];
		this.Act = args[i++];
		this.Lockable = args[i++];
		this.Gore = args[i++];
		this.Sync = args[i++];
		this.Flicker = args[i++];
		this.Damage = args[i++];
		this.Beta = args[i++];
		this.Overlay = args[i++];
		this.CollisionSubst = args[i++];
		this.Left = args[i++];
		this.Top = args[i++];
		this.Width = args[i++];
		this.Height = args[i++];
		this.OperateFn = args[i++];
		this.PopulateFn = args[i++];
		this.InitFn = args[i++];
		this.ClientFn = args[i++];
		this.RestoreVirgins = args[i++];
		this.BlockMissile = args[i++];
		this.DrawUnder = args[i++];
		this.OpenWarp = args[i++];
		this.AutoMap = args[i++];
		D2Objects.instances.push(this);
	}

	static instances = []
}

/*class LvlPrest {
	constructor(args) {
		let i = 0;
		this.Name = args[i++];
		this.Def = args[i++];
		this.LevelId = args[i++];
		this.Populate = args[i++];
		this.Logicals = args[i++];
		this.Outdoors = args[i++];
		this.Animate = args[i++];
		this.KillEdge = args[i++];
		this.FillBlanks = args[i++];
		this.SizeX = args[i++];
		this.SizeY = args[i++];
		this.AutoMap = args[i++];
		this.Scan = args[i++];
		this.Pops = args[i++];
		this.PopPad = args[i++];
		this.Files = args[i++];
		this.File1 = args[i++];
		this.File2 = args[i++];
		this.File3 = args[i++];
		this.File4 = args[i++];
		this.File5 = args[i++];
		this.File6 = args[i++];
		this.Dt1Mask = args[i++];
		this.Beta = args[i++];
		LvlPrest.instances.push(this);
	}

	static instances = []
}

class Levels {
	constructor(args) {
		let i = 0;
		this.Name = args[i++];
		this.Id = args[i++];
		this.Pal = args[i++];
		this.Act = args[i++];
		this.Layer = args[i++];
		this.SizeX = args[i++];
		this.SizeY = args[i++];
		this.OffsetX = args[i++];
		this.OffsetY = args[i++];
		this.Depend = args[i++];
		this.Rain = args[i++];
		this.Mud = args[i++];
		this.NoPer = args[i++];
		this.LOSDraw = args[i++];
		this.FloorFilter = args[i++];
		this.BlankScreen = args[i++];
		this.DrawEdges = args[i++];
		this.IsInside = args[i++];
		this.DrlgType = args[i++];
		this.LevelType = args[i++];
		this.SubType = args[i++];
		this.SubTheme = args[i++];
		this.SubWaypoint = args[i++];
		this.SubShrine = args[i++];
		this.Vis0 = args[i++];
		this.Vis1 = args[i++];
		this.Vis2 = args[i++];
		this.Vis3 = args[i++];
		this.Vis4 = args[i++];
		this.Vis5 = args[i++];
		this.Vis6 = args[i++];
		this.Vis7 = args[i++];
		this.Warp0 = args[i++];
		this.Warp1 = args[i++];
		this.Warp2 = args[i++];
		this.Warp3 = args[i++];
		this.Warp4 = args[i++];
		this.Warp5 = args[i++];
		this.Warp6 = args[i++];
		this.Warp7 = args[i++];
		this.Intensity = args[i++];
		this.Red = args[i++];
		this.Green = args[i++];
		this.Blue = args[i++];
		this.Portal = args[i++];
		this.Position = args[i++];
		this.SaveMonsters = args[i++];
		this.Quest = args[i++];
		this.WarpDist = args[i++];
		this.MonLvl1 = args[i++];
		this.MonLvl2 = args[i++];
		this.MonLvl3 = args[i++];
		this.MonDen = args[i++];
		this.MonUMin = args[i++];
		this.MonUMax = args[i++];
		this.MonWndr = args[i++];
		this.MonSpcWalk = args[i++];
		this.Mtot = args[i++];
		this.M1 = args[i++];
		this.M2 = args[i++];
		this.M3 = args[i++];
		this.M4 = args[i++];
		this.M5 = args[i++];
		this.M6 = args[i++];
		this.M7 = args[i++];
		this.M8 = args[i++];
		this.M9 = args[i++];
		this.M10 = args[i++];
		this.M11 = args[i++];
		this.M12 = args[i++];
		this.M13 = args[i++];
		this.M14 = args[i++];
		this.M15 = args[i++];
		this.M16 = args[i++];
		this.M17 = args[i++];
		this.M18 = args[i++];
		this.M19 = args[i++];
		this.M20 = args[i++];
		this.M21 = args[i++];
		this.M22 = args[i++];
		this.M23 = args[i++];
		this.M24 = args[i++];
		this.M25 = args[i++];
		this.S1 = args[i++];
		this.S2 = args[i++];
		this.S3 = args[i++];
		this.S4 = args[i++];
		this.S5 = args[i++];
		this.S6 = args[i++];
		this.S7 = args[i++];
		this.S8 = args[i++];
		this.S9 = args[i++];
		this.S10 = args[i++];
		this.S11 = args[i++];
		this.S12 = args[i++];
		this.S13 = args[i++];
		this.S14 = args[i++];
		this.S15 = args[i++];
		this.S16 = args[i++];
		this.S17 = args[i++];
		this.S18 = args[i++];
		this.S19 = args[i++];
		this.S20 = args[i++];
		this.S21 = args[i++];
		this.S22 = args[i++];
		this.S23 = args[i++];
		this.S24 = args[i++];
		this.S25 = args[i++];
		this.Utot = args[i++];
		this.U1 = args[i++];
		this.U2 = args[i++];
		this.U3 = args[i++];
		this.U4 = args[i++];
		this.U5 = args[i++];
		this.U6 = args[i++];
		this.U7 = args[i++];
		this.U8 = args[i++];
		this.U9 = args[i++];
		this.U10 = args[i++];
		this.U11 = args[i++];
		this.U12 = args[i++];
		this.U13 = args[i++];
		this.U14 = args[i++];
		this.U15 = args[i++];
		this.U16 = args[i++];
		this.U17 = args[i++];
		this.U18 = args[i++];
		this.U19 = args[i++];
		this.U20 = args[i++];
		this.U21 = args[i++];
		this.U22 = args[i++];
		this.U23 = args[i++];
		this.U24 = args[i++];
		this.U25 = args[i++];
		this.C1 = args[i++];
		this.C2 = args[i++];
		this.C3 = args[i++];
		this.C4 = args[i++];
		this.C5 = args[i++];
		this.CA1 = args[i++];
		this.CA2 = args[i++];
		this.CA3 = args[i++];
		this.CA4 = args[i++];
		this.CA5 = args[i++];
		this.CD1 = args[i++];
		this.CD2 = args[i++];
		this.CD3 = args[i++];
		this.CD4 = args[i++];
		this.CD5 = args[i++];
		this.Themes = args[i++];
		this.SoundEnv = args[i++];
		this.Waypoint = args[i++];
		this.LevelName = args[i++];
		this.LevelWarp = args[i++];
		this.EntryFile = args[i++];
		this.ObjGrp0 = args[i++];
		this.ObjGrp1 = args[i++];
		this.ObjGrp2 = args[i++];
		this.ObjGrp3 = args[i++];
		this.ObjGrp4 = args[i++];
		this.ObjGrp5 = args[i++];
		this.ObjGrp6 = args[i++];
		this.ObjGrp7 = args[i++];
		this.ObjPrb0 = args[i++];
		this.ObjPrb1 = args[i++];
		this.ObjPrb2 = args[i++];
		this.ObjPrb3 = args[i++];
		this.ObjPrb4 = args[i++];
		this.ObjPrb5 = args[i++];
		this.ObjPrb6 = args[i++];
		this.ObjPrb7 = args[i++];
		this.Beta = args[i++];

		Levels.instances[this.Id] = this;
	}

	static instances = {};

}

class LevelPreset {
	constructor(levelid) {
		this.levels = [0, 1, 2, 3, 4, 5, 7]
			.map(id => LvlPrest.instances[levelid]['File' + id])
			.filter(_ => _)
			.map(file => DS1.loadFile(__dirname + '\\..\\data\\tiles\\', file, D2Objects));
		LevelPreset.instances.push(this);
	}

	static instances = [];
}*/

{ // Just a block =)
	/**
	 *
	 * @param {Buffer} data
	 * @param {BaseItem} obj
	 */
	function readCSV(data, obj) {
		data.toString('utf8').replace('\r\n', '\n').split('\n')
			.map(x => '[' + x + ']')
			.map(x => {
				try {
					return JSON.parse(x);
				} catch (e) {
					return undefined;
				}
			})
			.forEach(x => new obj(x || []));
	}

	{
		const models = {BaseStat, BaseItemType, BaseMiscItem, BaseArmor, BaseWeapon, BaseUniqueItem};
		const csvs = ['BaseStat', 'BaseItemType', 'BaseMiscItem', 'BaseArmor', 'BaseWeapon', 'BaseUniqueItem'].map(x => [__dirname + '\\..\\data\\' + x + '.csv', x]);

		csvs.forEach(([file, model]) => readCSV(fs.readFileSync(file), models[model]));
	}
	/*{
		const models = {D2Objects, Levels, LvlPrest};
		const semicolons = ['D2Objects', 'Levels', 'LvlPrest'].map(x => [__dirname + '\\..\\data\\' + x + '.semicolon', x]);

		semicolons.forEach(([file, model]) => ((data, model) => {
			data.toString('utf8').replace('\r\n', '\n').split('\n')
				.map(line => line.split(';').map(toInt => {
					let parsed = parseInt(toInt);
					if (parsed.toString() === toInt) {
						return parsed
					}
					return toInt;
				})).forEach(line => new model(line));
		})(fs.readFileSync(file), models[model]));
	}*/


	module.exports.BaseItem = BaseItem;
	module.exports.BaseItemType = BaseItemType;
	module.exports.BaseStat = BaseStat;
	module.exports.BaseUniqueItem = BaseUniqueItem;
	//module.exports.D2Objects = D2Objects;
	//module.exports.LvlPrest = LvlPrest;
	// console.log('Loading lvl presets...');
	// LvlPrest.instances.forEach((key, index) => new LevelPreset(index))
}
