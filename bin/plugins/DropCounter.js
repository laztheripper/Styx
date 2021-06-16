const ItemCollector = require('../lib/ItemCollector');

ItemCollector.hooks.push(
	function (item) { // this = game instance, item = Item{}
		console.log(item.uid);
		this.spoofMessage('penis', 5);
	}
);