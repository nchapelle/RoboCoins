import 'dotenv/config';

function opt(key: string): string | undefined {
  return process.env[key];
}
function req(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env ${key}`);
  return v;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  JWT_SECRET: req('JWT_SECRET'),
  DATABASE_URL: req('DATABASE_URL'),
  GCP_PROJECT_ID: opt('GCP_PROJECT_ID'),
  GCS_BUCKET: req('GCS_BUCKET')
};