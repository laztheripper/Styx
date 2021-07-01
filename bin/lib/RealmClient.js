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
                if (this.header && buffer[0] === 0x01) break; // Skip header
                const size = buffer.readUInt16LE(0);

                if (buffer.length - size < 0) {
                    if (buffer.length > 0) { // Packet is truncated, append the truncated part to the next packet that arrives..
                        this.lastBuff = buffer;
                    } else {
                        logPacket('Malformed packet: RealmClient->Server', buffer);
                    }

                    break;
                }

                const packetBuffer = Buffer.alloc(size - 2);
                buffer.copy(packetBuffer, 0, 2, size);
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
    //{id: 0x01, MCPCookie: DWORD, MCPStatus: DWORD, MCPChunk1[8]: BYTE, MCPChunk2[48]: BYTE, BnetName: NULLSTRING,}, // MCP_STARTUP
    {id: 0x02, Class: DWORD, Flags: WORD, CharName: NULLSTRING,}, // MCP_CHARCREATE
    //{id: 0x03, RequestId: WORD, GameFlags: DWORD, Unknown1: BYTE, Difference: BYTE, MaxPlayers: BYTE, Name: NULLSTRING, Password: NULLSTRING, Description: NULLSTRING,}, // MCP_CREATEGAME
    //{id: 0x04, RequestId: WORD, GameName: NULLSTRING, GamePass: NULLSTRING,}, // MCP_JOINGAME
    //{id: 0x05, RequestId: WORD, HardcoreFlag: DWORD, SearchString: NULLSTRING,}, // MCP_GAMELIST
    //{id: 0x06, RequestId: WORD, GameName: NULLSTRING,}, // MCP_GAMEINFO
    //{id: 0x07, CharName: NULLSTRING,}, // MCP_CHARLOGON
    //{id: 0x0A, RequestId: WORD, CharName: NULLSTRING,}, // MCP_CHARDELETE
    //{id: 0x11, LadderType: BYTE, StartPosition: WORD,}, // MCP_REQUESTLADDERDATA
    //{id: 0x12,}, // MCP_MOTD
    //{id: 0x13,}, // MCP_CANCELGAMECREATE
    //{id: 0x16, Hardcore: DWORD, Expansion: DWORD, CharName: NULLSTRING,}, // MCP_CHARRANK
    //{id: 0x17, Quantity: DWORD,}, // MCP_CHARLIST
    //{id: 0x18, CharName: NULLSTRING,}, // MCP_CHARUPGRADE
    //{id: 0x19, RequestCount: DWORD,}, // MCP_CHARLIST2
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