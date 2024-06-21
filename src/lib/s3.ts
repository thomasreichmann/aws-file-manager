import { S3Client } from '@aws-sdk/client-s3';
import { AWS_ACCESS_KEY_ID, AWS_ACCESS_KEY_SECRET, AWS_DEFAULT_REGION } from '$env/static/private';

const s3Client = new S3Client({
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_ACCESS_KEY_SECRET
	},
	region: AWS_DEFAULT_REGION
});

export default s3Client;
