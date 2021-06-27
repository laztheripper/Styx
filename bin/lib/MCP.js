const RealmClient = require('./RealmClient');
const RealmServer = require('./RealmServer');

class MCP {
    constructor(diabloProxy) {
        this.diabloProxy = diabloProxy;

        this.realmClient = new RealmClient(this);
        this.realmServer = new RealmServer(this);

        this.account = {};
        this.account.chars = {};

        this.collect();
        delete this.collect;
    }

    collect() {
        this.realmServer.on(0x19, ({packetData}) => {
            console.log(packetData);
        });

        
        this.realmServer.on(0x04, ({packetData}) => {
            console.log('MCP S->C 0x04', packetData);
        });
        this.realmClient.on(0x04, ({packetData}) => {
            console.log('MCP C->S 0x04', packetData);
        });
    }
}

module.exports = MCP;