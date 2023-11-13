<script lang="ts">
	import { mdiLinkVariant } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { useNotify } from '$lib/notify'

	export let path: string

	const notify = useNotify()

	function handleClick() {
		navigator.clipboard
			.writeText(`https://benev.io${path}`)
			.then(() => {
				notify.success(`Lien copié`)
			})
			.catch((error) => {
				notify.error(error)
			})
	}
</script>

<button on:click|preventDefault={handleClick} class="btn btn-square btn-sm btn-ghost">
	<Icon path={mdiLinkVariant} title="Copier le lien" size={22} />
</button>
