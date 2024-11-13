'use strict';

import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import { form } from '../jari.hubal/form/form.controller';
import { audiensi } from '../jari.hubal/form/audiensi/audiensi.controller';
import { kerjasama } from '../jari.hubal/form/kerjasama/kerjasama.controller';

const router: Router = Router();

router.get('/audiensi/', auth.checkToken, audiensi.index);
router.get('/audiensi/approve', auth.checkToken, audiensi.indexApprove);
router.get('/audiensi/:id', auth.checkToken, audiensi.detail);
router.post('/audiensi/', auth.checkToken, audiensi.create);
router.put('/audiensi/status/:id', auth.checkToken, audiensi.updateStatus);
router.put('/audiensi/:id', auth.checkToken, audiensi.update);
router.delete('/audiensi/:id', auth.checkToken, audiensi.delete);

router.get('/kerjasama/', auth.checkToken, kerjasama.index);
router.get('/kerjasama/:id', auth.checkToken, kerjasama.detail);
router.post('/kerjasama/', auth.checkToken, kerjasama.create);
router.put('/kerjasama/status/:id', auth.checkToken, kerjasama.updateStatus);
router.put('/kerjasama/:id', auth.checkToken, kerjasama.update);
router.delete('/kerjasama/:id', auth.checkToken, kerjasama.delete);

router.post('/lacak-pengajuan', auth.checkToken, form.lacak);
router.get('/pengajuan/mou', auth.checkToken, form.index);

export default router;
