class Account {
    constructor(name, realm) {
        this.name = name;
        this.realm = realm;
        this.chars = {}; // Charname: {}, etc.
        this.charCount = 0;
        Account.list[this.realm][this.name] = this;
        Account.count += 1;
    }

    addChar(char) {
        char.account = this.name;
        this.chars[char.name] = char;
        this.charCount += 1;
    }

    removeChar(char, child=true) {
        if (typeof char !== 'string') char = char.name;
        if (child) this.chars[char].destroy();
        try { delete this.chars[char] } catch (e) {}
        this.charCount -= 1;
    }

    empty(children=true) { // Keep account, delete chars from it
        for (var charName in this.chars) {
            if (children) this.chars[charName].destroy();
            delete this.chars[charName];
        }
        this.charCount = 0;
    }

    destroy(children=true) { // Delete account, children (true/false) to also delete Character instances
        if (children) for (var char in this.chars) this.chars[char].destroy();
        delete Account.list[this.realm][this.name];
        Account.count -= 1;
    }
    
    static destroyAll(children=true) {
        for (var realm in Account.list) {
            for (var acc in Account.list[realm]) {
                Account.list[realm][acc].destroy(children ? true : false);
            }
        }
    }

    static exists(name, realm) {
        if (Account.list[realm].hasOwnProperty(name)) return true;
        return false;
    }

    static count = 0;
    
    static list = {
        '1' : {}, // East
        '0' : {}, // West
        '3' : {}, // Euro
        '2' : {}, // Asia
        '4' : {}, // Remaster
    };
}

module.exports = Account;