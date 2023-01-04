'use strict';

import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();
interface Config {
  host: string;
  port: number;
  username: string;
  password: string;
}

const cfg: Config = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: +(process.env.REDIS_PORT || 6379),
  username: process.env.REDIS_USER || '',
  password: process.env.REDIS_PASSWORD || '',
};

const client = createClient({
  url: `redis://${cfg?.username}:${cfg?.password}@${cfg?.host}:${cfg?.port}`,
});

export default client;
