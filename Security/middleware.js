import helmet from 'helmet';
import { logger } from './logger.js';
import rateLimit from 'express-rate-limit';
import protocolChecker from './protocol.js';
import { measureRequestDuration } from './metrics.js';

function middleware(app) {
    app.use(helmet({
        contentSecurityPolicy: false,
        frameguard: {
            action: 'deny'
        },
        dnsPrefetchControl: false,
        noSniff: true,
        xssFilter: true
    }));
    app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
    app.use(protocolChecker);
    app.use(logger);
    app.use(measureRequestDuration);

}

export default middleware;