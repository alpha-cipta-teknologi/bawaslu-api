'use strict';

import express from 'express';
import { global } from './global.controller';
import { content } from '../reff/content/content.controller';
import { likeComment } from '../forum/like.comment/like.comment.controller';

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

export default router;
