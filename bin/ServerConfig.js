/**
 * @description Config file to be written
 */

module.exports = {
	users: [], // Dont use any auth for now. Can be changed if you like / want
	options: {
		allowNoAuth: true, // If true, allow no auth
		listen: 0x50C4, // "sock" in hex, or whatever port you prefer
		proxy: require('./DiabloProxy'),
	}
};