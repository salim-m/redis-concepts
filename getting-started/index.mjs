import redis from '../redis-client.mjs';

async function bootstrap() {
  await redis.set('key1', 'value1'); // OK

  const value = await redis.get('key1');

  console.log('Got ', value);

  await redis.quit();
}

bootstrap();
