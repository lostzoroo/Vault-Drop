import crypto from 'crypto';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws.js';
import { config } from '../config/env.js';
import { File } from '../models/File.js';


export const generateUploadUrl = async (req, res, next) => {
  try {
    const { originalName, password, expiresInMinutes } = req.body;

    if (!originalName || !password || !expiresInMinutes) {
      res.status(400);
      throw new Error('Please provide filename, password, and expiration time.');
    }

    const s3Key = `${crypto.randomBytes(16).toString('hex')}-${originalName.replace(/\s+/g, '_')}`;
    
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const fileRecord = await File.create({
      originalName,
      s3Key,
      password,
      expiresAt,
    });

    const command = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: s3Key,
      ContentType: 'application/octet-stream', // Generic binary stream
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    res.status(201).json({
      success: true,
      data: {
        fileId: fileRecord._id,
        uploadUrl,
        expiresAt: fileRecord.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const verifyAndDownload = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { id } = req.params;

    if (!password) {
      res.status(400);
      throw new Error('Password is required to decrypt this vault.');
    }

    const fileRecord = await File.findById(id);

    if (!fileRecord) {
      res.status(404);
      throw new Error('File not found or has been destroyed by TTL.');
    }

    if (fileRecord.isDownloaded) {
      res.status(403);
      throw new Error('This file has already been downloaded and the link is burned.');
    }

    const isMatch = await fileRecord.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid password.');
    }

    const command = new GetObjectCommand({
      Bucket: config.aws.bucketName,
      Key: fileRecord.s3Key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    fileRecord.isDownloaded = true;
    await fileRecord.save();

    res.status(200).json({
      success: true,
      data: {
        originalName: fileRecord.originalName,
        downloadUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};