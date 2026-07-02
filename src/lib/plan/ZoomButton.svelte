<script lang="ts">
	import { goto } from '$app/navigation'
	import { debounce } from '$lib/debounce'
	import { ctrl } from '$lib/store'
	import { DropDown, urlParam, type TippyInstance } from 'fuma'
	import { ZoomInIcon, ZoomOutIcon } from 'lucide-svelte'
	import { onMount } from 'svelte'

	export let value: number
	export let min: number
	export let max: number
	export let step: number

	let tip: TippyInstance

	function setUrlParam() {
		return goto($urlParam.with({ hourSize: value }), {
			keepFocus: true,
			replaceState: true,
			noScroll: true,
		})
	}

	function onWheel(event: WheelEvent) {
		if (!$ctrl) return
		showDropDown()
		hideDropDown()
		const nextValue = value - event.deltaY / 20
		if (nextValue < min) value = min
		else if (nextValue > max) value = max
		else value = nextValue
	}

	onMount(() => {
		window.addEventListener('wheel', onWheel)
		return () => {
			window.removeEventListener('wheel', onWheel)
		}
	})

	const showDropDown = () => {
		if (tip.state.isVisible) return
		tip.show()
	}
	const hideDropDown = debounce(() => {
		tip.hide()
	}, 400)
</script>

<DropDown
	bind:tip
	tippyProps={{ trigger: 'mouseenter', placement: 'bottom', onHidden: setUrlParam }}
>
	<svelte:fragment slot="activator">
		<div class="join">
			<button
				class="btn btn-sm btn-square join-item"
				on:click={() => (value = Math.max(min, value * 0.75))}
			>
				<ZoomOutIcon size={18} opacity={0.8} />
			</button>
			<button
				class="btn btn-sm btn-square join-item"
				on:click={() => (value = Math.min(max, value * 1.25))}
			>
				<ZoomInIcon size={18} opacity={0.8} />
			</button>
		</div>
	</svelte:fragment>
	<div class="px-2 pt-1">
		<input type="range" class="range" bind:value {min} {max} {step} />
	</div>
</DropDown>
