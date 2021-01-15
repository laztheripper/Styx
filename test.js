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

//eventEmitter.emit('make');
//eventEmitter.emit('scream');
//eventEmitter.emit('scream');

const BufferHelper = require('./bin/lib/BufferHelper');


function stuff() {
    var buf1 = Buffer.from([0x70, 0x70, 0x70, 0x70, 0x70, 0x00, 0x00, 0x00, 0x00, 0x01]);
    var buf2 = Buffer.from([0x66, 0x66]);
    var size = 2;

}

var start = Date.now();
for (let i = 0; i < 1; i++) stuff();
console.log(Date.now() - start);

var a = Symbol('block');
var b = Symbol('block');

console.log(a === a)