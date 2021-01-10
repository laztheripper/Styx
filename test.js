var events = require('events');
var eventEmitter = new events.EventEmitter();



class Penis {
    constructor(emitter) {
        this.large = true;
        this.emitter = emitter;

        this.emitter.on('make', () => this.thing());
    }

    thing() {
        var i = 1;

        this.emitter.once('scream', () => {
            var f = 2;
            console.log(i);

            this.emitter.once('scream', () => {
                console.log(i);
                console.log(f);
            });
        });
    }


}

const penis = new Penis(eventEmitter);

eventEmitter.emit('make');
eventEmitter.emit('scream');
eventEmitter.emit('scream');