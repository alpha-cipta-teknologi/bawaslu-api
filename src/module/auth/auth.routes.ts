'use strict';

import express from 'express';
import { auth } from './auth.middleware';
import { validation } from './auth.validation';
import { auth as controller } from './auth.controller';

const router = express.Router();

router.post('/register', validation.register, controller.register);
router.get('/verify', controller.verify);
router.post('/login', auth.checkVerify, controller.login);
router.post(
  '/refresh-token',
  auth.checkExpiredToken,
  auth.checkRefreshToken,
  controller.refresh
);

export default router;
