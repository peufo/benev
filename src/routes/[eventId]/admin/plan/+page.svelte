<script lang="ts">
	import {
		mdiArrowCollapse,
		mdiArrowExpand,
		mdiMagnifyMinusOutline,
		mdiMagnifyPlusOutline,
	} from '@mdi/js'
	import { Icon, InputCheckboxsMenu } from '$lib/material'
	import { Plan } from '$lib/plan'
	import { onMount } from 'svelte'

	export let data

	onMount(() => {
		const updateFullscreenState = () => {
			isFullscreen = document.fullscreenElement === wrapper
		}
		document.addEventListener('fullscreenchange', updateFullscreenState)
		return () => {
			document.removeEventListener('fullscreenchange', updateFullscreenState)
		}
	})

	let scale = 6
	const scales = [1, 2, 6, 12, 24]
	const zoom = (() => {
		let index = scales.indexOf(scale) || 3
		return {
			in: () => {
				if (!scales[index + 1]) return
				scale = scales[++index]
			},
			out: () => {
				if (!scales[index - 1]) return
				scale = scales[--index]
			},
		}
	})()

	let wrapper: HTMLDivElement
	let isFullscreen = false
	async function toggleFullscreen() {
		if (isFullscreen) await document.exitFullscreen()
		else await wrapper.requestFullscreen()
	}
</script>

<div
	class="flex flex-col gap-3 bg-base-100"
	bind:this={wrapper}
	class:pl-4={isFullscreen}
	class:pt-4={isFullscreen}
>
	<div class="flex gap-3" class:pr-4={isFullscreen}>
		<div class="grow" />

		<InputCheckboxsMenu
			key="teams"
			label="secteurs"
			options={data.teams.map((t) => ({ value: t.id, label: t.name }))}
			enhanceDisabled
			badgePrimary
		/>

		<!-- ZOOM -->
		<div class="join">
			<button
				class="btn btn-square btn-sm join-item"
				on:click={zoom.out}
				disabled={scale <= scales[0]}
			>
				<Icon path={mdiMagnifyMinusOutline} />
			</button>
			<button
				class="btn btn-square btn-sm join-item"
				on:click={zoom.in}
				disabled={scale >= scales[scales.length - 1]}
			>
				<Icon path={mdiMagnifyPlusOutline} />
			</button>
		</div>

		<!-- Full screen -->
		<button class="btn btn-square btn-sm join-item" on:click={toggleFullscreen}>
			{#if isFullscreen}
				<Icon
					path={mdiArrowCollapse}
					title="Quitter le mode plein écran"
					tippyProps={{ appendTo: 'parent' }}
				/>
			{:else}
				<Icon
					path={mdiArrowExpand}
					title="Ouvrir le mode plein écran"
					tippyProps={{ appendTo: 'parent' }}
				/>
			{/if}
		</button>
	</div>

	<Plan teams={data.teams_periods} {scale} />
</div>
