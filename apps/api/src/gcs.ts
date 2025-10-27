import { Storage } from '@google-cloud/storage';
import { env } from './env.js';
import crypto from 'crypto';

const storage = new Storage({
  projectId: env.GCP_PROJECT_ID,
  credentials: {
    client_email: env.GCP_CLIENT_EMAIL,
    private_key: env.GCP_PRIVATE_KEY
  }
});

const bucket = storage.bucket(env.GCS_BUCKET);

export async function getSignedUploadUrl(
  prefix: string,
  contentType: string
): Promise<{ url: string; objectName: string }> {
  const objectName = `${prefix}/${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const file = bucket.file(objectName);
  const [url] = await file.getSignedUrl({
    action: 'write',
    expires: Date.now() + 10 * 60 * 1000,
    contentType
  });
  return { url, objectName };
}

export function publicUrl(objectName: string) {
  return `https://storage.googleapis.com/${env.GCS_BUCKET}/${objectName}`;
}