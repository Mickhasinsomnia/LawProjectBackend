import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
import crypto from 'crypto';
import sharp from 'sharp';

dotenv.config({ path: "./config/config.env" });

console.log("Region:", process.env.AWS_BUCKET_REGION);

const bucketName = process.env.AWS_BUCKET_NAME!;
const region = process.env.AWS_BUCKET_REGION!;
const accessKeyId = process.env.GD_AWS_ACCESS_KEY!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
}

async function uploadFile(file: UploadedFile, fileName: string, mimetype: string) {
  let fileBuffer;

   if (mimetype.startsWith("image/")) {
     fileBuffer = await sharp(file.buffer)
       .resize({ height: 1080, width: 1920, fit: "contain" })
       .toBuffer();
   } else if (mimetype === "application/pdf") {
     fileBuffer = file.buffer;
   } else {
     throw new Error("Unsupported file type");
   }

  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype
  };

  return s3Client.send(new PutObjectCommand(uploadParams));
}

function deleteFile(fileName:string) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName
  };

  return s3Client.send(new DeleteObjectCommand(deleteParams));
}

async function getObjectSignedUrl(key:string) {
  const params = {
    Bucket: bucketName,
    Key: key
  };

  const command = new GetObjectCommand(params);
  const seconds = 3600;
  const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });

  return url;
}

function generateFileName(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}


export {
  uploadFile,
  deleteFile,
  getObjectSignedUrl,
  generateFileName
};
