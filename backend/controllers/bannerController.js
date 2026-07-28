import Banner from '../models/Banner.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { uploadBufferToCloudinary, deleteFromCloudinary, applyBackgroundRemoval } from '../utils/cloudinaryHelper.js';

// 1. CREATE NEW BANNER SLIDE
export const createBanner = asyncHandler(async (req, res) => {
  const {
    tagline,
    title,
    description,
    ctaText,
    ctaLink,
    stat1Number,
    stat1Label,
    stat2Number,
    stat2Label,
    isActive
  } = req.body;

  if (!title || !description) {
    throw new ApiError(400, 'Banner heading title and descriptive text are required');
  }

  // File checking verification (provided by multer)
  if (!req.file) {
    throw new ApiError(400, 'A hero cover graphic image file asset is required');
  }

  // Upload file buffer to Cloudinary, then apply background removal via URL transformation
  const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'banners');
  const uploadedImage = {
    url: applyBackgroundRemoval(uploadResult.secure_url),
    publicId: uploadResult.public_id
  };

  const banner = await Banner.create({
    tagline,
    title,
    description,
    ctaText,
    ctaLink,
    stat1Number,
    stat1Label,
    stat2Number,
    stat2Label,
    isActive: isActive === 'true' || isActive === true, // handle FormData string conversion safely
    image: uploadedImage
  });

  res.status(201).json(new ApiResponse(201, banner, 'Hero slider banner deployed successfully!'));
});

// 2. GET ALL BANNER SLIDES (FOR ADMIN DASHBOARD)
export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, banners, 'All banners retrieved successfully'));
});

// 3. GET ACTIVE BANNERS ONLY (FOR FRONTEND LANDING HOMEPAGE HERO SLIDER)
export const getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, banners, 'Active hero slider records loaded successfully'));
});

// 4. UPDATE BANNER SLIDE METADATA
export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateFields = { ...req.body };

  // Handle conversion of active checkbox switch string values from FormData format
  if (updateFields.isActive !== undefined) {
    updateFields.isActive = updateFields.isActive === 'true' || updateFields.isActive === true;
  }

  let banner = await Banner.findById(id);
  if (!banner) {
    throw new ApiError(404, 'Target banner document could not be found');
  }

  // Optional new image file payload replacement
  if (req.file) {
    // 1. Delete previous file asset from remote storage node
    if (banner.image && banner.image.publicId) {
      try {
        await deleteFromCloudinary(banner.image.publicId);
      } catch (err) {
        console.error('Failed to delete old image from Cloudinary', err);
      }
    }

    // 2. Save new asset snapshot data references with background removal URL transformation
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'banners');
    updateFields.image = {
      url: applyBackgroundRemoval(uploadResult.secure_url),
      publicId: uploadResult.public_id
    };
  }

  const updatedBanner = await Banner.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, updatedBanner, 'Hero slider elements successfully updated'));
});

// 5. DELETE BANNER SLIDE
export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const banner = await Banner.findById(id);
  if (!banner) {
    throw new ApiError(404, 'Banner document does not exist');
  }

  // Delete matching media file node tracking link from production cloud arrays
  if (banner.image && banner.image.publicId) {
    try {
      await deleteFromCloudinary(banner.image.publicId);
    } catch (err) {
      console.error('Failed to delete image from Cloudinary', err);
    }
  }

  await Banner.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, null, 'Banner slider item deleted successfully'));
});