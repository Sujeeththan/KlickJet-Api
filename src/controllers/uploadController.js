import cloudinary from '../config/cloudinary.js';
import { AppError } from '../middleware/errorHandler.js';
import { catchAsync } from '../middleware/errorHandler.js';

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private (Authenticated users only)
export const uploadImage = catchAsync(async (req, res, next) => {
  const { data } = req.body;

  // Validate that image data is provided
  if (!data) {
    return next(new AppError('No image data provided', 400));
  }

  // Validate base64 format
  if (!data.startsWith('data:image/')) {
    return next(new AppError('Invalid image format. Only images are allowed.', 400));
  }

  try {
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(data, {
      folder: 'klickjet/products', // Organize uploads in folders
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // Allowed image formats
      max_bytes: 5 * 1024 * 1024, // 5MB max file size
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }, // Automatic optimization
      ],
    });

    // Return the secure URL and public ID
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);

    // Handle specific Cloudinary errors
    if (error.http_code === 401) {
      return next(
        new AppError(
          'Cloudinary authentication failed. Please check API credentials.',
          500
        )
      );
    }

    if (error.message?.includes('File size too large')) {
      return next(new AppError('Image file size exceeds 5MB limit', 400));
    }

    if (error.message?.includes('Invalid image file')) {
      return next(new AppError('Invalid image file format', 400));
    }

    // Generic error
    return next(
      new AppError(
        error.message || 'Failed to upload image to Cloudinary',
        500
      )
    );
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private (Authenticated users only)
export const deleteImage = catchAsync(async (req, res, next) => {
  const { publicId } = req.params;

  if (!publicId) {
    return next(new AppError('Public ID is required', 400));
  }

  try {
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'not found') {
      return next(new AppError('Image not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      result: result.result,
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return next(
      new AppError(
        error.message || 'Failed to delete image from Cloudinary',
        500
      )
    );
  }
});
