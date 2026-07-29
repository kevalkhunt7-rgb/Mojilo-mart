import { HfInference } from '@huggingface/inference';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const generateImage = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new ApiError(400, 'A prompt string is required.');
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, 'HUGGINGFACE_API_KEY is not configured in .env');
  }

  try {
    const hf = new HfInference(apiKey.trim());

    // Generate image using official HF SDK
    const blob = await hf.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      inputs: prompt.trim(),
    });

    // Convert Blob to Base64 Buffer
    const arrayBuffer = await blob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return res.status(200).json(
      new ApiResponse(200, { imageUrl }, 'Image generated successfully')
    );
  } catch (error) {
    throw new ApiError(500, `Hugging Face Error: ${error.message}`);
  }
});