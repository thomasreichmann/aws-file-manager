import { S3Client } from '@aws-sdk/client-s3';
import { AWS_ACCESS_KEY_ID, AWS_ACCESS_KEY_SECRET } from '$env/static/private';

const s3Client = new S3Client({
	region: 'us-east-1',
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_ACCESS_KEY_SECRET
	}
});

export default s3Client;
