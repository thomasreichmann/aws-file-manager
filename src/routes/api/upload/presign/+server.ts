// src/routes/api/presign-url.ts

import {
	S3Client,
	CreateMultipartUploadCommand,
	GetObjectCommand,
	UploadPartCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { RequestHandler } from '@sveltejs/kit';
import { AWS_ACCESS_KEY_SECRET, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME } from '$env/static/private';
import s3Client from '$lib/s3';

export const POST: RequestHandler = async ({ request }) => {
	const { filename } = await request.json();

	const createMultipartUploadCommand = new CreateMultipartUploadCommand({
		Bucket: AWS_BUCKET_NAME,
		Key: filename
	});

	const upload = await s3Client.send(createMultipartUploadCommand);

	let responseBody = {
		uploadId: upload.UploadId,
		key: filename
	};

	return new Response(JSON.stringify(responseBody));
};

export const GET: RequestHandler = async ({ url }) => {
	const filename = url.searchParams.get('filename');
	const uploadId = url.searchParams.get('uploadId');
	const partNumber = Number(url.searchParams.get('partNumber'));

	if (!filename || !uploadId || !partNumber) {
		return new Response('Missing required query parameters', { status: 400 });
	}

	const uploadPartCommand = new UploadPartCommand({
		Bucket: AWS_BUCKET_NAME,
		Key: filename,
		UploadId: uploadId,
		PartNumber: partNumber
	});

	const signedUrl = await getSignedUrl(s3Client, uploadPartCommand, {
		expiresIn: 24 * 60 * 60
	});

	return new Response(signedUrl);
};
