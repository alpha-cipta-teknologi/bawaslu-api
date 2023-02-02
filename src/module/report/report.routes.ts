'use strict';

import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import { summary } from '../report/summary/summary.controller';
import { article } from '../report/article/report.article.controller';
import { factcheck } from '../report/fact_check/fact.check.controller';
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

router.get('/factcheck/', auth.checkBearerToken, factcheck.index);
router.get('/factcheck/:id', auth.checkBearerToken, factcheck.detail);
router.post('/factcheck/', auth.checkBearerToken, factcheck.create);
router.put('/factcheck/:id', auth.checkBearerToken, factcheck.update);
router.delete('/factcheck/:id', auth.checkBearerToken, factcheck.delete);

router.get('/summary/pengguna', auth.checkBearerToken, summary.pengguna);
router.get(
  '/summary/pengguna-komunitas',
  auth.checkBearerToken,
  summary.penggunaKomunitas
);
router.get('/summary/article-tema', auth.checkBearerToken, summary.articleTema);
router.get(
  '/summary/article-komunitas',
  auth.checkBearerToken,
  summary.articleKomunitas
);
router.get('/summary/dashboard', auth.checkBearerToken, summary.dashboard);

export default router;
