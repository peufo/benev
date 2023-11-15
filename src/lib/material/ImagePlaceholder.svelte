<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import Icon from './Icon.svelte'

	export let x: number
	export let y: number
</script>

<div style:width="{x}px" style:height="{y}px" class="bg-base-200 p-2">
	<div class="grid content-center w-full h-full rounded-md border-dashed border-4">
		<span class="text-sm font-medium text-base-content/60">
			<slot>Pas d'image</slot>
		</span>
		<Icon path={mdiPlus} size={30} class="fill-base-content/60" />
	</div>
</div>
