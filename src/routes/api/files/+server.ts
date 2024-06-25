/**
 * Handle file management, including but not limited to:
 * - Listing files
 * - Deleting files
 * - Checking file storage category
 * - Modify the storage category of a file
 */
import type { RequestHandler } from '@sveltejs/kit';
import { ListMultipartUploadsCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { AWS_BUCKET_NAME } from '$env/static/private';
import s3Client from '$lib/s3';

/**
 * List all files in s3 bucket
 */
export const GET: RequestHandler = async ({ params }) => {
	const command = new ListObjectsCommand({ Bucket: AWS_BUCKET_NAME });

	const response = await s3Client.send(command);

	return new Response(JSON.stringify(response.Contents));
};
