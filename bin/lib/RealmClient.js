const BitReader = require('./BitReader');
const {logPacket} = require('./Util');

class RealmClient extends require('events') {
	constructor(mcp) {
		super();
		this.mcp = mcp;
		this.lastBuff = false;
        this.header = true;
        this.mcp.diabloProxy.hooks.client.push(buffer => {
            if (this.lastBuff) {
                if (this.lastBuff.length > 1260) {
                    logPacket('Malformed packet stream: RealmClient->Server', this.lastBuff);
                } else {
                    buffer = Buffer.concat([this.lastBuff, buffer], this.lastBuff.length + buffer.length);
                }

                this.lastBuff = false;
            }

            while (buffer.length) {
                if (this.header && buffer.length === 1) break; // Skip header
                const size = buffer[1] + buffer[0];

                if (buffer.length - size < 0) {
                    if (buffer.length > 0) { // Packet is truncated, append the truncated part to the next packet that arrives..
                        this.lastBuff = buffer;
                    } else {
                        logPacket('Malformed packet: RealmClient->Server', buffer);
                    }

                    break;
                }

                const packetBuffer = Buffer.alloc(size - 2);
                buffer.copy(packetBuffer, 0, 2, size - 2);
                buffer = buffer.slice(size, buffer.length);

                let packetData;
                packetData = RealmClient.packetMap[packetBuffer[0]];
                packetData = packetData && packetData.hasOwnProperty('fromBuffer') ? packetData.fromBuffer(packetBuffer) : {PacketId: packetBuffer[0]};
                packetData.raw = packetBuffer;
                packetData.packetIdHex = packetData.PacketId.toString(16);

                this.emit(null, {packetData, mcp});
                this.emit(packetBuffer[0], {packetData, mcp});
                RealmClient.hooks.forEach(hook => typeof hook === 'function' && hook.apply(this.mcp, [{raw: packetBuffer, ...packetData}]));
            }

            this.header = false;
        });
    }

	static hooks = [];
	static packetMap = {}; // Filled in below
}

module.exports = RealmClient;

const BYTE = 'byte', WORD = 'word', DWORD = 'dword', NULLSTRING = 'string';

let structs = [
	//{id: 0x19, *}, // MCP_Charlist2
];

structs.forEach(({id, ...rest}) => {
	RealmClient.packetMap[id] = rest;
	if (!RealmClient.packetMap[id].hasOwnProperty('fromBuffer')) RealmClient.packetMap[id].fromBuffer = buffer => {
		buffer = new BitReader(buffer);
		buffer.bit(8); // Id
		return Object.entries(RealmClient.packetMap[id]).filter(([key]) => key !== 'fromBuffer').reduce((acc, [key, value]) => {
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