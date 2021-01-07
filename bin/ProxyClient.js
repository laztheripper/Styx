/**
 * @description Simply hook 2 clients against eachother
 *
 */
class ProxyClient {
	constructor(client, remote, ip=0, port=0) { // ip and port aren't needed, just to be able to interchangably use diabloclient and proxyclient classes
		client.pipe(remote); // Whatever the client, send to remote
		remote.pipe(client);// whatever the remote send, send to client

		ProxyClient.instances.push(this);
	}

	static instances = [];
}

module.exports = ProxyClient;