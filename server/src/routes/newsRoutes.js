import express from 'express';
import { getNews, getNewsBySlug } from '../controllers/newsController.js';

const router = express.Router();

router.get('/', getNews);
router.get('/:slug', getNewsBySlug);

export default router;
