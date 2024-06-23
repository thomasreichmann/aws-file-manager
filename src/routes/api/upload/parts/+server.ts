// src/routes/api/upload/+server.ts

import { S3Client, ListPartsCommand } from '@aws-sdk/client-s3';
import type { RequestHandler } from '@sveltejs/kit';
import s3Client from '$lib/s3';
import { AWS_BUCKET_NAME } from '$env/static/private';

export const GET: RequestHandler = async ({ url }) => {
	const uploadId = url.searchParams.get('uploadId');
	const key = url.searchParams.get('key');

	if (!uploadId || !key) {
		return new Response('Missing required query parameters', { status: 400 });
	}

	const listPartsCommand = new ListPartsCommand({
		Bucket: AWS_BUCKET_NAME,
		Key: key,
		UploadId: uploadId
	});

	const awsResponse = await s3Client.send(listPartsCommand);

	return new Response(JSON.stringify(awsResponse.Parts));
};
