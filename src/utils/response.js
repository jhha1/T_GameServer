const msgpack = require('@ygoe/msgpack');
const log = require('./logger');

class response {
    #res;

    constructor(res) {
        this.#res = res;
    }

    send (messageObj) {
        log.info(`RES: ${messageObj}`);

        const encoded = msgpack.serialize(messageObj);

        log.info(`encode:${encoded}, len:${encoded.length}, de:${msgpack.deserialize(encoded)}`);

        this.#res.writeHead(200, {
            'Content-Type': 'application/msgpack',
            'Content-Length': encoded.length
        });

        this.#res.end(Buffer.from(encoded));
    }

    error (err) {
        log.error(this.#res.req, err);
        const encoded = msgpack.serialize(JSON.stringify(err));
        return this.#res.send(encoded);
    }
}

module.exports = response;