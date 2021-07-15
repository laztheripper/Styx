const Account = require('./Account');
const Character = require('./Character');
const WS = require('./WS');
const fs = require('fs');
const { info } = require('console');

class Manager {
    constructor() {
        this.loadAccounts();

        this.collect();
        delete this.collect;
    }

    collect() {

    }

    async loadAccounts() {
        // Load from json
    }

    async accUpdate(acc) {
        WS.send('account', {
            name        : acc.name,
            password    : '',
            realm       : acc.realm,
        });
    }

    async charUpdate(chars) {
        WS.send('chars', chars);
    }

    async update(game) {
        var acc, charInfo, char, realm, accName, charName, charList;
        realm = game.mcp.realm;
        accName = game.me.account;
        charList = game.mcp.account.chars;

        if (Account.exists(accName, realm)) {
            acc = Account.list[realm][accName];
        } else {
            acc = new Account(accName, realm);
        }

        game.itemCollector.finalize();

        var changes = {}; // Only changes to current char if we have no mcp list

        if (Object.keys(charList).length !== 0) {
            for (charName in charList) {
                charInfo = charList[charName];

                if (Character.exists(charName, realm)) {
                    char = Character.list[realm][charName];
                    if (char.update(charInfo)) {
                        changes[charName] = char.copy();
                        changes[charName].type = 'update';
                    }
                } else {
                    char = new Character(charName, realm, charInfo);
                    acc.addChar(char);
                    changes[charName] = char.copy();
                    changes[charName].type = 'new';
                }
            }

            for (charName in acc.chars) {
                if (charList.hasOwnProperty(charName)) continue;
                changes[charName] = acc.chars[charName].copy();
                changes[charName].type = 'delete';
                acc.removeChar(charName);
            }
        }

        for (charName in changes) delete changes[charName].items;

        var myChar = Character.list[realm][game.me.name];
        myChar.items = game.itemCollector.rows;

        if (!changes.hasOwnProperty(game.me.name)) {
            changes[game.me.name] = myChar.copy();
            changes[game.me.name].type = 'none';
        }

        changes[game.me.name].items = Object.values(myChar.items);

        this.charUpdate(changes);
        //console.log(changes[game.me.name].items, JSON.stringify(changes[game.me.name].items).length);
        console.log(changes, JSON.stringify(changes).length);
    }
}

module.exports = new Manager();