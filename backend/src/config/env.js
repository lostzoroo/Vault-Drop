import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = [
  'MONGO_URI',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET_NAME'
];

requiredEnvs.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: Environment variable ${envVar} is not defined.`);
    process.exit(1);
  }
});

export const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_S3_BUCKET_NAME,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};