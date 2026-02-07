import express from 'express';
import { createContact, getContacts, getContactById, deleteContact } from '../controllers/contactController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

router.post('/', createContact);
router.get('/', authenticate, adminOnly, getContacts);
router.get('/:id', authenticate, adminOnly, getContactById);
router.delete('/:id', authenticate, adminOnly, deleteContact);

export default router;
