const { createLogger, format, transports } = require('winston');
const { combine, label, printf } = format;
const path = require('path');
const mt = require('moment-timezone');


Object.defineProperty(global, '__stack', {
    get: function() {
        let orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        let err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        let stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function() {
        return __stack[3].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
    get: function() {
        return __stack[3].getFunctionName();
    }
});


//const PATH = `${__dirname}\\..\\..\\`;
const PATH =  process.cwd();
const FILE = 'logs';

const logFormat = printf(info => `${info.date} [${info.level}]: ${info.label} - ${info.message}`); // 로그 형식 설정
const KST = format((info) => {
    info.date = mt().tz('Asia/Seoul').format('YYMMDD hh:mm:ss');
    return info;
});

const _httpLogger = createLogger({
    format: combine(label({label: 'http'}), KST(), logFormat),
    transports: [
        new transports.File({filename: path.join(PATH, FILE, mt().tz('Asia/Seoul').format('YYYY-MM-DD'), 'http.log')}),
    ],
});

const httpLogger = {
    write: (message) => { // morgan에서 쓰기 위해 이 형태로 fix 되야함
        _httpLogger.log({
            level: 'info',
            message: message,
        });
    },
};

const appLogger = createLogger({
    level: 'info',
    format: combine(label({label: ''}), KST(), logFormat),
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.File({filename: path.join(PATH, FILE, 'error.log'), level: 'error'}), // 에러
        new transports.File({filename: path.join(PATH, FILE, mt().tz('Asia/Seoul').format('YYYY-MM-DD'), 'app.log')}), // 모든 로그
    ]
});

// Console에도 출력하도록 설정
const isProdunction = process.argv.slice(2).length > 0 && process.argv.slice(2)[0] === 'production';
if (!isProdunction) {
    appLogger.add(new transports.Console({
      format: combine(label({label: ''}), KST(), logFormat),
      level: 'debug'
    }));
}

const log = {
    debug (req, msg) {
        appLogger.debug(this.make(req, msg));
    },
    info (req, msg) {
        appLogger.info(this.make(req, msg));
    },
    error (req, msg) {
        appLogger.error(this.make(req, msg));
    },
    make (req, msg) {
        if (!req && !msg) {
            return '';
        } else if (typeof req == 'string' && !msg) {
            return req;
        } 
        return `${req.originalUrl} - [${JSON.stringify(req.body)}] ${__function}:${__line} ${msg} \n ${__stack}`;
    }
}

module.exports = log;
module.exports.httpLogger = httpLogger;
