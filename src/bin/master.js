const express = require('express');
const {isMainThread, Worker, workerData, parentPort} = require("worker_threads");
const bodyParser = require("body-parser");
const msgpack = require('@ygoe/msgpack');
const router = express.Router();
const httpLogger = require("../utils/logger").httpLogger;
const log = require("../utils/logger");
const db = require("../database/db");
const cache = require("../database/cache");
const initializer = require('../common/initialize');
const response = require('../utils/response');

const SERVER_PORT = 8887;

// worker process
const initializeProcess = async() => {
    
    // master thread
    if (isMainThread) {
        const app = express();

        // load static data
        initializer.initializeConfig();
        await initializer.initializeConst();

        // connect db, cache
        db.connect();
        await cache.connect();

        // middleware
        app.use(bodyParser.raw({ type: 'application/msgpack' }));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use((req, res, next) => {
            if (req.is('application/msgpack')) {
                try {
                    req.body = msgpack.deserialize(req.body);
                } catch (error) {
                    return next(error);
                }
            }
            next();
        });

        // session
        initializer.initializeSession(app);

        // app.use(morgan('combined', { stream: httpLogger }));
        app.use((err, req, res, next) => {
            response.error(res, err);
        });

        app.use('/', initializer.initializeRoutes(router));

        // game values
        initializer.initailizeGameValues();

        app.listen(SERVER_PORT, () => {
            log.info(`Server running on port: ${SERVER_PORT}`);
        });
    }
}

exports.initializeProcess = initializeProcess;


/*
// 스레드들 간에 공유할 데이터
const sharedData = [
    CONFIG,
    CONST_TABLE
];

// 스레드 생성
const numWorkers = 1;
const workers = [];
for (let i = 0; i < numWorkers; i++) {
workers.push(new Promise((resolve, reject) => {
    const worker = new Worker('./src/bin/worker.js', { workerData: { threadIndex: i, sharedData } });
    worker.once("message", (message) => { 
        if (message === "initialized") { resolve(); }
    });
    worker.on("error", reject);
}));
}
await Promise.all(workers); // 모든 작업자 스레드가 생성될 때까지 기다림    
*/