<script lang="ts">
	import { browser } from '$app/environment';
	import sharkImg from '$lib/assets/shark.svg';
	import Konva from 'konva';
	import { Stage, Layer, Rect, Text, Line, Image as KonvaImage } from 'svelte-konva';
	import { modalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
	import GridModal from '$lib/components/GridModal.svelte';

	const getBase64FromUrl = async (url: string) => {
		const data = await fetch(url);
		const blob = await data.blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.readAsDataURL(blob); 
			reader.onloadend = () => {
				const base64data = reader.result;
				resolve(base64data);
			}
		});
	}

	let stage: Konva.Stage;
	const rectConfig = {
		width: 120,
		height: 120,
		fill: '#c6c7c9',
		cornerRadius: 4,
	}
	let rectConfigArr = [
		{...rectConfig, x: 12, y: 120, id: '1'}, {...rectConfig, x: 136, y: 120, id: '2'}, {...rectConfig, x: 260, y: 120, id: '3'}, {...rectConfig, x: 384, y: 120, id: '4'}, {...rectConfig, x: 508, y: 120, id: '5'},
		{...rectConfig, x: 12, y: 244, id: '6'}, {...rectConfig, x: 136, y: 244, id: '7'}, {...rectConfig, x: 260, y: 244, id: '8'}, {...rectConfig, x: 384, y: 244, id: '9'}, {...rectConfig, x: 508, y: 244, id: '10'},
		{...rectConfig, x: 12, y: 368, id: '11'}, {...rectConfig, x: 136, y: 368, id: '12'}, {...rectConfig, x: 384, y: 368, id: '14'}, {...rectConfig, x: 508, y: 368, id: '15'},
		{...rectConfig, x: 12, y: 492, id: '16'}, {...rectConfig, x: 136, y: 492, id: '17'}, {...rectConfig, x: 260, y: 492, id: '18'}, {...rectConfig, x: 384, y: 492, id: '19'}, {...rectConfig, x: 508, y: 492, id: '20'},
		{...rectConfig, x: 12, y: 616, id: '21'}, {...rectConfig, x: 136, y: 616, id: '22'}, {...rectConfig, x: 260, y: 616, id: '23'}, {...rectConfig, x: 384, y: 616, id: '24'}, {...rectConfig, x: 508, y: 616, id: '25'},
	];

	let imageConfig = {
		x: 260,
		y: 368,
		width: 120,
		height: 120,
	};
	if (browser) {
		let sharkImage = new Image();
		sharkImage.src = sharkImg;
		sharkImage.onload = () => {
			imageConfig = {
				...imageConfig,
				image: sharkImage,
			};
		};
	}

	const gridModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: GridModal,
	};

	async function handleTitleClick(e) {
		const modal: ModalSettings = {
			type: 'prompt',
			title: 'Enter Title',
			body: "Provide the Bingo card's title below.",
			valueAttr: { type: 'text', 'class': 'modal-prompt-input input p-2', required: true },
			response: (r: string) => stage.findOne('#title').text(r),
		}
		modalStore.trigger(modal);
	}

	async function handleGridClick(e, conf) {
		const modal: ModalSettings = {
			type: 'component',
			component: gridModalComponent,
			meta: { config: conf, onCompleteHandler: handleGridComplete },
		};
		modalStore.trigger(modal);
	}

	function handleGridComplete(imgUrl: string, files: FileList, title: string) {
		console.log(imgUrl, files, title);
		if (imgUrl.startsWith('http')) {
			getBase64FromUrl(imgUrl).then((res) => imgUrl = res);
		}
		const config = $modalStore[0].meta?.config;
		const layer: Konva.Layer = stage.findOne('Layer');
		const oldImg = stage.findOne(`#image-${config.id}`);
		if (oldImg) {
			oldImg.destroy();
		}
		const oldText = stage.findOne(`#text-${config.id}`);
		if (oldText) {
			oldText.destroy();
		}
		let imageObj = new Image();
		imageObj.onload = () => {
			let imageGrid = new Konva.Image({
				...config,
				scaleX: 0.8,
				scaleY: 0.8,
				draggable: true,
				fill: '',
				image: imageObj,
				id: `image-${config.id}`,
			});
			layer.add(imageGrid);
			imageGrid.on('dragmove', () => {
				let x = imageGrid.x();
				let y = imageGrid.y();
				let maxX = config.x + config.width - imageGrid.width() * imageGrid.scaleX();
				let maxY = config.y + config.height - imageGrid.height() * imageGrid.scaleY();

				if (x < config.x) {
					imageGrid.x(config.x);
				}
				if (x > maxX) {
					imageGrid.x(maxX);
				}

				if (y < config.y) {
					imageGrid.y(config.y);
				}
				if (y > maxY) {
					imageGrid.y(maxY);
				}
			});
			imageGrid.zIndex(imageGrid.zIndex() - 1);
		};
		imageObj.src = imgUrl;
		let gridTitle = new Konva.Text({
			x: config.x,
			y: config.y + 100,
			width: config.width,
			align: 'center',
			text: title,
			fontSize: 18,
			draggable: true,
			fontFamily: 'system-ui',
			fontStyle: 'bold',
			id: `text-${config.id}`,
		});
		layer.add(gridTitle);
		gridTitle.on('dragmove', () => {
			let x = gridTitle.x();
			let y = gridTitle.y();
			let maxX = config.x + config.width - gridTitle.width() * gridTitle.scaleX();
			let maxY = config.y + config.height - gridTitle.height() * gridTitle.scaleY();

			if (x < config.x) {
				gridTitle.x(config.x);
			}
			if (x > maxX) {
				gridTitle.x(maxX);
			}

			if (y < config.y) {
				gridTitle.y(config.y);
			}
			if (y > maxY) {
				gridTitle.y(maxY);
			}
		});
        modalStore.close();
	}

	function downloadURI(uri: string, name: string) {
		var link = document.createElement('a');
		link.download = name;
		link.href = uri;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		link.remove();
	}

	function handleDownloadClick(ev) {
		let dataURL = stage.toDataURL({ pixelRatio: 2 });
		console.log(dataURL);
		downloadURI(dataURL, 'Bingo.png');
	}
