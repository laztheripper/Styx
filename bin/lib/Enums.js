module.exports.ItemLocation = {
	Disappeared: -1,
	Equipment: 0x00,
	Inventory: 0x01,
	TraderOffer: 0x02,
	ForTrade: 0x03,
	Cube: 0x04,
	Stash: 0x05,
	Shared1: 0x06,
	Shared2: 0x07,
	Shared3: 0x08,
	Ground: 0x09,
	Belt: 0x0A,
	Item: 0x0B,
	ArmorTab: 0x101,
	WeaponTab1: 0x102,
	WeaponTab2: 0x103,
	MiscTab: 0x104,
};

module.exports.ItemFlags = {
	None: 0x00,
	Equipped: 0x01,
	Bought: 0x02,
	Cursor: 0x04,
	InSocket: 0x08, // Applies to runes and jewels but not gems
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
	Container: 0x00,
	Equipment: 0x04,
	Belt: 0x08,
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
	'115.116.0.82'		: 1, // East
	'37.244.2.20'		: 1, // East
	'37.244.3.46'		: 0, // West
	'112.101.0.82'		: 3, // Euro
	'37.244.54.171'		: 3, // Euro
	'52.87.153.62'		: 2, // Asia
	'192.168.16.124'	: 2, // Asia
	'54.161.119.129'	: 2, // Asia
	'158.115.200.146'	: 2, // Asia
	'35.175.132.231'	: 2, // Asia

	'remasterip...'		: 4, // Remaster
};

module.exports.SoundCmd = { // S->C 0x2C
    Invalid			: -1,
    Trap			: 0x00,
    ItemPickup		: 0x01,
    Levelup			: 0x02,
    QuestCube		: 0x03,
    Transmute		: 0x04,
    Shatter        	: 0x05,
    Identify        : 0x06,
    CreatePortal    : 0x07,
    ExitPortal    	: 0x08,
    ItemBreak       : 0x09,
    Heal            : 0x0A,
    UnlockChest     : 0x0B,
    Evade           : 0x0C,
    MonsterTaunt    : 0x10,
    Impossible      : 0x13,
    NoUse           : 0x14,
    NeedMana        : 0x15,
    NeedKey         : 0x16,
    Overburdened    : 0x17,
    NotInTown    	: 0x18,
    Help            : 0x19,      
    Follow          : 0x1A,
    ForYou          : 0x1B,
    Thanks          : 0x1C, 
    ForgiveMe       : 0x1D,
    Bye             : 0x1E,
    Die             : 0x1F,
    
    QuestComplete_A1Q6  : 0x21,
    QuestComplete_A1Q1	: 0x23,
    QuestComplete_A1Q5	: 0x24,
    QuestEnterArea_A1Q2 : 0x26,
    QuestEnterArea_A1Q3 : 0x27,
    QuestEnterArea_A1Q4 : 0x28,
    QuestEnterArea_A1Q6	: 0x29,
    MercCannotEquip		: 0x55,
    MercThanks			: 0x56,
    MercCannotUseThat	: 0x57,
    MercLevelup			: 0x5B,
};