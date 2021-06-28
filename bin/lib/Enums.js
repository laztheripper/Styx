module.exports.ItemLocation = {
	/*Unspecified: 0,
	Inventory: 2,
	TraderOffer: 4,
	ForTrade: 6,
	Cube: 8,
	Stash: 0x0A,
	// Not a buffer... flagged with 0x20 if (action == PutInBelt || RemoveFromBelt)
	Belt: 0x20,
	// Not a buffer... if (buffer == Equipement && destination == Item)
	Item: 0x40,
	//NPC buffers are flagged with 0x80 so they are different
	ArmorTab: 0x82,
	WeaponTab1: 0x84,
	WeaponTab2: 0x86,
	MiscTab: 0x88,
	//ArmorTabBottom  :0x83, // Buffer merged with ArmorTab
	//WeaponTab1Bottom:0x85, // Buffer merged with WeaponTab1
	//MiscTabBottom   :0x89, // Buffer merged with WeaponTab2*/

	Disappeared: -1,
	Equipment: 0x00,
	Inventory: 0x01,
	TraderOffer: 0x02,
	ForTrade: 0x03,
	Cube: 0x04,
	Stash: 0x05,
	Ground: 0x06,
	Belt: 0x07,
	Item: 0x08,
	ArmorTab: 0x101,
	WeaponTab1: 0x102,
	WeaponTab2: 0x103,
	MiscTab: 0x104,
};

module.exports.ItemFlags = {
	None: 0,
	Equipped: 1,
	Bought: 2,
	Cursor: 4,
	InSocket: 8, // Applies to runes and jewels but not gems
	Identified: 0x10,
	Destroyed: 0x20,
	SwitchedIn: 0x40,
	SwitchedOut: 0x80,
	Broken: 0x100,
	Restored: 0x200,
	Duplicate: 0x400, // Sometimes on Mana, Healing and Rejuvenation potions and runes... use is unknown.
	Socketed: 0x800,
	OnPet: 0x1000,
	New: 0x2000,
	Disabled: 0x4000, // Illegal Equip ?
	Hardcore: 0x8000,
	Ear: 0x10000,
	StartItem: 0x20000,
	Restrict: 0x40000,
	Server: 0x80000,
	//UNKNOWN: 0x100000,
	Simple: 0x200000,
	Ethereal: 0x400000,
	Any: 0x800000, // Item is saved
	Personalized: 0x1000000,
	Gamble: 0x2000000,
	Runeword: 0x4000000,
	Magical: 0x8000000,
	StaffMods: 0x10000000,
	Cursed: 0x20000000,
};

module.exports.EquipmentLocation = {
	NotApplicable: 0,
	Helm: 1,
	Amulet: 2,
	Armor: 3,
	RightHand: 4,
	LeftHand: 5,
	RightHandRing: 6,
	LeftHandRing: 7,
	Belt: 8,
	Boots: 9,
	Gloves: 10,
	RightHandSwitch: 11,
	LeftHandSwitch: 12,
};

module.exports.ItemActionType = {
	AddToGround: 0,
	// Only sent if item goes to cursor (packet 0x0A removes items from ground...)
	GroundToCursor: 1,
	DropToGround: 2,
	OnGround: 3,
	PutInContainer: 4,
	RemoveFromContainer: 5,
	Equip: 6,
	// Sent for the equipped item when changing from a two handed weapon to a single handed weapon or vice versa.
	// <para>The item must be equipped on the "empty" hand or a regular SwapBodyItem will be sent instead.
	// If currently wearing a two handed weapon, the empty hand means the left hand.
	// The result will be the new item being equipped and the old going to cursor.</para>
	IndirectlySwapBodyItem: 7,
	Unequip: 8,
	SwapBodyItem: 9,
	AddQuantity: 0x0A,
	AddToShop: 0x0B,
	RemoveFromShop: 0x0C,
	SwapInContainer: 0x0D,
	PutInBelt: 0x0E,
	RemoveFromBelt: 0x0F,
	SwapInBelt: 0x10,
	// Sent for the secondary hand's item going to inventory when changing from a dual item setup to a two handed weapon.
	AutoUnequip: 0x11,
	// Item on cursor when entering game.
	// <para>Also sent along with a 0x9d type 0x08 packet when unequipping merc item.</para>
	ToCursor: 0x12,
	ItemInSocket: 0x13,
	UNKNOWNx14: 0x14,
	// When inserting item in socket, for each potion that drops in belt when lower one is removed, etc.
	UpdateStats: 0x15,
	UNKNOWNx16: 0x16,
	WeaponSwitch: 0x17,
};

