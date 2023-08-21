<script lang="ts">
    import { FileButton, Stepper, Step, modalStore } from '@skeletonlabs/skeleton';

    let locked = true;
    let files: FileList;
    let imgUrl: string;
    let title: string;

    function onChangeHandler(e: Event): void {
        console.log(e);
        if (e.target.name === 'files') {
            imgUrl = files ? URL.createObjectURL(files[0]) : '';
        }
    }

    function onCompleteHandler() {
        $modalStore[0].meta?.onCompleteHandler(imgUrl, files, title);
	}

    $: locked = imgUrl ? false : true;
</script>

<div class="card flex flex-col p-4 w-modal">
    <header class="card-header">Settings</header>
    <section class="p-4">
        <Stepper on:complete={onCompleteHandler}>
            <Step bind:locked={locked}>
                <svelte:fragment slot="header">Image</svelte:fragment>
                <div class="flex justify-between items-center space-x-2">
                    <input class="input p-2" type="text" placeholder="Paste link to an image..." on:change={onChangeHandler} bind:value={imgUrl} />
                    <div>OR</div>
                    <FileButton
                        name="files"
                        accept="image/*"
                        button="variant-soft-error"
                        bind:files={files}
                        on:change={onChangeHandler}>Upload</FileButton>
                </div>
                {#if imgUrl}
                    <div class="flex justify-center">
                        <img src={imgUrl} alt="Uploaded image" class="max-w-full h-36">
                    </div>
                {/if}
            </Step>
            <Step>
                <svelte:fragment slot="header">Description</svelte:fragment>
                <input class="input p-2" type="text" placeholder="Say something..." bind:value={title} />
            </Step>
        </Stepper>
    </section>
</div>
