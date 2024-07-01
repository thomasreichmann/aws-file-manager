import type { RequestHandler } from '@sveltejs/kit';

import { AWS_BUCKET_NAME } from '$env/static/private';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
	type _Object,
	GetObjectCommand,
	HeadObjectCommand,
	RestoreObjectCommand
} from '@aws-sdk/client-s3';
import s3 from '$lib/s3';
import s3Client from '$lib/s3';

export const GET: RequestHandler = async ({ params }) => {
	const key = params.key;
	if (!key) return new Response('Missing key in URL', { status: 400 });

	const result = await getObjectUrl(key);

	if (result.status === 'error') return new Response(result.message, { status: 500 });

	return new Response(JSON.stringify(result));
};

const getObjectUrl = async (key: string) => {
	try {
		// Check the object's storage class
		const headCommand = new HeadObjectCommand({ Bucket: AWS_BUCKET_NAME, Key: key });
		const headObject = await s3.send(headCommand);

		if (headObject.StorageClass === 'DEEP_ARCHIVE' || headObject.StorageClass === 'GLACIER') {
			// Check if the object has an ongoing or completed restore request
			if (headObject.Restore) {
				const restoreStatus = headObject.Restore.includes('ongoing-request="true"')
					? 'in-progress'
					: 'completed';
				if (restoreStatus === 'completed') {
					// Generate a presigned URL if restore is completed
					const presignedUrl = await getSignedUrl(
						s3Client,
						new GetObjectCommand({ Bucket: AWS_BUCKET_NAME, Key: key }),
						{ expiresIn: 3600 }
					);
					return { status: 'success', url: presignedUrl };
				} else {
					return { status: 'restore-in-progress' };
				}
			} else {
				const restoreCommand = new RestoreObjectCommand({
					Bucket: AWS_BUCKET_NAME,
					Key: key,
					RestoreRequest: {
						Days: 1 // specify the number of days to keep the restored copy
					}
				});
				await s3.send(restoreCommand);
				return { status: 'restore-initiated' };
			}
		} else {
			// If the object is not in DEEP_ARCHIVE or GLACIER, generate a presigned URL
			const presignedUrl = await getSignedUrl(
				s3,
				new GetObjectCommand({ Bucket: AWS_BUCKET_NAME, Key: key }),
				{ expiresIn: 3600 }
			);
			return { status: 'success', url: presignedUrl };
		}
	} catch (error: any) {
		return { status: 'error', message: error.message };
	}
};
