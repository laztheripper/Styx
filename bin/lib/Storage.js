const Storage = require('node-persist');

(async () => {
    await Storage.init({
        dir                 : 'storage',
        stringify           : JSON.stringify,
        parse               : JSON.parse,
        encoding            : 'utf8',
        logging             : false,
        ttl                 : false,
        expiredInterval     : 2 * 60 * 1000,
        forgiveParseErrors  : false,
    });
})();

class Account {
    constructor(name) {
        this.name = name;
    }

    
}

module.exports.Storage = Storage;
module.exports.Account = Account;