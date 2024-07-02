// src/routes/api/presign-url.ts

import {
	S3Client,
	CreateMultipartUploadCommand,
	GetObjectCommand,
	UploadPartCommand,
	CompleteMultipartUploadCommand,
	AbortMultipartUploadCommand,
	type CreateMultipartUploadCommandOutput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { RequestHandler } from '@sveltejs/kit';
import { AWS_ACCESS_KEY_SECRET, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME } from '$env/static/private';
import s3Client from '$lib/s3';
import type { AwsS3Part } from '@uppy/aws-s3-multipart';

interface CreateMultipartUploadResponse {
	uploadId: string;
	key: string;
}
export const POST: RequestHandler = async ({ request }) => {
	const { filename, storageClass } = await request.json();

	const createMultipartUploadCommand = new CreateMultipartUploadCommand({
		Bucket: AWS_BUCKET_NAME,
		Key: filename,
		StorageClass: storageClass ?? 'STANDARD'
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

	if (!filename || !uploadId || partNumber == undefined) {
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

export const PUT: RequestHandler = async ({ request }) => {
	const {
		uploadId,
		parts,
		filename
	}: { parts: AwsS3Part[]; uploadId: string; filename: string } = await request.json();

	if (!uploadId || !parts || !filename) {
		return new Response('Missing required parameters', { status: 400 });
	}

	const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
		Bucket: AWS_BUCKET_NAME,
		Key: filename,
		UploadId: uploadId,
		MultipartUpload: {
			Parts: parts.map((part, index) => ({
				ETag: part.ETag,
				PartNumber: index + 1
			}))
		}
	});

	const completeUploadResponse = await s3Client.send(completeMultipartUploadCommand);

	return new Response(
		JSON.stringify({ message: completeUploadResponse.$metadata.httpStatusCode })
	);
};

export const DELETE: RequestHandler = async ({ url }) => {
	const uploadId = url.searchParams.get('uploadId');
	const key = url.searchParams.get('key');

	if (!uploadId || !key) {
		return new Response('Missing required query parameters', { status: 400 });
	}

	const abortMultipartUploadCommand = new AbortMultipartUploadCommand({
		Bucket: AWS_BUCKET_NAME,
		Key: key,
		UploadId: uploadId
	});

	let response = await s3Client.send(abortMultipartUploadCommand);

	return new Response('Multipart upload aborted successfully');
};
