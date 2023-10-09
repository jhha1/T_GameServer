const msgpack = require('@ygoe/msgpack');
const _ = require('lodash');
const log = require('./logger');

class response {
    #res;

    constructor(res) {
        this.#res = res;
    }

    make(args, result) {
        if (_.isArray(args)) {
            return args.map((x) => this.make(x, result));
        } else if (_.isObject(args)) {
            return Object.values(args).map((x) => this.make(x, result));
        } else {
            return result.push(args);
        }
    }

    send (msgObj) {
        let msgArray = msgObj.make();
        //let msgArray = [];
        //this.make(msgObj, msgArray);

        log.info(this.#res.req, ` - [RES] {${JSON.stringify(msgObj)}}, [BIN] {${msgArray}}`);

        const encoded = msgpack.serialize(msgArray);

        log.debug(`encode:${encoded}, len:${encoded.length}, de:${msgpack.deserialize(encoded)}`);

        this.#res.writeHead(200, {
            'Content-Type': 'application/msgpack',
            'Content-Length': encoded.length,
            'Error-Code': 0
        });

        this.#res.end(Buffer.from(encoded));
    }

    error (err) {
        log.error(this.#res.req, err);
        const encoded = msgpack.serialize(err);

        this.#res.writeHead(200, {
            'Content-Type': 'application/msgpack',
            'Content-Length': encoded.length,
            'error-Code': err
        });

        this.#res.end(Buffer.from(encoded));
    }
}

module.exports = response;