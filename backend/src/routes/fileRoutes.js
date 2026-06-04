import express from 'express';
import { generateUploadUrl, verifyAndDownload } from '../controllers/fileController.js';

const router = express.Router();

router.post('/upload', generateUploadUrl);
router.post('/download/:id', verifyAndDownload);

export default router;