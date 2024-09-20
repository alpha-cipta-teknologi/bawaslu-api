'use strict';

import express from 'express';
import { global } from './global.controller';
import { auth } from '../auth/auth.middleware';
import { content } from '../reff/content/content.controller';
import { factcheck } from '../report/fact_check/fact.check.controller';
import { likeComment } from '../forum/like.comment/like.comment.controller';
import { complaint } from '../report/complaint/report.complaint.controller';

const router = express.Router();

router.get('/', global.index);
router.get('/navigation', global.navigation);
router.get('/fe/content', content.homeContent);
router.get('/fe/gallery', global.gallery);
router.get('/fe/article', global.article);
router.get('/fe/bawaslu-update', global.bwuIndex);
router.get('/fe/bawaslu-update/:slug', global.bwuDetail);
router.get('/fe/comment', likeComment.index);
router.get('/fe/comment/:id_external/:group', likeComment.detail);
router.get('/fe/trending-article', global.trendingArticle);
router.get('/fe/factcheck', factcheck.indexFE);
router.get('/fe/search', global.search);
router.get('/fe/history-complaint', auth.checkBearerToken, complaint.history);
router.get('/fe/antihoax/search', global.antihoaxSearch);
router.post('/sendmail', global.sendmail);

export default router;
