const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const master = require('./src/bin/master');
const logger = require("./src/utils/logger");

async function initializeAppServer() {
    if (cluster.isMaster) {
        // CPU 개수만큼 워커 프로세스 생성  numCPUs
        for (let i = 0; i < 2; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            logger.info(`Worker ${worker.process.pid} died`);
            // 종료된 워커 프로세스 재생성
            cluster.fork();
        });
    } 
    else {
        await master.initializeProcess();
    }
}

initializeAppServer();