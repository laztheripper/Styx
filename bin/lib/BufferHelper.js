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
}

module.exports = BufferHelper;