module.exports.ItemQuality = {
	NotApplicable: 0,
	Inferior: 1,
	Normal: 2,
	Superior: 3,
	Magic: 4,
	Set: 5,
	Rare: 6,
	Unique: 7,
	Crafted: 8,
};

module.exports.ItemDestination = {
	Container: 0,
	Equipment: 4,
	Belt: 8,
	Ground: 0x0C,
	Cursor: 0x10,
	Item: 0x18,
};

module.exports.ItemCategory = {
	Helm: 0,
	Armor: 1,
	Weapon: 5, // Most weapons, including Crossbows
	Weapon2: 6, // Bows (not crossbows), sometimes shield (if equipped in LeftHand?)
	Shield: 7, // Shields can some sometimes be Weapon2...
	Special: 10,
	Misc: 16, // BaseMiscItems and gloves, boots...
};

module.exports.ItemAffixType = {
	NotApplicable: 0,
	Prefix: 1,
	Suffix: 2,

	Inferior: 4,
	InferiorPrefix: 5,

	Superior: 8,
	SuperiorPrefix: 9,

	Magic: 0x10,
	MagicPrefix: 0x11,
	MagicSuffix: 0x12,

	Rare: 0x20,
	RarePrefix: 0x21,
	RareSuffix: 0x22,
};

