const { express, io, ioFuncs } = require('./mainRout');
// const config = require('winston-callback');
const config = require('config');
const fs = require('fs');

const rout = express.Router();

let logFile = process.env.mainDir + '\\logs\\logs.text';
let winsFile = 'logs\\combined.log';
const winston = require('winston');
const logger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: winsFile }),
    ],
    exitOnError: false, // do not exit on handled exceptions
});
let sysLog = {};
function setConsolesLog(logName) {
    sysLog[logName] = console[logName];
    console[logName] = function (...d) {
        if (!d) return;
        if (Array.isArray(d) && d.length == 1) {
            sysLog[logName](d[0]);
        }
        else {
            sysLog[logName](d);
        }
        let json = d;
        try {
            json = JSON.stringify(json)
        } catch (error) {

        }
        const stat = fs.statSync(logFile);
        if (stat.size > 10000) {
            fs.unlinkSync(logFile)
        }
        logger.log('error', json)
        fs.appendFileSync(logFile, '\n' + json, function (err) {
            if (err) throw err;
        });
        io.to('logger').emit('log', { d })
    };
}
setConsolesLog('error');
setConsolesLog('log');
setConsolesLog('warn');

rout.get('/logs', async (req, res) => {
    res.render(config.get('template') + '/page/logger', { user: req.user });
});
rout.ioF = async function (data, ack, userData) {
    if (!data) return;
    try {
        let ans = await ioF[data.signal](data.data, ack, userData);
        if (ans && ack) ack(ans);

    } catch (error) {
        console.log("🚀 ~ file: logger.js ~ line 45 ~ error", error)
    }
}
let ioF = {};
ioF.getLogs = async (data, ack, userData) => {
    fs.readFile(logFile, 'utf8', function (err, data) {
        // console.log("🚀 ~ file: logger.js ~ line 52 ~ data", data)

        io.to('logger').emit('logs', { data })
    })
}


module.exports = rout;