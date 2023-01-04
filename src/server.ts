'use strict';

import cors from 'cors';
import dotenv from 'dotenv';
import moment from 'moment';
import bodyParser from 'body-parser';
import express, { Express } from 'express';
import fileUpload from 'express-fileupload';

import routes from './routes';
import redis from './config/redis';
import conn from './config/database';
import { helper } from './helpers/helper';
require('express-async-errors');

const app: Express = express();
const port: number = +(process.env.PORT || 5000);
const day: string = moment().format('YYYY-MM-DD');

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: `./tmp/${day}/`,
  })
);

const options: cors.CorsOptions = {
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
    'Authorization',
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: '*',
  preflightContinue: false,
};
app.use(cors(options));
app.use(routes);

(async () => {
  try {
    await conn.sequelize.authenticate();
    console.warn('Connection has been established successfully.');
  } catch (err) {
    await helper.sendNotif(err?.message);
    console.warn('Unable to connect to the database:', err?.message);
  }
})();

(async () => {
  redis.on('error', async (error) => {
    await helper.sendNotif(`Redis : ${error}`);
    console.warn(`Redis : ${error}`);
  });
  await redis.connect();
})();

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running on port: ${port}`);
});
