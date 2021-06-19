class BufferHelper {
	constructor(buffer) {
		this.offset = 0;
		const map = {
			byte: [1, buffer.readUInt8],
			word: [2, buffer.readUInt16LE],
			dword: [4, buffer.readUInt32LE],
		};
		Object.keys(map).forEach(key => Object.defineProperty(this, key, {get: ([size, func] = map[key]) => func.apply(buffer, (this.offset += size))}));

		// extend like we would be an buffer
		Object.keys(Buffer.prototype).forEach(key => Object.defineProperty(this, key, {get: () => (...args) => Buffer.prototype[key].apply(buffer, args)}))
	}

	static getString(buffer, size, offset = 0, encoding = 'utf8') {
		const tmpbuff = Buffer.alloc(size);
		for (let i = 0; i < size; i++) tmpbuff.writeUInt8(buffer.readUInt8(i + offset), i);

		return tmpbuff.toString(encoding);
	}

	static getCString(buffer, size, offset = 0) {
		var tmpbuff = Buffer.alloc(buffer.length),
			str = '';

		buffer.copy(tmpbuff, 0);
		for (let i = 0; i < size; i++) {
			if (!tmpbuff[i + offset]) break;
			str += String.fromCharCode(tmpbuff[i + offset]);
		}

		return str;
	}

	static padByte(str) {
		const p = "00";
		return p.substring(0, p.length - str.length) + str;
	}

	static getByteStr(buffer, from=0, to) {
		var i, str = '';
		if (to === undefined) to = buffer.length;
		for (i = from; i < to; i++) {
			str += BufferHelper.padByte(buffer[i].toString(16)) + ' ';
		}
		return str.slice(0, -1);
	}
}

module.exports = BufferHelper;