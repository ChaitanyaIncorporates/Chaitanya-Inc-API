import { serverLogger as logger } from './logger.js';

const errorHandler = (err, req, res, next) => {
    logger.error({
        type: 'error',
        timestamp: new Date().toISOString(),
        clientIp: req.ip,
        error: {
            message: err.message,
            stack: err.stack,
            process: 'Error Handling Middleware',
            request: {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body,
            },
        },
    });

    res.status(500).json({ error: 'Internal Server Error' });
};

const uncaughtExceptionHandler = (err, req, res) => {
    logger.error({
        type: 'error',
        timestamp: new Date().toISOString(),
        clientIp: req.ip,
        error: {
            message: 'Uncaught Exception',
            stack: err.stack,
            process: 'Uncaught Exception Handler',
            request: {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body,
            },
        },
    });

    res.status(500).json({ error: 'An unexpected error occurred. Our team has been notified and will investigate.' });
    process.exit(1);
};

const unhandledRejectionHandler = (reason, promise) => {
    logger.error({
        type: 'error',
        timestamp: new Date().toISOString(),
        error: {
            message: 'An unexpected error occurred. Our team has been notified and will investigate.',
            process: 'Unhandled Rejection Handler',
            promise: promise,
            reason: reason,
        },
    });
    process.exit(1);
};

const notFoundHandler = (req, res) => {
    logger.warn({
        type: 'error',
        timestamp: new Date().toISOString(),
        clientIp: req.ip,
        error: {
            message: 'Resource not found',
            process: 'Not Found Handler',
            request: {
                method: req.method,
                url: req.originalUrl,
            },
        },
    });

    res.status(404).json({ error: 'Resource not found' });
};

const validationErrorHandler = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        logger.error({
            type: 'error',
            timestamp: new Date().toISOString(),
            clientIp: req.ip,
            error: {
                message: err.message,
                details: err.details,
                process: 'Validation Error Handler',
                request: {
                    method: req.method,
                    url: req.originalUrl,
                    headers: req.headers,
                    body: req.body,
                },
            },
        });

        res.status(400).json({ error: 'Validation Error', details: err.details });
    } else {
        next(err);
    }
};

const genericErrorHandler = (err, req, res, next) => {
    logger.error({
        type: 'error',
        timestamp: new Date().toISOString(),
        clientIp: req.ip,
        error: {
            message: err.message,
            stack: err.stack,
            process: 'Generic Error Handler',
            request: {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body,
            },
        },
    });

    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
};

process.on('uncaughtException', (err) => {
    uncaughtExceptionHandler(err, {}, response);
});

process.on('unhandledRejection', (reason, promise) => {
    unhandledRejectionHandler(reason, promise);
});

function errorHandlingMiddleware(app) {
    app.use(notFoundHandler);
    app.use(validationErrorHandler);
    app.use(genericErrorHandler);
    app.use(errorHandler);
}

export default errorHandlingMiddleware;