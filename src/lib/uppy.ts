import { Dashboard, Uppy } from 'uppy';
import AwsS3Multipart, { type AwsS3UploadParameters } from '@uppy/aws-s3-multipart';

const uppy = new Uppy().use(AwsS3Multipart, {
	abortMultipartUpload: (file: any, opts: any) => {
		const { uploadId } = opts;
		fetch(`/api/upload/abort?uploadId=${uploadId}`).then((r) => console.log);
	},
	listParts: async (file, opts) => {
		const { uploadId, key } = opts;
		return fetch(`/api/upload/parts?uploadId=${uploadId}&key=${key}`).then((r) => r.json());
	},
	getChunkSize: (file) => {
		// chunk size of 5mb
		return 5 * 1024 * 1024;
	},
	createMultipartUpload: async (file) => {
		const response = await fetch('/api/upload/presign', {
			method: 'POST',
			body: JSON.stringify({ filename: file.name })
		});

		return (await response.json()) as unknown as { uploadId: string; key: string };
	},
	signPart: async (
		file: any,
		opts: { partNumber: any; uploadId: any }
	): Promise<AwsS3UploadParameters> => {
		const { partNumber, uploadId } = opts;
		const response = await fetch(
			`/api/upload/presign?filename=${file.name}&uploadId=${uploadId}&partNumber=${partNumber}`
		);

		return { url: await response.text() };
	},
	completeMultipartUpload: async (file: any, opts: { uploadId: any; parts: any }) => {
		const { uploadId, parts } = opts;

		const response = await fetch(
			`/api/upload/presign?filename=${file.name}&uploadId=${uploadId}&parts=${parts.join(',')}`
		);

		return { location: await response.text() };
	},
	shouldUseMultipart: true
});

export default uppy;
