<script lang="ts">
	import { mdiContentCopy } from '@mdi/js'
	import { Icon } from '$lib/material'

	export let label: string
	export let value: string
</script>

<div class="form-control">
	<div class="label">
		<div class="label-text">{label}</div>
	</div>
	<div class="join">
		<input type="text" {value} readonly class="input-bordered input join-item w-full" />
		<div class="join-item btn btn-square btn-neutral">
			<Icon path={mdiContentCopy} title="Copier" tippyTargetParent/>
		</div>
	</div>
</div>
