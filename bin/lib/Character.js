class Character extends require('events') {
    constructor(name, realm, info) {
        super();
        this.name       = name;
        this.realm      = realm;
        this.account    = false;
        this.expansion  = info.expansion;
        this.hardcore   = info.hardcore;
        this.ladder     = info.ladder;
        this.level      = info.level;
        this.expire     = info.expire;
        this.classid    = info.classid;
        this.diff       = info.diff;
        this.items      = info.items || [];
        this.shared     = false;
        Character.list[this.realm][this.name] = this;
        Character.count += 1;
        this.emit('charupdate', this);
    }

    update(info) {
        var change = false;
        for (var key in info) {
            if (!this.hasOwnProperty(key)) continue;
            if (this[key] !== info[key]) change = true;
            this[key] = info[key];
        }
        change && this.emit('charupdate', this);
    }

    destroy() {
        this.emit('chardelete', this);
        try { delete Character.list[this.realm][this.name] } catch (e) {}
        Character.count -= 1;
    }

    copy() {
        return {
            name: this.name,
            realm: this.realm,
            account: this.account,
            expansion: this.expansion,
            hardcore: this.hardcore,
            ladder: this.ladder,
            level: this.level,
            classid: this.classid,
            diff: this.diff,
            expire: this.expire,
            items: {...this.items},
        };
    }

    static count = 0;

    static destroyAll() {
        for (var realm in Character.list) {
            Character.list[realm] = {};
            this.emit('deletechars', realm);
        }
        Character.count = 0;
    }

    static exists(name, realm) {
        if (Character.list[realm].hasOwnProperty(name)) return true;
        return false;
    }

    static list = {
        '1' : {}, // East
        '0' : {}, // West
        '3' : {}, // Euro
        '2' : {}, // Asia
        '4' : {}, // Remaster
    };
}

module.exports = Character;