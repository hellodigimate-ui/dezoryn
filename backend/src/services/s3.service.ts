import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import { env } from '../config/env.config';

export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
  region: string;
}

export interface S3UploadOptions {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  folder?: string;
}

export class S3Service {
  private static client: S3Client | null = null;

  /**
   * Lazy-initialize S3 Client with backend-only environment variables.
   * Credentials NEVER leak to frontend or client responses.
   */
  private static getClient(): S3Client {
    if (this.client) {
      return this.client;
    }

    const accessKeyId = env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const region = env.AWS_REGION || process.env.AWS_REGION || 'ap-south-1';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are not configured in the backend environment.');
    }

    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim(),
      },
    });

    return this.client;
  }

  /**
   * Sanitizes filename and generates safe, unique S3 key path.
   * e.g., products/1725368000000-a1b2c3d4-sanitized_file.png
   */
  public static generateObjectKey(originalname: string, folder = 'products'): string {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '').toLowerCase() || 'general';
    const ext = path.extname(originalname);
    const basename = path.basename(originalname, ext);
    const sanitizedBase = basename.replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const timestamp = Date.now();
    return `${cleanFolder}/${timestamp}-${uniqueId}-${sanitizedBase}${ext}`;
  }

  /**
   * Uploads file buffer directly to AWS S3.
   * Returns safe S3 public URL and object key.
   */
  public static async uploadFile(options: S3UploadOptions): Promise<S3UploadResult> {
    const { buffer, originalname, mimetype, folder = 'products' } = options;

    if (!buffer || buffer.length === 0) {
      throw new Error('File buffer is empty or missing.');
    }

    const client = this.getClient();
    const bucket = env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET || 'dezo-software';
    const region = env.AWS_REGION || process.env.AWS_REGION || 'ap-south-1';
    const key = this.generateObjectKey(originalname, folder);

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype || 'application/octet-stream',
      });

      await client.send(command);

      const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

      return {
        url,
        key,
        bucket,
        region,
      };
    } catch (err: any) {
      // Safe error reporting without exposing credentials
      console.error(`[S3Service] Upload failed for key: ${key}. Error: ${err.message}`);
      throw new Error(`S3 upload failed: ${err.message || 'Unknown S3 error'}`);
    }
  }

  /**
   * Deletes an object from AWS S3 by its object key.
   */
  public static async deleteFile(key: string): Promise<boolean> {
    if (!key) return false;

    try {
      const client = this.getClient();
      const bucket = env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET || 'dezo-software';

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await client.send(command);
      return true;
    } catch (err: any) {
      console.warn(`[S3Service] Deletion warning for key ${key}: ${err.message}`);
      return false;
    }
  }
}
