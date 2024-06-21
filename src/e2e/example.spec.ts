import { test, expect } from '@playwright/test';
import uppy from '$lib/uppy';

test.describe('Uppy S3 Multipart Upload', () => {
	test('should upload file to S3 using presigned URLs and multipart', async () => {
		const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

		uppy.addFile({
			name: 'test-file.txt',
			type: 'text/plain',
			data: file
		});

		const result = await uppy.upload();

		expect(result.successful.length).toBe(1);
		expect(result.successful[0].name).toBe('test-file.txt');
	});
});
