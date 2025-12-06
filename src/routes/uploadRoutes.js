import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);

// @route   POST /api/upload
// @desc    Upload image to Cloudinary
// @access  Private
router.post('/', uploadImage);

// @route   DELETE /api/upload/:publicId
// @desc    Delete image from Cloudinary
// @access  Private
router.delete('/:publicId', deleteImage);

export default router;
