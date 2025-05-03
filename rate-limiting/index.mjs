import redis from '../redis-client.mjs';
import express from 'express';

const app = express();

// config: 10 request per minute
const cache = {
  ttl: 60,
  limit: 20,
};

const getCacheKey = (ipAddress) => `rate-limiter:${ipAddress}`;

app.get('/', async (req, res) => {
  const cacheKey = getCacheKey(req.ip);

  const hits = await redis.incr(cacheKey);

  if (hits === 1) await redis.expire(cacheKey, cache.ttl);

  const rateLimited = hits >= cache.limit;
  const statusCode = rateLimited ? 429 : 200;

  res.status(statusCode).send({ rateLimited, hits });
});

app.get('/flush-all', async (req, res) => {
  await redis.flushall();
  res.sendStatus(200);
});

app.listen(3000, async () => {
  console.log('Express listening on port 3000 ...');
});
