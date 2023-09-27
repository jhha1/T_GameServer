const msgpack = require('@ygoe/msgpack');
const log = require('./logger');

class response {
    #res;

    constructor(res) {
        this.#res = res;
    }

    send (messageObj) {
        const encoded = msgpack.serialize(messageObj);
        let a = msgpack.deserialize(encoded);
        return this.#res.send(encoded);
    }

    error (err) {
        log.error(this.#res.req, err);
        const encoded = msgpack.encode(JSON.stringify(err));
        return this.#res.send(encoded);
    }
}

module.exports = response;