/**
 * Handle file management, including but not limited to:
 * - Listing files
 * - Deleting files
 * - Checking file storage category
 * - Modify the storage category of a file
 */
import type { RequestHandler } from '@sveltejs/kit';
import {
	type _Object,
	CopyObjectCommand,
	DeleteObjectCommand,
	ListMultipartUploadsCommand,
	ListObjectsCommand,
	PutObjectCommand,
	S3ServiceException
} from '@aws-sdk/client-s3';
import { AWS_BUCKET_NAME } from '$env/static/private';
import s3Client from '$lib/s3';

/**
 * List all files in s3 bucket
 */
export const GET: RequestHandler = async ({ params }) => {
	const command = new ListObjectsCommand({ Bucket: AWS_BUCKET_NAME });

	const response = await s3Client.send(command);

	return new Response(JSON.stringify(response.Contents ?? []));
};

export const PUT: RequestHandler = async ({ request, url }) => {
	const file: Required<_Object> = await request.json();

	// In the case where we don't receive a "original" key, we assume it is just a class change, and use the file key as the original.
	let originalKey = url.searchParams.get('key');
	if (!originalKey) originalKey = file.Key;

	const command = new CopyObjectCommand({
		Bucket: AWS_BUCKET_NAME,
		CopySource: encodeURIComponent(`${AWS_BUCKET_NAME}/${originalKey}`),
		Key: file.Key,
		StorageClass: file.StorageClass
	});

	const response = await s3Client.send(command);

	// if we are also renaming the object, we need to remove the original one after making the copy
	if (originalKey != file.Key) {
		try {
			await s3Client.send(
				new DeleteObjectCommand({
					Bucket: AWS_BUCKET_NAME,
					Key: originalKey
				})
			);
		} catch (e: any) {
			// There needs to be some extra error handling, since there can't be a case where the copy is made and the original one remains.
			// On the actual mvp, we could try to remove it from aws, if it fails, we change the object lifecycle to make it auto-delete and
			// remove it from the user's 'files' in our db so that it doesn't show anymore in the listing
			return new Response(e.message ?? 'unknown error', { status: 500 });
		}
	}

	return new Response(JSON.stringify(response));
};

export const DELETE: RequestHandler = async ({ url }) => {
	const Key = url.searchParams.get('key');
	if (!Key) return new Response('Missing key in url params', { status: 400 });
	const command = new DeleteObjectCommand({ Bucket: AWS_BUCKET_NAME, Key });

	const res = await s3Client.send(command);

	return new Response(JSON.stringify(res.$metadata));
};
