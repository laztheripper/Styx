/**
 * String based bit data extractor
 *
 * I ended up using a binary string because:
 *   It's simpler
 *   It's more accurate
 *   We're probably parsing an item or two at a time, so it won't use much memory.
 *
 * Can read from:
 *   ArrayBuffers
 *   TypedArrays (like Uint8Array, etc)
 *   Regular arrays if the data is uint8
 *   A big endian binary string
 *
 *   @author Nishimura-Katsuo
 *
 */

class BitReader {
	reset(pos = 0) {
		this.pos = pos;
	}

	assign(data) {
		if (data instanceof this.constructor) {
			data = data.data.slice();
		}

		if (data.buffer) {
			data = data.buffer;
		}

		if (data instanceof ArrayBuffer) {
			data = Array.from(new Uint8Array(data));
		}

		if (Array.isArray(data)) {
			data = data.map(v => v.toString(2).padStart(8, '0')).reverse().join('');
		}

		if (typeof data === 'string') {
			this.data = data;
			this.reset();
		} else {
			throw new Error("I don't know how to read this data!");
		}
	}

	bit(length = 1) {
		let start = this.data.length - this.pos - length, end = this.data.length - this.pos;
		this.pos += length;
		return parseInt(this.data.slice(start, end) || 1, 2) | 0;
	}

	slice(length) {
		let buffer = Buffer.alloc(length);
		for (let i = 0; i < length; i++) buffer.writeUInt8(this.bit(8), i);
		return buffer;
	}

	bitAt(pos, length) {
		this.reset(pos);
		return this.bit(length);
	}

	/**
	 *   @method {int} readUInt16LE
	 *   @method {int} readUInt32LE
	 *   @method {int} readBigUInt64LE
	 *   @method {int} readInt16LE
	 *   @method {int} readInt32LE
	 *   @method {int} readBigInt64LE
	 */
	constructor(data) {
		this.assign(data);

		// Defined here so it can stay private
		const fillBuffer = bytes => {
			let buffer = Buffer.alloc(bytes);
			for (let i = 0; i < bytes; i++) buffer.writeUInt8(this.bit(8), i);
			return buffer;
		};

		// Make it readable buffers for Little endian
		[Buffer.prototype.readUInt8,Buffer.prototype.readUInt16LE, Buffer.prototype.readUInt32LE, Buffer.prototype.readBigUInt64LE,
			Buffer.prototype.readInt8,Buffer.prototype.readInt16LE, Buffer.prototype.readInt32LE, Buffer.prototype.readBigInt64LE]
			// Get size of buffer
			.map(func => ({func, size: parseInt(func.name.substr(-4, 2)) / 8 || 1}))
			.forEach(({func, size}) => this[func.name] = () => func.call(fillBuffer(size), 0/*offset*/));
	}

	readString(size, charLength = 8, terminator = '\0') {
		// Convert terminator to its int value
		if (typeof terminator === 'string') terminator = terminator[0].charCodeAt(0);

		let ret = '';
		for (let i = 0, tmp; i < size && size !== undefined; i++) {
			if ((tmp = this.bit(charLength)) === terminator) break;
			ret += String.fromCharCode(tmp)
		}
		return ret;
	}

	static from(data) {
		return new this(data);
	}

	static shortHandBr = (br) => ({
		bit    : {get: () => br.bit()},
		bits   : {get: () => bits => br.bit(bits)},
		byte   : {get: () => br.bit(8)}, // 8
		word   : {get: () => br.readUInt16LE()}, // 16
		dword  : {get: () => br.readUInt32LE()}, // 32
		string : {get: () => (...args) => br.readString.apply(br, args)},
		boolean: {get: () => !!br.bit()},
	});

	/*static shortHandBr = (br) => ({
		bit: {get: () => {
			const v = br.bit();
			console.log(`${1}: ${v}`);
			return v;
		}},
		bits: {get: () => bits => {
			const v = br.bit(bits);
			console.log(`${bits}: ${v}`);
			return v;
		}},
		byte: {get: () => {
			const v = br.bit(8);
			console.log(`byte: ${v}`);
			return v;
		}}, // 8
		word: {get: () => {
			const v = br.readUInt16LE();
			console.log(`word: ${v}`);
			return v;
		}}, // 16
		dword: {get: () => {
			const v = br.readUInt32LE();
			console.log(`dword: ${v}`);
			return v;
		}}, // 32
		string: {get: () => (...args) => {
			const v = br.readString.apply(br, args);
			console.log(`str: ${v}`);
			return v;
		}},
		boolean: {get: () => {
			const v = !!br.bit();
			console.log(`bool: ${v}`);
			return v;
		}},
	});*/
}

module.exports = BitReader;
