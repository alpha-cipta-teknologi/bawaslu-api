'use strict';

import { Router } from 'express';
import { tema } from './tema/tema.controller';
import { auth } from '../auth/auth.middleware';
import { content } from './content/content.controller';
import { gallery } from './gallery/gallery.controller';
import { category } from './category/category.controller';
import { komunitas } from './komunitas/komunitas.controller';
import { kerjasama } from '../jari.hubal/bentuk/kerjasama.controller';

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

router.get('/tema/all-data', tema.list);
router.get('/tema/', auth.checkBearerToken, tema.index);
router.post('/tema/', auth.checkBearerToken, tema.create);
router.put('/tema/:id', auth.checkBearerToken, tema.update);
router.delete('/tema/:id', auth.checkBearerToken, tema.delete);

router.get('/komunitas/all-data', komunitas.list);
router.get('/komunitas/', auth.checkBearerToken, komunitas.index);
router.post('/komunitas/', auth.checkBearerToken, komunitas.create);
router.put('/komunitas/:id', auth.checkBearerToken, komunitas.update);
router.delete('/komunitas/:id', auth.checkBearerToken, komunitas.delete);

router.get('/bentuk-kerjasama/all-data', kerjasama.list);
router.get('/bentuk-kerjasama/', auth.checkBearerToken, kerjasama.index);
router.post('/bentuk-kerjasama/', auth.checkBearerToken, kerjasama.create);
router.put('/bentuk-kerjasama/:id', auth.checkBearerToken, kerjasama.update);
router.delete('/bentuk-kerjasama/:id', auth.checkBearerToken, kerjasama.delete);

export default router;
