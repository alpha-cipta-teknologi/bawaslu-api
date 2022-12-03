'use strict';

import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import { content } from './content/content.controller';
import { gallery } from './gallery/gallery.controller';
import { category } from './category/category.controller';

const router: Router = Router();

router.get('/category/all-data', auth.checkBearerToken, category.list);
router.get('/category/', auth.checkBearerToken, category.index);
router.post('/category/', auth.checkBearerToken, category.create);
router.put('/category/:id', auth.checkBearerToken, category.update);
router.delete('/category/:id', auth.checkBearerToken, category.delete);

router.get('/content/', auth.checkBearerToken, content.index);
router.post('/content/', auth.checkBearerToken, content.create);
router.put('/content/:id', auth.checkBearerToken, content.update);
router.delete('/content/:id', auth.checkBearerToken, content.delete);

router.get('/gallery/', auth.checkBearerToken, gallery.index);
router.post('/gallery/', auth.checkBearerToken, gallery.create);
router.put('/gallery/:id', auth.checkBearerToken, gallery.update);
router.delete('/gallery/:id', auth.checkBearerToken, gallery.delete);

export default router;
