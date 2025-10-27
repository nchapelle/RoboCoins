import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { getSignedUploadUrl, publicUrl } from '../gcs.js';

export const upload = Router();

// GET /upload/sign?type=reward|chore&contentType=image/png
upload.get('/sign', requireAuth, async (req, res) => {
  const type = String(req.query.type || 'misc');
  const contentType = String(req.query.contentType || 'image/jpeg');
  const prefix = `${req.user!.orgId}/${type}`;
  const { url, objectName } = await getSignedUploadUrl(prefix, contentType);
  res.json({ url, objectName, publicUrl: publicUrl(objectName) });
});