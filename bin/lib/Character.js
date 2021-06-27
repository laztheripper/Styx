class Character {
    constructor(name, realm, expansion, hardcore, ladder) {
        this.name = name;
        this.expansion = expansion;
        this.hardcore = hardcore;
        this.ladder = ladder;
        this.realm = realm;
        this.items = [];
        Character.list[this.realm][this.name] = this;
        Character.count += 1;
    }

    destroy() {
        try { delete Character.list[this.realm][this.name] } catch (e) {}
        Character.count -= 1;
    }

    static count = 0;

    static destroyAll() {
        for (var realm in Character.list) {
            Character.list[realm] = {};
        }
        Character.count = 0;
    }

    static exists(name, realm) {
        if (Character.list[realm].hasOwnProperty(name)) return true;
        return false;
    }

    static list = {
        'east'      : {},
        'west'      : {},
        'europe'    : {},
        'asia'      : {},
        'remaster'  : {},
    };
}

module.exports.Character = Character;