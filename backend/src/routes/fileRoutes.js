import express from 'express';
import { generateUploadUrl, verifyAndDownload } from '../controllers/fileController.js';

const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'online' }));
router.post('/upload', generateUploadUrl);
router.post('/download/:id', verifyAndDownload);

export default router;