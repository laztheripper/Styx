const RealmClient = require('./RealmClient');
const RealmServer = require('./RealmServer');
const { McpRealm } = require('./Enums');

class MCP {
    constructor(diabloProxy) {
        this.diabloProxy = diabloProxy;

        this.realmClient = new RealmClient(this);
        this.realmServer = new RealmServer(this);

        this.account = {};
        this.account.chars = {};
        this.gameHash = false;
        this.realm = MCP.getRealmIp(this.diabloProxy.ip);

        this.collect();
        delete this.collect;
    }

	sendPacket(buffer) {
        var b = Buffer.alloc(buffer.length + 2); // Add size header (WORD)
        buffer.copy(b, 2);
        b.writeUInt16LE(b.length, 0);

		if (!this.realmClient.lastBuff) {
			this.diabloProxy.server.write(b);
			return true;
		}

		this.diabloProxy.server.queue.push(b); // Don't insert a packet in the middle of a stream!
		return true;
	}

    collect() {
        this.realmServer.on(0x19, ({packetData}) => { // Charscreen data
            this.account.chars = MCP.parseCharList(packetData.raw);
        });

        this.realmServer.on(0x02, ({packetData}) => {
            var buff = Buffer.alloc(2);
            buff.writeUInt8(0x19, 0); // PacketId
            buff.writeUInt8(0x12, 1); // 18 chars
            this.sendPacket(buff);
        });

        this.realmServer.on(0x04, ({packetData}) => {
            this.gameHash = packetData.GameHash;
        });
    }

    static parseCharList(bytes) {
        var i, flags, char, charnum, offset = 7,
            chars = {};

        charnum = bytes.readUInt16LE(offset);
        offset += 2;

        for (i = 0; i < charnum; i++) {
            char = {};

            char.expire = Math.round(((bytes.readUInt32LE(offset) - (Date.now() / 1000)) / (60 * 60 * 24)) * 100) / 100; // Days.00 until expiration
            offset += 4;
            char.name = '';
            while (bytes[offset++]) char.name += String.fromCharCode(bytes[offset-1]);

            flags           = bytes[offset+26];
            char.level      = bytes[offset+25];
            char.classid    = bytes[offset+13] - 1;
            char.ladder     = bytes[offset+30] !== 0xFF;
            char.dead       = (flags & 0x08) !== 0;
            char.hardcore   = (flags & 0x04) !== 0;
            char.expansion  = (flags & 0x20) !== 0;
            char.diff       = ((bytes[offset+27] & 0x3E) >> 1) / (char.expansion ? 5 : 4);
          
            offset += 34;
            chars[char.name] = char;
        }

        return chars;
    }

    static getRealmIp(ip) {
        if (!McpRealm.hasOwnProperty(ip)) throw new Error('New MCP ip! ' + ip);
        return McpRealm[ip];
    }
}

module.exports = MCP;