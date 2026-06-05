import express from 'express';
import { getAllUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/',       protect, adminOnly, getAllUsers);
router.get('/:id',    protect, adminOnly, getUser);
router.put('/:id',    protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;