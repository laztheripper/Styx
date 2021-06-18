const fname = __filename.split('\\').pop().split('.js')[0];
const Config = require('../Config')[fname];
const ItemCollector = require('../lib/ItemCollector');
const { QualityColorCode } = require('../lib/Enums');
const { BaseItem } = require('../lib/Tables');

ItemCollector.hooks.push(
	function (item) { // this = game instance, item = Item{}
		if (!item.flags.New) return;
		if (item.destination !== 0x0C) return;
		let str = item.code + ' ' + item.uid + ' ' + item.ownerType + ' ' + item.ownerUID;

		if (Config.print) this.spoofMessage('*Item* ' + QualityColorCode[item.quality || 1] + BaseItem[item.classid].name);
		else console.log(str);
	}
);