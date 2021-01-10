/**
 * @description Config file to be written
 */

module.exports = {
	users: [
		{
			username: 'MyUser',
			password: 'SuperSecret',
		},
	],
	options: {
		allowNoAuth: false, // If true, allow no auth
		listen: 0x50C4, // "sock" in hex, or whatever port you prefer
		client: require('./SimpleProxy'), // SimpleClient is the default
	}
};