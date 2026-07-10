<script lang="ts">
	import { goto } from '$app/navigation'
	import { debounce } from '$lib/debounce'
	import { ctrl } from '$lib/store'
	import { DropDown, urlParam, type TippyInstance } from 'fuma'
	import { ZoomInIcon, ZoomOutIcon } from 'lucide-svelte'
	import { onMount } from 'svelte'
	import type { Plan } from './types'

	export let plan: Plan
	export let min: number
	export let max: number
	export let step: number

	let tip: TippyInstance

	function setUrlParam() {
		return goto($urlParam.with({ hourSize: plan.hourSize }), {
			keepFocus: true,
			replaceState: true,
			noScroll: true,
		})
	}

	function onWheel(event: WheelEvent) {
		if (!$ctrl) return
		showDropDown()
		hideDropDown()
		const nextValue = plan.hourSize - event.deltaY / 20
		if (nextValue < min) plan.setHourSize(min)
		else if (nextValue > max) plan.setHourSize(max)
		else plan.setHourSize(nextValue)
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
				on:click={() => (plan.hourSize = Math.max(min, plan.hourSize * 0.75))}
			>
				<ZoomOutIcon size={18} opacity={0.8} />
			</button>
			<button
				class="btn btn-sm btn-square join-item"
				on:click={() => (plan.hourSize = Math.min(max, plan.hourSize * 1.25))}
			>
				<ZoomInIcon size={18} opacity={0.8} />
			</button>
		</div>
	</svelte:fragment>
	<div class="px-2 pt-1">
		<input type="range" class="range" bind:value={plan.hourSize} {min} {max} {step} />
	</div>
</DropDown>
