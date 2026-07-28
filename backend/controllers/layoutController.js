import Layout from '../models/Layout.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryHelper.js';

export const getLayouts = asyncHandler(async (req, res) => {
  const layouts = await Layout.find();
  res.status(200).json(new ApiResponse(200, layouts, 'Layout configurations retrieved'));
});

export const getLayoutByType = asyncHandler(async (req, res) => {
  const type = req.params.type;
  if (!['hero', 'new-collection', 'canvas-template'].includes(type)) {
    throw new ApiError(400, 'Invalid layout type');
  }
  
  let layout = await Layout.findOne({ type });
  if (!layout) {
    // Automatically seed an empty layout configuration if it doesn't exist
    layout = await Layout.create({
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layout`,
      hero: type === 'hero' ? { slides: [] } : undefined,
      newCollection: type === 'new-collection' ? { products: [], banner: { title: '', subtitle: '' } } : undefined,
      canvasTemplate: type === 'canvas-template' ? { printAreaName: 'Front', textLayers: [], imageLayers: [] } : undefined
    });
  }
  res.status(200).json(new ApiResponse(200, layout, `${type} layout retrieved`));
});

export const createLayout = asyncHandler(async (req, res) => {
  const layout = await Layout.create(req.body);
  res.status(201).json(new ApiResponse(201, layout, 'Layout saved successfully'));
});

export const updateLayoutByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  if (!['hero', 'new-collection'].includes(type)) {
    throw new ApiError(400, 'Update not supported for this layout type');
  }

  let layout = await Layout.findOne({ type });
  if (!layout) {
    layout = new Layout({
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layout`,
    });
  }

  if (type === 'hero') {
    const slidesMeta = JSON.parse(req.body.slides || '[]');
    const finalSlides = [];
    
    for (const slide of slidesMeta) {
      if (slide.isNew) {
        // Find corresponding file in uploaded files
        const file = req.files.find(f => f.fieldname === `images` || f.fieldname === 'images[]');
        // In case multiple files, or file index mapping, let's check matching index
        const fileIndex = slide.fileIndex !== undefined ? slide.fileIndex : 0;
        const matchingFile = req.files[fileIndex] || req.files.find(f => f.originalname === slide.fileName);
        
        if (matchingFile) {
          const result = await uploadBufferToCloudinary(matchingFile.buffer, 'layouts/hero');
          finalSlides.push({
            image: {
              url: result.secure_url,
              publicId: result.public_id
            },
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            link: slide.link || ''
          });
        } else {
          // Fallback if file not found
          finalSlides.push({
            image: slide.image || { url: '', publicId: '' },
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            link: slide.link || ''
          });
        }
      } else {
        // Keep existing slide
        finalSlides.push({
          image: slide.image,
          title: slide.title || '',
          subtitle: slide.subtitle || '',
          link: slide.link || ''
        });
      }
    }
    
    layout.hero = { slides: finalSlides };
  } else if (type === 'new-collection') {
    const products = JSON.parse(req.body.products || '[]');
    const bannerData = JSON.parse(req.body.bannerData || '{}');
    let bannerImage = layout.newCollection?.banner?.image || { url: '', publicId: '' };

    const bannerFile = req.files.find(f => f.fieldname === 'bannerImage');
    if (bannerFile) {
      const result = await uploadBufferToCloudinary(bannerFile.buffer, 'layouts/new-collection');
      bannerImage = {
        url: result.secure_url,
        publicId: result.public_id
      };
    }

    layout.newCollection = {
      products,
      banner: {
        image: bannerImage,
        title: bannerData.title || '',
        subtitle: bannerData.subtitle || ''
      }
    };
  }

  await layout.save();
  res.status(200).json(new ApiResponse(200, layout, `${type} layout updated successfully`));
});