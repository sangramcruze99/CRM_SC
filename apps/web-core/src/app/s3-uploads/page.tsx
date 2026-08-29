import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { S3UploadsClient } from './S3UploadsClient';

export const dynamic = 'force-dynamic';

export default async function S3UploadsPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3020/s3-uploads',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <S3UploadsClient initialFiles={items} />;
}