</script>

<div class="container h-full mx-auto flex flex-col justify-center items-center space-y-4">
	<div class="bg-white">
		<Stage config={{ width: 640, height: 748 }} bind:handle={stage}>
			<Layer>
				<Rect config={{ x: 0, y: 0, width: 640, height: 748, fill: 'white' }} />

				<Text config={{ id: 'title', x: 0, y: 40, width: 640, fontSize: 20, padding: 12, align: 'center', text: 'Nice Try After Party CITY WALK BINGO' }}
					  on:pointerenter={(ev) => {stage.container().style.cursor = 'pointer'}}
					  on:pointerleave={(ev) => {stage.container().style.cursor = 'default'}}
					  on:pointerclick={handleTitleClick} />

				<Line config={{ points: [136, 76, 504, 76], stroke: '#ec1c24', strokeWidth: 2, lineCap: 'round' }} />

				<KonvaImage bind:config={imageConfig} />

				{#each rectConfigArr as conf (conf.id)}
					<Rect bind:config={conf}
						  on:pointerenter={(ev) => {stage.container().style.cursor = 'pointer'}}
						  on:pointerleave={(ev) => {stage.container().style.cursor = 'default'}}
						  on:pointerclick={(ev) => {handleGridClick(ev, conf)}} />
				{/each}

			</Layer>
		</Stage>
	</div>
	<div class="flex justify-center space-x-2">
		<button type="button" class="btn-icon variant-filled" title="Reset">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
			</svg>
		</button>
		<button type="button" class="btn variant-filled" title="Download" on:click={handleDownloadClick}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
			</svg>
			<span>Download</span>
		</button>
	</div>
</div>
