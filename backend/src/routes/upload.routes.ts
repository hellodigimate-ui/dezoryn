import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { MediaController } from '../controllers/media.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Standard upload
router.post('/', upload.single('file'), UploadController.uploadFile);
router.get('/', UploadController.getMediaList);

// Media Library endpoints (Cloudinary + Folders + PDF/Video/Image + Replace + Delete)
router.get('/media', MediaController.list);
router.get('/folders', MediaController.folders);
router.post('/media', upload.single('file'), MediaController.upload);
router.put('/media/:id', upload.single('file'), MediaController.replace);
router.delete('/media/:id', MediaController.delete);

export default router;
