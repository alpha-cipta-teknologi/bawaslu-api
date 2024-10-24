'use strict';

import express from 'express';
import { auth } from './auth.middleware';
import { validation } from './auth.validation';
import { auth as controller } from './auth.controller';

const router = express.Router();

router.post(
  '/register',
  validation.register,
  auth.recaptcha,
  controller.register
);
router.get('/verify', controller.verify);
router.post('/login', auth.recaptcha, auth.checkVerify, controller.login);
router.post('/logout', auth.checkBearerToken, controller.logout);
router.post(
  '/refresh-token',
  auth.checkExpiredToken,
  auth.checkRefreshToken,
  controller.refresh
);
router.post('/forgot-password', controller.forgot);
router.post('/reset-password', controller.reset);
router.post('/login-sso', auth.checkSSOToken, controller.loginSSO);

router.post('/otp', controller.otp);
router.post('/verify-otp', controller.verifyOtp);

export default router;
