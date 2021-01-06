/**
 * @description Simply hook 2 clients against eachother
 *
 */
class ProxyClient {
	constructor(client, remote) {
		client.pipe(remote); // Whatever the client, send to remote
		remote.pipe(client);// whatever the remote send, send to client

		ProxyClient.instances.push(this);
	}

	static instances = [];
}

module.exports = ProxyClient;