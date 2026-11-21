import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
  // Required for path-style access when using a custom endpoint
  forcePathStyle: !!process.env.S3_ENDPOINT,
});

const BUCKET = process.env.S3_BUCKET ?? "";

export interface UploadedAsset {
  key: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Upload a single file buffer to S3 and return its metadata.
 */
export async function uploadAsset(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  projectId: string
): Promise<UploadedAsset> {
  const ext = fileName.split(".").pop() ?? "bin";
  const key = `projects/${projectId}/assets/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Objects are private; generate signed URLs or use CloudFront for access
    })
  );

  // Build a public-ish URL — adjust if you use CloudFront or signed URLs
  const endpoint = process.env.S3_ENDPOINT ?? `https://s3.${process.env.S3_REGION ?? "us-east-1"}.amazonaws.com`;
  const url = `${endpoint}/${BUCKET}/${key}`;

  return {
    key,
    url,
    name: fileName,
    type: mimeType,
    size: buffer.byteLength,
  };
}
