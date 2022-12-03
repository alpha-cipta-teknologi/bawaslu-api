'use strict';

import express from 'express';
import { global } from './global.controller';

const router = express.Router();

router.get('/', global.index);
router.get('/navigation', global.navigation);

export default router;