module.exports.StatType = { // Probably won't be used, but whatevs
	None: -1,
	Strength: 0,
	Energy: 1,
	Dexterity: 2,
	Vitality: 3,
	StatPoints: 4,
	SkillPoints: 5,
	Life: 6,
	MaxLife: 7,
	Mana: 8,
	MaxMana: 9,
	Stamina: 10,
	MaxStamina: 11,
	Level: 12,
	Experience: 13,
	Gold: 14,
	GoldBank: 15,
	DefensePercent: 16,
	MaxDamagePercent: 17,
	MinDamagePercent: 18,
	ToHit: 19,
	ToBlock: 20,
	MinDamage: 21,
	MaxDamage: 22,
	SecondaryMinDamage: 23,
	SecondaryMaxDamage: 24,
	DamagePercent: 25,
	ManaRecovery: 26,
	ManaRecoveryBonus: 27,
	StaminaRecoveryBonus: 28,
	LastExperience: 29,
	NextExperience: 30,
	ArmorClass: 31,
	ArmorClassVsMissile: 32,
	ArmorClassVsMelee: 33,
	DamageReduction: 34,
	MagicDamageReduction: 35,
	DamageResist: 36,
	MagicResist: 37,
	MaxMagicResist: 38,
	FireResist: 39,
	MaxFireResist: 40,
	LightResist: 41,
	MaxLightResist: 42,
	ColdResist: 43,
	MaxColdResist: 44,
	PoisonResist: 45,
	MaxPoisonResist: 46,
	DamageAura: 47,
	FireMinDamage: 48,
	FireMaxDamage: 49,
	LightMinDamage: 50,
	LightMaxDamage: 51,
	MagicMinDamage: 52,
	MagicMaxDamage: 53,
	ColdMinDamage: 54,
	ColdMaxDamage: 55,
	ColdLength: 56,
	PoisonMinDamage: 57,
	PoisonMaxDamage: 58,
	PoisonLength: 59,
	LifeDrainMinDamage: 60,
	LifeDrainMaxDamage: 61,
	ManaDrainMinDamage: 62,
	ManaDrainMaxDamage: 63,
	StamDrainMinDamage: 64,
	StamDrainMaxDamage: 65,
	StunLength: 66,
	VelocityPercent: 67,
	AttackRate: 68,
	OtherAnimRate: 69,
	Quantity: 70,
	Value: 71,
	Durability: 72,
	MaxDurability: 73,
	LifeRegen: 74,
	MaxDurabilityPercent: 75,
	MaxLifePercent: 76,
	MaxManaPercent: 77,
	AttackerTakesDamage: 78,
	GoldFind: 79,
	MagicFind: 80,
	Knockback: 81,
	TimeDuration: 82,
	ClassSkillsBonus: 83,
	UnsentParam1: 84,
	AddExperience: 85,
	HealAfterKill: 86,
	ReducedPrices: 87,
	DoubleHerbDuration: 88,
	LightRadius: 89,
	LightColor: 90,
	LowerRequirementsPercent: 91,
	LowerLevelRequirement: 92,
	FasterAttackRate: 93,
	LowerLevelRequirementPercent: 94,
	LastBlockFrame: 95,
	FasterMoveVelocity: 96,
	NonClassSkill: 97,
	State: 98,
	FasterHitRecovery: 99,
	MonsterPlayerCount: 100,
	SkillPoisonOverrideLength: 101,
	FasterBlockRate: 102,
	SkillBypassUndead: 103,
	SkillBypassDemons: 104,
	FasterCastRate: 105,
	SkillBypassBeasts: 106,
	SingleSkill: 107,
	RestInPeace: 108,
	CurseResistance: 109,
	PoisonLengthReduction: 110,
	NormalDamage: 111,
	Howl: 112,
	HitBlindsTarget: 113,
	DamageToMana: 114,
	IgnoreTargetDefense: 115,
	FractionalTargetAC: 116,
	PreventHeal: 117,
	HalfFreezeDuration: 118,
	ToHitPercent: 119,
	DamageTargetAC: 120,
	DemonDamagePercent: 121,
	UndeadDamagepercent: 122,
	DemonToHit: 123,
	UndeadToHit: 124,
	Throwable: 125,
	ElementalSkillBonus: 126,
	AllSkillsBonus: 127,
	AttackerTakesLightningDamage: 128,
	IronMaidenLevel: 129,
	LifeTapLevel: 130,
	ThornsPercent: 131,
	BoneArmor: 132,
	BoneArmorMax: 133,
	Freeze: 134,
	OpenWounds: 135,
	CrushingBlow: 136,
	KickDamage: 137,
	ManaAfterKill: 138,
	HealAfterDemonKill: 139,
	ExtraBlood: 140,
	DeadlyStrike: 141,
	AbsorbFirePercent: 142,
	AbsorbFire: 143,
	AbsorbLightningPercent: 144,
	AbsorbLight: 145,
	AbsorbMagicPercent: 146,
	AbsorbMagic: 147,
	AbsorbColdPercent: 148,
	AbsorbCold: 149,
	Slow: 150,
	Aura: 151,
	Indesctructible: 152,
	CannotBeFrozen: 153,
	StaminaDrainPercent: 154,
	Reanimate: 155,
	Pierce: 156,
	MagicArrow: 157,
	ExplosiveArrow: 158,
	ThrowMinDamage: 159,
	ThrowMaxDamage: 160,
	SkillHandOfAthena: 161,
	SkillStaminaPercent: 162,
	SkillPassiveStaminaPercent: 163,
	SkillConcentration: 164,
	SkillEnchant: 165,
	SkillPierce: 166,
	SkillConviction: 167,
	SkillChillingArmor: 168,
	SkillFrenzy: 169,
	SkillDecrepify: 170,
	SkillArmorPercent: 171,
	Alignment: 172,
	Target0: 173,
	Target1: 174,
	GoldLost: 175,
	ConversionLevel: 176,
	ConversionMaxHP: 177,
	UnitDoOverlay: 178,
	AttackVsMonsterType: 179,
	DamageVsMonsterType: 180,
	Fade: 181,
	ArmorOverridePercent: 182,
	Unused183: 183,
	Unused184: 184,
	Unused185: 185,
	Unused186: 186,
	Unused187: 187,
	SkillTabBonus: 188,
	Unused189: 189,
	Unused190: 190,
	Unused191: 191,
	Unused192: 192,
	Unused193: 193,
	Sockets: 194,
	SkillOnAttack: 195,
	SkillOnKill: 196,
	SkillOnDeath: 197,
	SkillOnStriking: 198,
	SkillOnLevelUp: 199,
	Unused200: 200,
	SkillOnGetHit: 201,
	Unused202: 202,
	Unused203: 203,
	ChargedSkill: 204,
	Unused204: 205,
	Unused205: 206,
	Unused206: 207,
	Unused207: 208,
	Unused208: 209,
	Unused209: 210,
	Unused210: 211,
	Unused211: 212,
	Unused212: 213,
	ArmorPerLevel: 214,
	ArmorPercentPerLevel: 215,
	LifePerLevel: 216,
	ManaPerLevel: 217,
	MaxDamagePerLevel: 218,
	MaxDamagePercentPerLevel: 219,
	StrengthPerLevel: 220,
	DexterityPerLevel: 221,
	EnergyPerLevel: 222,
	VitalityPerLevel: 223,
	ToHitPerLevel: 224,
	ToHitPercentPerLevel: 225,
	ColdDamageMaxPerLevel: 226,
	FireDamageMaxPerLevel: 227,
	LightningDamageMaxPerLevel: 228,
	PoisonDamageMaxPerLevel: 229,
	ResistColdPerLevel: 230,
	ResistFirePerLevel: 231,
	ResistLightningPerLevel: 232,
	ResistPoisonPerLevel: 233,
	AbsorbColdPerLevel: 234,
	AbsorbFirePerLevel: 235,
	AbsorbLightningPerLevel: 236,
	AbsorbPoisonPerLevel: 237,
	ThornsPerLevel: 238,
	GoldFindPerLevel: 239,
	MagicFindPerLevel: 240,
	RegenStaminaPerLevel: 241,
	StaminaPerLevel: 242,
	DamageDemonPerLevel: 243,
	DamageUndeadPerLevel: 244,
	ToHitDemonPerLevel: 245,
	ToHitUndeadPerLevel: 246,
	CrushingBlowPerLevel: 247,
	OpenWoundsPerLevel: 248,
	KickDamagePerLevel: 249,
	DeadlyStrikePerLevel: 250,
	FindGemsPerLevel: 251,
	ReplenishDurability: 252,
	ReplenishQuantity: 253,
	ExtraStack: 254,
	FindItem: 255,
	SlashDamage: 256,
	SlashDamagePercent: 257,
	CrushDamage: 258,
	CrushDamagePercent: 259,
	ThrustDamage: 260,
	ThrustDamagePercent: 261,
	AbsorbSlash: 262,
	AbsorbCrush: 263,
	AbsorbThrust: 264,
	AbsorbSlashPercent: 265,
	AbsorbCrushPercent: 266,
	AbsorbThrustPercent: 267,
	ArmorByTime: 268,
	ArmorPercentByTime: 269,
	LifeByTime: 270,
	ManaByTime: 271,
	MaxDamageByTime: 272,
	MaxDamagePercentByTime: 273,
	StrengthByTime: 274,
	DexterityByTime: 275,
	EnergyByTime: 276,
	VitalityByTime: 277,
	ToHitByTime: 278,
	ToHitPercentByTime: 279,
	ColdMaxDamageByTime: 280,
	FireMaxDamageByTime: 281,
	LightningMaxDamageByTime: 282,
	PoisonMaxDamageByTime: 283,
	ResistColdByTime: 284,
	ResistFireByTime: 285,
	ResistLightningByTime: 286,
	ResistPoisonByTime: 287,
	AbsorbColdByTime: 288,
	AbsorbFireByTime: 289,
	AbsorbLightningByTime: 290,
	AbsorbPoisonByTime: 291,
	FindGoldByTime: 292,
	FindMagicByTime: 293,
	RegenStaminaByTime: 294,
	StaminaByTime: 295,
	DamageDemonByTime: 296,
	DamageUndeadByTime: 297,
	ToHitDemonByTime: 298,
	ToHitUndeadByTime: 299,
	CrushingBlowByTime: 300,
	OpenWoundsByTime: 301,
	KickDamageByTime: 302,
	DeadlyStrikeByTime: 303,
	FindGemsByTime: 304,
	PierceCold: 305,
	PierceFire: 306,
	PierceLightning: 307,
	PiercePoison: 308,
	DamageVsMonster: 309,
	DamagePercentVsMonster: 310,
	ToHitVsMonster: 311,
	ToHitPercentVsMonster: 312,
	DefenseVsMonster: 313,
	DefensePercentVsMonster: 314,
	FireLength: 315,
	BurningMin: 316,
	BurningMax: 317,
	ProgressiveDamage: 318,
	ProgressiveSteal: 319,
	ProgressiveOther: 320,
	ProgressiveFire: 321,
	ProgressiveCold: 322,
	ProgressiveLightning: 323,
	ExtraCharges: 324,
	ProgressiveToHit: 325,
	PoisonCount: 326,
	DamageFramerate: 327,
	PierceIdx: 328,
	PassiveFireMastery: 329,
	PassiveLightningMastery: 330,
	PassiveColdMastery: 331,
	PassivePoisonMastery: 332,
	PassiveFirePierce: 333,
	PassiveLightningPierce: 334,
	PassiveColdPierce: 335,
	PassivePoisonPierce: 336,
	PassiveCriticalStrike: 337,
	PassiveDodge: 338,
	PassiveAvoid: 339,
	PassiveEvade: 340,
	PassiveWarmth: 341,
	PassiveMasteryMeleeToHit: 342,
	PassiveMasteryMeleeDamage: 343,
	PassiveMasteryMeleeCritical: 344,
	PassiveMasteryThrowToHit: 345,
	PassiveMasteryThrowDamage: 346,
	PassiveMasteryThrowCritical: 347,
	PassiveWeaponBlock: 348,
	PassiveSummon_resist: 349,
	ModifierListSkill: 350,
	ModifierListLevel: 351,
	LastSentLifePercent: 352,
	SourceUnitType: 353,
	SourceUnitID: 354,
	ShortParam1: 355,
	QuestItemDifficulty: 356,
	PassiveMagicMastery: 357,
	PassiveMagicPierce: 358,
	Invalid: 359,
};

