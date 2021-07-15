const WebSocket = require('ws');
const Config = require('../Config');

class WS {
    // Settings
    
    timeout = 60;
    reconnect = true;

    // No touchy

    async create() {
		this.socket = new WebSocket(this.url, { rejectUnauthorized: false });
		this.socket.onerror		= (...args) => this.onerror(...args);
		this.socket.onopen		= (...args) => this.onopen(...args);
		this.socket.onclose		= (...args) => this.onclose(...args);
		this.socket.onmessage	= (...args) => this.onmessage(...args);
    }

    onerror(e) {
        console.log(e.message);
    }

    onclose() {
        if (this.reconnect) {
            setTimeout(() => this.create(), 10000);
            console.log('Socket reconnecting...');
        }
    }

    onopen() {
        this.pong = true;
        this.send('auth', Config.apiKey);
    }

    onmessage(msg) {
        this.pong = true;
        try {
            msg = msg.data;
            msg = JSON.parse(msg);
            if (msg.abort) this.destroy();
            if (this.handler) this.handler(msg);
        } catch (e) {
            console.log(e);
        }
        console.log(msg);
    }

    prepare(action, msg) {
        if (typeof action !== 'string')
            throw new Error('Typeof action should be "string"');

        return JSON.stringify({
            action: action,
            msg: msg,
        });
    }

    send(action, msg='') {
        try {
            //console.log(action, msg);
            msg = this.prepare(action, msg);
            //if (msg.length > WS.msgLimit) throw new Error('Message length exceeded limit');
            this.socket.send(msg);
        } catch (e) {
            console.log(e);
        }
        
        return false;
    }

    ping() {
        if (!this.pong) {
            if (this.socket.readyState === 1)
                this.socket.close();
            console.log('Socket timeout');
            return;
        }

        this.pong = false;
        this.send('ping');
    }

    constructor(url=Config.apiUrl, port, handler) {
        if (!url.startsWith('wss://')) url = 'wss://' + url;
        this.url = url + (port ? ':' + port : '');
        this.port = port;
        if (handler) this.handler = handler;
        this.create();
		this.interval = setInterval(
			() => this.ping(),
			this.timeout * 1000,
		);
    }

    destroy() {
        clearInterval(this.interval);
        this.reconnect = false;
        if (this.socket && this.socket.readyState < 2) this.socket.close();
        WS.instances.splice(WS.instances.indexOf(this), 1);
    }

    static destroyAll() {
        for (let i = 0; i < WS.instances.length; i++) {
            WS.instances[i].destroy();
        }
    }

    static instances = [];
    static msgLimit = 5000;
    handler = false;
    pong = false;
    authed = false;
}

module.exports = new WS();