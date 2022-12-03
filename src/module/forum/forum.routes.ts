'use strict';

import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import { article } from './article/article.controller';
import { likeComment } from '../forum/like_comment/like.comment.controller';

const router: Router = Router();

router.get('/article', auth.checkBearerToken, article.index);
router.post('/article', auth.checkBearerToken, article.create);
router.put('/article/:id', auth.checkBearerToken, article.update);
router.delete('/article/:id', auth.checkBearerToken, article.delete);

router.post('/like', auth.checkBearerToken, likeComment.like);

export default router;