module.exports.MenuAction = { // S->C 0x77
	TradeRequestSent: 0x00,
	TradeRequestReceived: 0x01,
	TradeAccepted: 0x05, // Other player has clicked "accept trade"
	TradeRequestAccepted: 0x06, // Default state of trade when neither party has clicked "accept trade" 
	TradeDeclined: 0x0C,
	TradeCompleted: 0x0D, // Both parties clicked "accept trade"
	TradeLocked: 0x0E, // "accept trade" button disabled (red)
	TradeUnlocked: 0x0F, // "accept trade" button re-enabled
	OpenStash: 0x10,
	CloseStash: 0x11,
	OpenCube: 0x15,
};

module.exports.ChatType = { // S->C 0x26
	Player: 0x01, // "USER: MSG"
	Whisper: 0x02, // "USER whispers: MSG"
	Print: 0x04, // "MSG"
	WhisperTo: 0x06, // "You whispered to USER: MSG"
	Scroll: 0x07, // "MSG" Actually forces a menu to come up with a scroll background where the message is visible. Colors work too.
};

module.exports.ChatColor = { // Used in S->C 0x26
	White: 0x00,
	Red: 0x01,
	Green: 0x02,
	Blue: 0x03,
	Unique: 0x04,
	Grey: 0x05,
	Black: 0x06,
	Beige: 0x07,
	Orange: 0x08,
	Yellow: 0x09,
	DarkerGreen: 0x0A,
	Purple: 0x0B,
	DarkGreen: 0x0C,
	White_BlackOL: 0x0D,
	Black_BlackOL: 0x0E,
	Grey_BlackOL: 0x0F,
	Grey_GreyOL: 0x10,
	Green_OrangeOL: 0x11,
	BrightWhite: 0x12,
	BloodRed: 0x13,
};

