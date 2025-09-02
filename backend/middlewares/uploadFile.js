import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3"; // Use AWS SDK v3 S3Client

// Set up AWS SDK v3 S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer configuration for multiple files (e.g., images or PDFs)
export const upload = multer({
  storage: multerS3({
    s3: s3Client, // Use the AWS SDK v3 S3Client
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read", // Access control
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileType = file.mimetype.split('/')[1];
      cb(null, `studyMaterial/${Date.now()}-${file.originalname}`);
    },
  }),
});
