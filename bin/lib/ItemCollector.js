const Item = require('./Item');

class ItemCollector {
	constructor(game) {
		this.game = game;
		this.items = {};
	}

	newItem(item) {
		if (item.remove) {
			this.remove(item.uid);
			return;
		}

		this.add(item);
	}

	add(item) {
		this.items[item.uid] = item;
		//this.game.unitCollector.collection[4][item.uid] = item; // Add it to the unit collector

		switch (item.ownerType) {
			case 0:
				this.game.me.items[item.uid] = item;
				break;
			case 1:
				this.game.merc.items[item.uid] = item;
				break;
			case 4:
				this.items[item.ownerUID].items[item.uid] = item;
				item.parent = item.ownerUID;
				break;
		}
	}

	remove(uid) { // Remove an item from collector, ie items of other players. we only care about ours. also remove all socketed items (children of parent)
		if (typeof uid === 'object') uid = uid.uid;
		if (!this.items.hasOwnProperty(uid)) return;
		for (let child in this.items[uid].items) this.remove(child);
		delete this.items[uid];
		try { delete this.game.me.items[uid]; } catch(e) {}
		try { delete this.game.merc.items[uid]; } catch(e) {}
		//try { delete this.game.unitCollector.collection[4][uid]; } catch(e) {}
	}

	clearOwner(owner) { // remove all items of unit and ofc socketed items
		for (let uid in owner.items) {
			this.remove(uid);
		}
	}

	destroy() {
		this.items = {};
		this.me.items = {};
		this.merc.items = {};
		this.game = null;
	}
}

module.exports = ItemCollector;