'use strict';

import { Router } from 'express';
import { area } from './area.controller';
import { auth } from '../auth/auth.middleware';

const router: Router = Router();

router.get('/area/province', auth.checkBearerToken, area.province);
router.get('/area/regency/:id', auth.checkBearerToken, area.regency);

export default router;
