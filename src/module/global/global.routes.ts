'use strict';

import express from 'express';
import { global } from './global.controller';
import { content } from '../reff/content/content.controller';
import { gallery } from '../reff/gallery/gallery.controller';
import { article } from '../forum/article/article.controller';
import { likeComment } from '../forum/like.comment/like.comment.controller';
import { bawasluUpdate } from '../forum/bawaslu.update/bawaslu.update.controller';

const router = express.Router();

router.get('/', global.index);
router.get('/navigation', global.navigation);
router.get('/fe/content', content.homeContent);
router.get('/fe/gallery', gallery.index);
router.get('/fe/article', article.index);
router.get('/fe/bawaslu-update', bawasluUpdate.index);
router.get('/fe/comment', likeComment.index);
router.get('/fe/comment/:id_external/:group', likeComment.detail);

export default router;
