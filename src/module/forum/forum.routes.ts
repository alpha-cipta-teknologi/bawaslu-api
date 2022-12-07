'use strict';

import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import { article } from './article/article.controller';
import { likeComment } from './like.comment/like.comment.controller';
import { bawasluUpdate } from './bawaslu.update/bawaslu.update.controller';

const router: Router = Router();

router.get('/article', auth.checkBearerToken, article.index);
router.get('/article/:slug', auth.checkBearerToken, article.detail);
router.post('/article', auth.checkBearerToken, article.create);
router.put('/article/:id', auth.checkBearerToken, article.update);
router.delete('/article/:id', auth.checkBearerToken, article.delete);

router.get('/bawaslu-update', auth.checkBearerToken, bawasluUpdate.index);
router.get(
  '/bawaslu-update/:slug',
  auth.checkBearerToken,
  bawasluUpdate.detail
);
router.post('/bawaslu-update', auth.checkBearerToken, bawasluUpdate.create);
router.put('/bawaslu-update/:id', auth.checkBearerToken, bawasluUpdate.update);
router.delete(
  '/bawaslu-update/:id',
  auth.checkBearerToken,
  bawasluUpdate.delete
);

router.post('/like', auth.checkBearerToken, likeComment.like);
router.post('/comment', auth.checkBearerToken, likeComment.create);
router.put('/comment', auth.checkBearerToken, likeComment.update);
router.delete('/comment', auth.checkBearerToken, likeComment.delete);
router.post('/counter', auth.checkBearerToken, likeComment.counter);

export default router;
