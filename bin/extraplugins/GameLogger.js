const GameServer = require('./../lib/GameServer');

const readableChars = [];
for (let i = 32; i < 128; i++) readableChars.push(i);

GameServer.hooks.push(
	/** @type Buffer */
	function ({raw: buffer, ...rest}) {
		// let first = buffer.readUInt8(0);
		// if (first === 0x9c || first === 0x9D) {
		// 	require('fs').writeFile(__dirname+'\\tmp_item.'+buffer.length+'.tst',buffer,function(...args) {
		// 		console.log(...args);
		// 	})
		// }
		let arr = [];
		for (let i = 0; i < buffer.length; i++) arr.push(buffer.readUInt8(i));

		// Add leading zeroes
		arr = arr.map(byte => ('0' + byte.toString(16)).substr(-2));

		let print = '\r\n', stripped, counter = 0;
		while (arr.length) {
			let bytes = arr.splice(0, stripped = arr.length < 16 && arr.length || 16), tmp = [0, 0];
			print += ('0000' + counter.toString(16)).substr(-4) + '\t';
			let tmpprint = [0, 0].map((x, i) => (tmp[i] = bytes.splice(0, 8)).join(' ')).join('    ');
			print += (tmpprint + ' '.repeat(50)).substr(0, 50)
				+ '     '
				+ (tmp.map(arr => arr.map(x => parseInt(x, 16)).map(x => readableChars.includes(x) && String.fromCharCode(x) || '.').join('')).join('    '))
				+ '\r\n';
			counter += stripped;
		}
		console.log(print);


		const fs = require('fs');
		const logfile = {server: this.diabloProxy.scfile, client: this.diabloProxy.csfile}['server'];

		//console.log('Writing to log file ->' + logfile);
		// fs.writeFileSync(logfile,buffer,{flag: 'a'});
	}
);