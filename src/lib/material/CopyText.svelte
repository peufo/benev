<script lang="ts">
	import { mdiContentCopy } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { useNotify } from '$lib/notify'

	export let label: string
	export let value: string

	const notify = useNotify()

	function handleClick() {
		navigator.clipboard
			.writeText(value)
			.then(() => {
				notify.success(`${label} copié`)
			})
			.catch((error) => {
				notify.error(error)
			})
	}
</script>

<div class="form-control">
	<div class="label">
		<div class="label-text">{label}</div>
	</div>
	<div class="join">
		<input type="text" {value} readonly class="input-bordered input join-item w-full" />
		<button on:click|preventDefault={handleClick} class="join-item btn btn-square">
			<Icon path={mdiContentCopy} title="Copier" tippyTargetParent />
		</button>
	</div>
</div>
