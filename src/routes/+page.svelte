<script lang="ts">
    import uppyClient, { convertToUppyFiles } from '$lib/uppyClient.js';
    import { formatBytes } from '$lib/utils.js';
    import { FileButton } from '@skeletonlabs/skeleton';
    import type { UploadResult } from '@uppy/core';
    import type { FileDetails } from '$lib/types';

    let files: FileList;

    let uploadResult: UploadResult; // Didn't find a way to import the type for this, but it is UploadResult from uppyClient
    let uploadProgress = 0;

    let previousUploadedBytes = 0;
    let previousTime = 0;
    let uploadSpeed = 0;

    async function uploadFile(files: FileList, chunkSize: number = 1024 * 1024 * 2) {
        if (!files.length) return;

        uppyClient.addFiles(convertToUppyFiles(files));

        // Listen for progress updates
        uppyClient.on('upload-progress', (file, progress) => {
            uploadProgress = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100);

            // Calculate the current upload speed
            const currentTime = Date.now();
            const timeElapsed = (currentTime - previousTime) / 1000; // in seconds
            const bytesUploaded = progress.bytesUploaded - previousUploadedBytes;

            if (timeElapsed > 0) {
                uploadSpeed = bytesUploaded / timeElapsed; // in bytes per second
            }

            previousUploadedBytes = progress.bytesUploaded;
            previousTime = currentTime;
        });

        uppyClient.on('complete', (result) => {
            uploadResult = result;
            uploadProgress = 100;
        });

        await uppyClient.upload();
    }

    function getFileDetails(file: FileList): FileDetails[];
    function getFileDetails(file: File): FileDetails;
    function getFileDetails(file: File | FileList) {
        if (file instanceof FileList) {
            return Array.from(file).map(getFileDetails);
        }

        return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        };
    }
</script>

<main class="h-full w-full flex-col gap-6 flex items-center justify-center">
    <div class="flex gap-2">
        <FileButton name="files" multiple bind:files />
        <button class="btn variant-filled" on:click={() => uploadFile(files)}>Upload</button>
        <button class="btn variant-filled-error" on:click={() => uppyClient.cancelAll()}>
            Abort
        </button>
    </div>

    <div>
        {#if files}
            <p>{files.length} file(s) selected</p>
            <p>
                Total size: {formatBytes(
                    Array.from(files).reduce((acc, file) => acc + file.size, 0)
                )}
            </p>
            <!--file info-->
            <!--			<pre class="pre">{JSON.stringify(getFileDetails(files))}</pre>-->
        {:else}
            No files selected
        {/if}
    </div>

    <div class="flex flex-col gap-2">
        {#if uploadProgress > 0}
            <p>Upload Progress: {uploadProgress}%</p>
        {/if}

        {#if uploadSpeed > 0}
            <p>Upload Speed: {formatBytes(uploadSpeed)}/s</p>
        {/if}

        {#if uploadResult}
            <h1>
                {JSON.stringify(uploadResult, null, 2)}
            </h1>
        {/if}
    </div>
</main>
