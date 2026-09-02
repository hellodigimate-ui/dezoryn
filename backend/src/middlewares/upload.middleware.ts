import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.config';
import { BadRequestError } from '../errors/app-error';

// Ensure upload directory exists
const uploadPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  const isPdf = file.mimetype === 'application/pdf';
  const isAudio = file.mimetype.startsWith('audio/');

  if (isImage || isVideo || isPdf || isAudio) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `File format '${file.mimetype}' is not supported. Allowed formats: images, pdf, video, audio.`
      )
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, // Size in MB
  },
  fileFilter,
});
