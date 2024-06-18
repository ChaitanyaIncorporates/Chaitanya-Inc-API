import helmet from 'helmet';
import cors from 'cors';
import { logger } from './logger.js';
import rateLimit from 'express-rate-limit';
import protocolChecker from './protocol.js';
import { measureRequestDuration } from './metrics.js';

function middleware(app) {
    app.use(cors())
    app.use(helmet({
        contentSecurityPolicy: false,
        frameguard: { action: 'deny' },
        dnsPrefetchControl: false,
        noSniff: true,
        xssFilter: true
    }));
    app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
    app.use(protocolChecker);
    app.use(logger);
    app.use(measureRequestDuration);
}


export default middleware;