const BitReader = require('./BitReader');
const { logPacket } = require('./Util');

class RealmServer extends require('events') {
	constructor(mcp) {
		super();
		this.mcp = mcp;
		this.lastBuff = false;
        this.mcp.diabloProxy.hooks.server.push(buffer => {
            if (this.lastBuff) {
                if (this.lastBuff.length > 1260) {
                    logPacket('Malformed packet stream: RealmServer->Client', this.lastBuff);
                } else {
                    buffer = Buffer.concat([this.lastBuff, buffer], this.lastBuff.length + buffer.length);
                }

                this.lastBuff = false;
            }

            while (buffer.length) {
                const size = buffer[1] + buffer[0];

                if (buffer.length - size < 0) {
                    if (buffer.length > 0) { // Packet is truncated, append the truncated part to the next packet that arrives..
                        this.lastBuff = buffer;
                    } else {
                        logPacket('Malformed packet: RealmServer->Client', buffer);
                    }

                    break;
                }

                const packetBuffer = Buffer.alloc(size - 2);
                buffer.copy(packetBuffer, 0, 2, size - 2);
                buffer = buffer.slice(size, buffer.length);

                let packetData;
                packetData = RealmServer.packetMap[packetBuffer[0]];
                packetData = packetData && packetData.hasOwnProperty('fromBuffer') ? packetData.fromBuffer(packetBuffer) : {PacketId: packetBuffer[0]};
                packetData.raw = packetBuffer;
                packetData.packetIdHex = packetData.PacketId.toString(16);

                this.emit(null, {packetData, mcp});
                this.emit(packetBuffer[0], {packetData, mcp});
                RealmServer.hooks.forEach(hook => typeof hook === 'function' && hook.apply(this.mcp, [{raw: packetBuffer, ...packetData}]));
            }
        });
    }

	static hooks = [];
	static packetMap = {}; // Filled in below
}

module.exports = RealmServer;

const BYTE = 'byte', WORD = 'word', DWORD = 'dword', NULLSTRING = 'string';

let structs = [
	{id: 0x00,}, // Keepalive
	//{id: 0x19, RequestChars: WORD, TotalChars: DWORD, Chars: WORD, *}, // MCP_Charlist2
];

structs.forEach(({id, ...rest}) => {
	RealmServer.packetMap[id] = rest;
	if (!RealmServer.packetMap[id].hasOwnProperty('fromBuffer')) RealmServer.packetMap[id].fromBuffer = buffer => {
		buffer = new BitReader(buffer);
		buffer.bit(8); // Id
		return Object.entries(RealmServer.packetMap[id]).filter(([key]) => key !== 'fromBuffer').reduce((acc, [key, value]) => {
			switch (value) {
				case 'byte':
					acc[key] = buffer.readUInt8();
					break;
				case 'word':
					acc[key] = buffer.readUInt16LE();
					break;
				case 'dword':
					acc[key] = buffer.readUInt32LE();
					break;
			}
			return acc;
		}, {PacketId: id})
	}
});