module.exports.ChatColorCode = {
	White: 'ÿc0',
	Red: 'ÿc1',
	Green: 'ÿc2',
	Blue: 'ÿc3',
	Unique: 'ÿc4',
	Grey: 'ÿc5',
	Black: 'ÿc6',
	Beige: 'ÿc7',
	Orange: 'ÿc8',
	Yellow: 'ÿc9',
	DarkerGreen: 'ÿc:',
	Purple: 'ÿc;',
	DarkGreen: 'ÿc<',
};

module.exports.QualityColorCode = [ // Chat colors by item quality
	'ÿc0', // 0 Default: white
	'ÿc0', // 1 Lowquality: white
	'ÿc0', // 2 Normal: white
	'ÿc0', // 3 Superior: white
	'ÿc3', // 4 Magic: blue
	'ÿc2', // 5 Set: green
	'ÿc9', // 6 Rare: yellow
	'ÿc4', // 7 Unique: unique
	'ÿc8', // 8 Crafted: orange
];

module.exports.McpRealm = { // IP -> Realm for MCP connections
	'115.116.0.82'		: 'useast',
	'37.244.2.20'		: 'useast',
	'37.244.3.46'		: 'uswest',
	'112.101.0.82'		: 'europe',
	'37.244.54.171'		: 'europe',
	'52.87.153.62'		: 'asia',
	'192.168.16.124'	: 'asia',
	'54.161.119.129'	: 'asia',
	'158.115.200.146'	: 'asia',
	'35.175.132.231'	: 'asia',
};