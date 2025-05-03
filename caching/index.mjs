import redis from '../redis-client.mjs';
import express from 'express';

const app = express();

const getCacheKey = (postId) => `post:${postId}`;

const getPostById = async (postId) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${postId}`,
  );
  return response.json();
};

app.get('/posts/:id', async (req, res) => {
  const postId = req.params.id;

  const cacheKey = getCacheKey(postId);

  let cached = false;
  let data;

  const post = await redis.get(cacheKey);

  if (!post) {
    const post = await getPostById(postId);
    await redis.set(cacheKey, JSON.stringify(post));
    data = post;
  } else {
    cached = true;
    data = JSON.parse(post);
  }

  res.send({
    cached,
    data,
  });
});

app.get('/flush-all', async (req, res) => {
  await redis.flushall();
  res.sendStatus(200);
});

app.listen(3000, async () => {
  console.log('Express listening on port 3000 ...');
});
