'use strict';

import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import { article } from '../report/article/report.article.controller';
import { complaint } from '../report/complaint/report.complaint.controller';

const router: Router = Router();

router.get('/article/', auth.checkBearerToken, article.index);
router.get('/article/:id', auth.checkBearerToken, article.detail);
router.post('/article/', auth.checkBearerToken, article.create);
router.put('/article/:id', auth.checkBearerToken, article.update);
router.delete('/article/:id', auth.checkBearerToken, article.delete);

router.get('/complaint/', auth.checkBearerToken, complaint.index);
router.get('/complaint/:id', auth.checkBearerToken, complaint.detail);
router.post('/complaint/', auth.checkBearerToken, complaint.create);
router.put('/complaint/:id', auth.checkBearerToken, complaint.update);
router.delete('/complaint/:id', auth.checkBearerToken, complaint.delete);

export default router;