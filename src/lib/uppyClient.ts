import AwsS3Multipart, { type AwsS3UploadParameters } from '@uppy/aws-s3-multipart';
import Uppy, { type AddFileOptions, type IndexedObject, type UppyFile } from '@uppy/core';

const uppyClient = new Uppy().use(AwsS3Multipart, {
    abortMultipartUpload: (file: any, opts: any) => {
        const { uploadId } = opts;
        fetch(`/api/upload/presign?uploadId=${uploadId}`).then((r) => console.log);
    },
    listParts: async (file, opts) => {
        const { uploadId, key } = opts;
        return fetch(`/api/upload/parts?uploadId=${uploadId}&key=${key}`, {
            method: 'DELETE'
        }).then((r) => r.json());
    },
    getChunkSize: (file) => {
        // chunk size of 5mb
        return 50 * 1024 * 1024;
    },
    createMultipartUpload: async (file) => {
        const response = await fetch('/api/upload/presign', {
            method: 'POST',
            body: JSON.stringify({ filename: file.name })
        });

        return (await response.clone().json()) as unknown as { uploadId: string; key: string };
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
    completeMultipartUpload: async (file, { uploadId, parts }) => {
        const response = await fetch('/api/upload/presign', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uploadId, parts, filename: file.name })
        });

        const data = await response.json();
        return { location: data.location };
    },
    shouldUseMultipart: true
});

export default uppyClient;

export const convertToUppyFile = (file: File): AddFileOptions => {
    return {
        name: file.name,
        size: file.size,
        data: file
    };
};

export const convertToUppyFiles = (files: FileList): AddFileOptions<Record<string, unknown>>[] => {
    return Array.from(files).map(convertToUppyFile);
};
