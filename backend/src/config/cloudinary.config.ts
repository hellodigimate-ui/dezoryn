import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dezoryn';
const apiKey = process.env.CLOUDINARY_API_KEY || '123456789012345';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'dezo_secret_key_cloud_2026';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
}

export async function uploadToCloudinary(fileBuffer: Buffer, options: CloudinaryUploadOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder ? `dezoryn/${options.folder.toLowerCase()}` : 'dezoryn/general',
      resource_type: options.resource_type || 'auto',
      public_id: options.public_id,
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        // If Cloudinary config credentials fail or error out, fallback gracefully
        console.warn('Cloudinary upload stream notice:', error.message);
        resolve({
          public_id: options.public_id || `cloud_${Date.now()}`,
          secure_url: null, // caller will construct local or fallback URL
        });
      } else {
        resolve(result);
      }
    });

    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: string = 'image'): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType as any });
  } catch (err: any) {
    console.warn('Notice deleting from Cloudinary:', err.message);
  }
}

export { cloudinary };
