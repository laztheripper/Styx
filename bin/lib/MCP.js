const RealmClient = require('./RealmClient');
const RealmServer = require('./RealmServer');

class MCP {
    constructor(diabloProxy) {
        this.diabloProxy = diabloProxy;

        this.realmClient = new RealmClient(this);
        this.realmServer = new RealmServer(this);

        this.account = {};
        this.account.chars = {};
        this.gameHash = false;

        this.collect();
        delete this.collect;
    }

    collect() {
        this.realmServer.on(0x19, ({packetData}) => {
            console.log(packetData);
        });

        this.realmServer.on(0x04, ({packetData}) => {
            this.gameHash = packetData.GameHash;
            console.log(packetData);
        });
    }
}

module.exports = MCP;