import winston from 'winston';

const serverLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './logs/combined.log' }),
    ],
});

const requestLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: './logs/user.log' }),
    ],
});

const logger = (req, res, next) => {
    const start = Date.now();
    const startLog = {
        type: 'request',
        timestamp: new Date().toISOString(),
        method: req.method,
        userIp: req.ip,
        url: req.url,
        headers: req.headers,
        body: req.body,
    };

    try {
        res.once('finish', () => {
            const end = Date.now();
            const processingTime = end - start;
            const finishLog = {
                type: 'response',
                timestamp: new Date().toISOString(),
                headers: res.getHeaders(),
            };
            const combinedLog = { ...startLog, ...finishLog };
            if (res.statusCode >= 500) {
                serverLogger.child({ status: res.statusCode, processingTime: processingTime + 'ms', clientIp: req.ip, }).error(combinedLog);
            } else if (res.statusCode >= 400) {
                serverLogger.child({ status: res.statusCode, processingTime: processingTime + 'ms', clientIp: req.ip, }).warn(combinedLog);
            } else {
                serverLogger.child({ status: res.statusCode, processingTime: processingTime + 'ms', clientIp: req.ip, }).info(combinedLog);
            }
        });
    } catch (error) {
        serverLogger.error(`Error in logger: ${error.message}`);
    }

    next();
};

export { logger, requestLogger, serverLogger };