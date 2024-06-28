<script lang="ts">
	import { goto } from '$app/navigation'
	import { debounce } from '$lib/debounce'
	import { ctrl } from '$lib/store'
	import { mdiMagnifyPlusOutline, mdiMinus, mdiPlus } from '@mdi/js'
	import { DropDown, Icon, urlParam, type TippyInstance } from 'fuma'
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
		event.preventDefault()
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
	<button slot="activator" class="btn btn-sm btn-square">
		<Icon path={mdiMagnifyPlusOutline} />
	</button>

	<div class="flex gap-2 items-center">
		<button class="btn btn-sm btn-square" on:click={() => (value = Math.max(min, value * 0.75))}>
			<Icon path={mdiMinus} />
		</button>
		<input type="range" class="range" bind:value {min} {max} {step} />
		<button class="btn btn-sm btn-square" on:click={() => (value = Math.min(max, value * 1.25))}>
			<Icon path={mdiPlus} />
		</button>
	</div>
</DropDown>
