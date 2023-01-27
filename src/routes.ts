'use strict';

import { Router } from 'express';
import apps from './module/app/app.routes';
import exception from './helpers/exception';
import area from './module/area/area.routes';
import auth from './module/auth/auth.routes';
import reff from './module/reff/reff.routes';
import forum from './module/forum/forum.routes';
import notif from './module/notif/notif.routes';
import global from './module/global/global.routes';
import report from './module/report/report.routes';

const router: Router = Router();

router.use('/', global);
router.use('/auth', auth);
router.use('/app', apps);
router.use('/area', area);
router.use('/reff', reff);
router.use('/forum', forum);
router.use('/notif', notif);
router.use('/report', report);
router.use(exception);

export default router;
