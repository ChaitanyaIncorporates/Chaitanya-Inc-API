import prometheus from 'prom-client';

const httpRequestDurationMicroseconds = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in microseconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 3, 5],
});

function measureRequestDuration(req, res, next) {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.originalUrl, status_code: res.statusCode });
    });
    next();
}

async function exposeMetrics(req, res) {
    try {
        const metrics = await prometheus.register.metrics();
        res.set('Content-Type', prometheus.register.contentType);
        res.send(metrics);
    } catch (error) {
        console.error('Error exposing metrics:', error);
        res.status(500).send('Error exposing metrics');
    }
}

export { measureRequestDuration, exposeMetrics };