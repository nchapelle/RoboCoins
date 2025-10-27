import { Storage } from '@google-cloud/storage';
import { env } from './env.js';
import crypto from 'crypto';

// Using ADC: no explicit credentials block
const storage = new Storage(env.GCP_PROJECT_ID ? { projectId: env.GCP_PROJECT_ID } : {});
const bucket = storage.bucket(env.GCS_BUCKET);

// Note: Signed URLs created by GCS require service account to have
// serviceAccountTokenCreator on itself in some contexts. If that’s an issue,
// switch to V4 signed URLs with `version: 'v4'` (default) and ensure the
// service account has storage.objects.create for PUTs.

export async function getSignedUploadUrl(
  prefix: string,
  contentType: string
): Promise<{ url: string; objectName: string }> {
  const objectName = `${prefix}/${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const file = bucket.file(objectName);
  const [url] = await file.getSignedUrl({
    action: 'write',
    version: 'v4',
    expires: Date.now() + 10 * 60 * 1000,
    contentType
  });
  return { url, objectName };
}

export function publicUrl(objectName: string) {
  return `https://storage.googleapis.com/${env.GCS_BUCKET}/${objectName}`;
}