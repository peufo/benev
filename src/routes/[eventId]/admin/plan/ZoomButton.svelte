<script lang="ts">
	import { goto } from '$app/navigation'
	import { mdiMagnifyPlusOutline, mdiMinus, mdiPlus } from '@mdi/js'
	import { DropDown, Icon, urlParam } from 'fuma'

	export let value: number
	export let min: number
	export let max: number
	export let step: number

	function setUrlParam() {
		return goto($urlParam.with({ hourSize: value }), {
			keepFocus: true,
			replaceState: true,
			noScroll: true,
		})
	}
</script>

<DropDown tippyProps={{ trigger: 'mouseenter', placement: 'bottom', onHidden: setUrlParam }}>
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
